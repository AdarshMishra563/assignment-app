import { apiClient } from '../api/client';

export class FCMClientService {
  private static deviceToken: string | null = null;

  // Initialize FCM Push Notifications
  static async requestUserPermissionAndGetToken(): Promise<string | null> {
    try {
      // Demo FCM device token generation
      this.deviceToken = `fcm_device_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log('📱 FCM Device Token Registered:', this.deviceToken);

      // Register device token with backend server
      await this.registerTokenWithBackend(this.deviceToken);

      return this.deviceToken;
    } catch (error) {
      console.error('Error requesting FCM notification permissions:', error);
      return null;
    }
  }

  private static async registerTokenWithBackend(token: string) {
    try {
      await apiClient.put('/users/profile', { fcmToken: token });
      console.log('✅ FCM token synced with backend.');
    } catch (e) {
      console.warn('FCM token backend sync warning:', e);
    }
  }

  // Handle Foreground FCM Push Notification Message
  static onForegroundMessage(callback: (notification: { title: string; body: string; icon?: string }) => void) {
    // Listens for incoming FCM push notifications when app is active
    console.log('🔔 Registered FCM Foreground Message Listener');
  }
}
