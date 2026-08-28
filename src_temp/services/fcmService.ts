import { Platform, PermissionsAndroid } from 'react-native';
import { apiClient } from '../api/client';
import { storageService } from '../services/storageService';

// Must match:
//  - `channelId` sent by backend/src/services/FCMNotificationService.ts
//  - `com.google.firebase.messaging.default_notification_channel_id` in AndroidManifest.xml
// If these three disagree, Android silently drops the notification on API 26+.
export const FCM_CHANNEL_ID = 'pulse_messages_channel';

function loadMessaging(): any | null {
  try {
    // Lazily required so the app still boots if the native module is absent.
    return require('@react-native-firebase/messaging').default;
  } catch {
    console.warn(
      '⚠️ @react-native-firebase/messaging is not installed. Push notifications are disabled.\n' +
        '   Fix: npm i @react-native-firebase/app @react-native-firebase/messaging && npx react-native run-android'
    );
    return null;
  }
}

export class FCMClientService {
  private static deviceToken: string | null = null;
  private static lastSyncedToken: string | null = null;
  private static refreshUnsubscribe: (() => void) | null = null;
  private static inFlight: Promise<string | null> | null = null;

  /**
   * Ask for notification permission, fetch the real FCM registration token and
   * persist it on the user's backend profile. Safe to call repeatedly — it
   * de-duplicates concurrent calls and skips re-uploading an unchanged token.
   */
  static async requestUserPermissionAndGetToken(): Promise<string | null> {
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.doRegister().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private static async doRegister(): Promise<string | null> {
    const messaging = loadMessaging();
    if (!messaging) return null;

    try {
      // Android 13 (API 33+) requires the POST_NOTIFICATIONS runtime permission.
      // Without it getToken() still succeeds but nothing is ever displayed.
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('❌ POST_NOTIFICATIONS denied — notifications will not be shown.');
          // Continue anyway: the token is still useful for data-only messages.
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ FCM notification permission not granted by user.');
        return null;
      }

      // iOS must be registered for remote messages before a token exists.
      if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();
      if (!token) {
        console.warn('❌ Firebase Cloud Messaging did not return an FCM token.');
        return null;
      }

      this.deviceToken = token;
      console.log('📱 FCM device token obtained:', `${token.substring(0, 24)}…`);

      await this.registerTokenWithBackend(token);
      this.setupTokenRefreshListener(messaging);

      return token;
    } catch (error: any) {
      console.error('❌ FCM initialization error:', error?.message || error);
      return null;
    }
  }

  /** Sync device token onto the authenticated user's backend profile. */
  private static async registerTokenWithBackend(token: string, attempt = 1): Promise<void> {
    // The PUT is behind authMiddleware — without a JWT it 401s and the token is
    // silently lost. Retry briefly in case registration raced the login write.
    const jwt = storageService.getItemSync('pulse_auth_token');
    if (!jwt) {
      if (attempt <= 3) {
        console.log(`⏳ No auth token yet, retrying FCM sync (attempt ${attempt}/3)…`);
        await new Promise<void>((r) => setTimeout(() => r(), 1000 * attempt));
        return this.registerTokenWithBackend(token, attempt + 1);
      }
      console.warn('⚠️ Skipping FCM token sync: user is not authenticated.');
      return;
    }

    if (this.lastSyncedToken === token) {
      return; // already persisted, nothing changed
    }

    try {
      const res = await apiClient.put('/users/profile', { fcmToken: token });
      if (res.data?.data?.fcmToken === token) {
        this.lastSyncedToken = token;
        console.log('✅ FCM device token persisted on backend profile.');
      } else {
        console.warn('⚠️ Backend accepted the request but did not store the FCM token:', res.data);
      }
    } catch (error: any) {
      console.warn('⚠️ FCM token backend sync failed:', error?.response?.data || error?.message);
      if (attempt <= 3) {
        await new Promise<void>((r) => setTimeout(() => r(), 2000 * attempt));
        return this.registerTokenWithBackend(token, attempt + 1);
      }
    }
  }

  /** Firebase rotates tokens; re-sync whenever that happens. */
  private static setupTokenRefreshListener(messaging: any) {
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
      this.refreshUnsubscribe = null;
    }
    try {
      this.refreshUnsubscribe = messaging().onTokenRefresh(async (newToken: string) => {
        console.log('🔄 FCM device token rotated by Firebase.');
        this.deviceToken = newToken;
        this.lastSyncedToken = null;
        await this.registerTokenWithBackend(newToken);
      });
    } catch (err) {
      console.warn('⚠️ Could not subscribe to FCM token refresh:', err);
    }
  }

  static getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /** Clear the token from the backend + device on logout. */
  static async unregister(): Promise<void> {
    try {
      if (storageService.getItemSync('pulse_auth_token')) {
        await apiClient.put('/users/profile', { fcmToken: '' }).catch(() => {});
      }
      const messaging = loadMessaging();
      if (messaging) await messaging().deleteToken().catch(() => {});
    } finally {
      this.deviceToken = null;
      this.lastSyncedToken = null;
      if (this.refreshUnsubscribe) {
        this.refreshUnsubscribe();
        this.refreshUnsubscribe = null;
      }
    }
  }

  /** Foreground messages are never auto-displayed by Android — surface them in-app. */
  static onForegroundMessage(
    callback: (notification: { title: string; body: string; icon?: string }) => void
  ): (() => void) | undefined {
    const messaging = loadMessaging();
    if (!messaging) return undefined;

    try {
      return messaging().onMessage(async (remoteMessage: any) => {
        const n = remoteMessage?.notification;
        callback({
          title: n?.title || remoteMessage?.data?.title || 'New Message',
          body: n?.body || remoteMessage?.data?.body || '',
          icon: n?.android?.imageUrl || remoteMessage?.data?.largeIcon,
        });
      });
    } catch (error) {
      console.error('❌ Firebase foreground listener error:', error);
      return undefined;
    }
  }
}
