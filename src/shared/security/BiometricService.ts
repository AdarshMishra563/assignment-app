import { Platform } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

export interface BiometricAvailability {
  available: boolean;
  biometryType?: 'TouchID' | 'FaceID' | 'Biometrics';
  error?: string;
}

class BiometricServiceImpl {
  private rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

  async checkSensorAvailable(): Promise<BiometricAvailability> {
    try {
      const { available, biometryType, error } = await this.rnBiometrics.isSensorAvailable();

      if (!available) {
        return { available: false, error: error || 'No biometric hardware enrolled on this device' };
      }

      return { available: true, biometryType: biometryType as BiometricAvailability['biometryType'] };
    } catch (err: any) {
      return { available: false, error: err?.message || 'Biometric sensor unavailable' };
    }
  }

  async promptAuthentication(promptMessage?: string): Promise<{ success: boolean; error?: string }> {
    const { available, biometryType, error: availabilityError } = await this.checkSensorAvailable();

    if (!available) {
      return { success: false, error: availabilityError || 'Biometric authentication is not available on this device' };
    }

    const defaultMsg =
      Platform.OS === 'ios'
        ? biometryType === BiometryTypes.FaceID
          ? 'Confirm Face ID to access your encrypted Health Records'
          : 'Confirm Touch ID to access your encrypted Health Records'
        : 'Scan fingerprint to access your encrypted Health Records';

    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: promptMessage || defaultMsg,
        cancelButtonText: 'Cancel',
      });

      if (success) {
        return { success: true };
      }
      return { success: false, error: 'Biometric authentication was not recognized' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Biometric authentication was cancelled' };
    }
  }
}

export const BiometricService = new BiometricServiceImpl();
