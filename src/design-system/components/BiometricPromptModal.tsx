import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AlertTriangle, Fingerprint, Lock, ShieldCheck, X } from 'lucide-react-native';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';
import { GradientButton } from './GradientButton';
import { BiometricService, BiometricAvailability } from '../../shared/security/BiometricService';

interface BiometricPromptModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

type Status = 'checking' | 'unavailable' | 'ready' | 'authenticating' | 'error';

const biometryLabel = (type?: BiometricAvailability['biometryType']) => {
  if (type === 'FaceID') return 'Face ID';
  if (type === 'TouchID') return 'Touch ID';
  return 'Biometrics';
};

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  visible,
  onSuccess,
  onCancel,
  title = 'Ayurvedic Vault Locked',
  subtitle = 'Authenticate via Fingerprint or FaceID to decrypt clinical records',
}) => {
  const COLOR = useColor();
  const [status, setStatus] = useState<Status>('checking');
  const [biometryType, setBiometryType] = useState<BiometricAvailability['biometryType']>();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setStatus('checking');
    setAuthError(null);

    BiometricService.checkSensorAvailable().then((result) => {
      if (cancelled) return;
      if (result.available) {
        setBiometryType(result.biometryType);
        setStatus('ready');
      } else {
        setAuthError(result.error || 'No biometric sensor is enrolled on this device.');
        setStatus('unavailable');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [visible]);

  const handleAuthenticate = async () => {
    setStatus('authenticating');
    setAuthError(null);

    const result = await BiometricService.promptAuthentication(
      'Verify identity to unlock your Medical Vault'
    );

    if (result.success) {
      onSuccess();
    } else {
      setAuthError(result.error || 'Authentication failed. Please try again.');
      setStatus('error');
    }
  };

  const isBusy = status === 'checking' || status === 'authenticating';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.scrim}>
        <View style={[styles.card, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}>
          {/* Close button */}
          <Pressable onPress={onCancel} style={styles.closeBtn}>
            <X size={20} color={COLOR.textMuted} />
          </Pressable>

          {/* Icon Badge */}
          <View style={[styles.iconCircle, { backgroundColor: status === 'unavailable' ? COLOR.dangerSoft : COLOR.primarySoft }]}>
            {status === 'unavailable' ? (
              <AlertTriangle size={38} color={COLOR.danger} />
            ) : (
              <Fingerprint size={42} color={COLOR.primary} />
            )}
            <View style={[styles.lockPill, { backgroundColor: COLOR.accent }]}>
              <Lock size={11} color="#FFFFFF" />
            </View>
          </View>

          <Text style={[typography.title, { color: COLOR.text, textAlign: 'center', marginTop: spacing.md }]}>
            {title}
          </Text>

          <Text style={[typography.caption, { color: COLOR.textMuted, textAlign: 'center', marginTop: 4, paddingHorizontal: spacing.sm }]}>
            {status === 'unavailable'
              ? 'This device has no fingerprint or face data enrolled, so Biometric Vault Lock cannot be turned on.'
              : subtitle}
          </Text>

          {status !== 'unavailable' && (
            <View style={[styles.securityBadge, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
              <ShieldCheck size={14} color={COLOR.success} style={{ marginRight: 6 }} />
              <Text style={[typography.label, { color: COLOR.text, fontSize: 10 }]}>
                {status === 'checking' ? 'CHECKING DEVICE SENSOR...' : `${biometryLabel(biometryType).toUpperCase()} READY ON THIS DEVICE`}
              </Text>
            </View>
          )}

          {authError && status !== 'unavailable' ? (
            <Text style={[typography.caption, { color: COLOR.danger, textAlign: 'center', marginTop: spacing.sm }]}>
              {authError}
            </Text>
          ) : null}

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            {status === 'unavailable' ? (
              <Button
                title="Set up in device Settings"
                variant="secondary"
                onPress={onCancel}
                style={{ width: '100%', marginBottom: spacing.sm }}
              />
            ) : (
              <GradientButton
                title={
                  status === 'checking'
                    ? 'Checking sensor...'
                    : status === 'authenticating'
                    ? 'Authenticating...'
                    : status === 'error'
                    ? 'Try Again'
                    : `Authenticate with ${biometryLabel(biometryType)}`
                }
                icon={isBusy ? undefined : <Fingerprint size={16} color="#FFFFFF" />}
                loading={isBusy}
                disabled={status === 'checking'}
                onPress={handleAuthenticate}
                style={{ width: '100%', marginBottom: spacing.sm }}
              />
            )}

            <Button
              title="Cancel"
              variant="ghost"
              onPress={onCancel}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: 6,
    zIndex: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  buttonRow: {
    width: '100%',
    marginTop: spacing.lg,
  },
});
