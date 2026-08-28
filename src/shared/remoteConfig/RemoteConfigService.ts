import { Platform } from 'react-native';
import remoteConfig from '@react-native-firebase/remote-config';
import { getVersion } from 'react-native-device-info';

export interface UpdateCheckResult {
  updateAvailable: boolean;
  forceUpdate: boolean;
  storeUrl: string;
  latestVersion: string;
  currentVersion: string;
}

const DEFAULTS = {
  android_min_version: '1.0',
  android_latest_version: '1.0',
  // com.pulsechatapp isn't published yet, so its store link 404s — default to a
  // known, always-live Play Store listing until the real app goes live, then
  // override via the android_store_url remote-config key.
  android_store_url: 'https://play.google.com/store/apps/details?id=com.whatsapp',
  ios_min_version: '1.0',
  ios_latest_version: '1.0',
  ios_store_url: 'https://apps.apple.com/app/idYOUR_APP_ID',
};

function compareVersions(current: string, other: string): number {
  const a = current.split('.').map(Number);
  const b = other.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

class RemoteConfigServiceImpl {
  private configured = false;

  async checkForUpdate(): Promise<UpdateCheckResult> {
    const currentVersion = getVersion();

    try {
      if (!this.configured) {
        // 0 = always fetch fresh from Firebase Remote Config on every check,
        // no local-cache throttling window.
        await remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 0 });
        await remoteConfig().setDefaults(DEFAULTS);
        this.configured = true;
      }

      await remoteConfig().fetchAndActivate();

      const prefix = Platform.OS === 'ios' ? 'ios' : 'android';
      const minVersion = remoteConfig().getValue(`${prefix}_min_version`).asString();
      const latestVersion = remoteConfig().getValue(`${prefix}_latest_version`).asString();
      const storeUrl = remoteConfig().getValue(`${prefix}_store_url`).asString().trim();

      const forceUpdate = compareVersions(currentVersion, minVersion) < 0;
      const updateAvailable = forceUpdate || compareVersions(currentVersion, latestVersion) < 0;

      return { updateAvailable, forceUpdate, storeUrl, latestVersion, currentVersion };
    } catch (err) {
      console.warn('[RemoteConfig] update check failed', err);
      return {
        updateAvailable: false,
        forceUpdate: false,
        storeUrl: '',
        latestVersion: currentVersion,
        currentVersion,
      };
    }
  }
}

export const RemoteConfigService = new RemoteConfigServiceImpl();
