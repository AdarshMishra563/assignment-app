import AsyncStorage from '@react-native-async-storage/async-storage';

// Memory cache fallback for sync access
const memoryCache: Record<string, string> = {};

export const storageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) memoryCache[key] = val;
      return val ?? memoryCache[key] ?? null;
    } catch {
      return memoryCache[key] ?? null;
    }
  },

  getItemSync(key: string): string | null {
    return memoryCache[key] ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryCache[key] = value;
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage set error:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    delete memoryCache[key];
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage remove error:', e);
    }
  },
};
