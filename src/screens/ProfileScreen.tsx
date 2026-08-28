import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Fingerprint,
  Globe,
  Moon,
  RotateCcw,
  Shield,
  Sparkles,
  Sun,
  User,
  Wifi,
} from 'lucide-react-native';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setBiometricsEnabled,
  setLanguage,
} from '../shared/patientProfile/patientProfileSlice';
import { useColor, useThemeMode } from '../design-system/theme/ThemeProvider';
import { radius, spacing } from '../design-system/theme/spacing';
import { typography } from '../design-system/theme/typography';
import { Card } from '../design-system/components/Card';
import { Badge } from '../design-system/components/Badge';
import { Button } from '../design-system/components/Button';
import { GradientButton } from '../design-system/components/GradientButton';
import { BiometricPromptModal } from '../design-system/components/BiometricPromptModal';
import { showToast } from '../design-system/components/Toast';

export const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const { mode, setMode } = useThemeMode();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const user = useAppSelector((state) => state.auth.user);
  const patientProfile = useAppSelector((state) => state.patientProfile);
  const syncQueue = useAppSelector((state) => state.syncQueue.queue);
  const [showBiometricTestModal, setShowBiometricTestModal] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
            style={styles.avatar}
            accessibilityRole="image"
            accessibilityLabel={`Profile photo of ${user?.name || 'Aarav Sharma'}`}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.title, { color: COLOR.text }]}>
              {user?.name || 'Aarav Sharma'}
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted }]}>
              {user?.email || 'aarav.sharma@example.com'}
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted }]}>
              {user?.phone || '+91 98765 43210'}
            </Text>
            <Badge label={t('profile.verified_patient')} variant="success" style={{ marginTop: 4 }} />
          </View>
        </Card>

        {/* Ayurvedic Dosha Profile */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={18} color={COLOR.accent} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>
              {t('profile.prakriti_profile')}
            </Text>
          </View>

          <View style={[styles.doshaBox, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
            <View>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>{t('profile.diagnosed_dosha')}</Text>
              <Text style={[typography.title, { color: COLOR.primary, fontWeight: '900' }]}>
                {patientProfile.dosha ? patientProfile.dosha.toUpperCase() : 'PITTA'}
              </Text>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>
                Assessment completed on {new Date().toLocaleDateString()}
              </Text>
            </View>

            <Button
              title={t('profile.retake_quiz')}
              variant="outline"
              icon={<RotateCcw size={14} color={COLOR.primary} />}
              onPress={() => navigation.navigate('DoshaQuiz')}
              style={{ paddingVertical: 8 }}
            />
          </View>
        </Card>

        {/* Patient Allergies (Cross-Module Reference) */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <AlertTriangle size={18} color={COLOR.danger} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>
              {t('profile.medical_allergies')}
            </Text>
          </View>
          <Text style={[typography.caption, { color: COLOR.textMuted, marginBottom: spacing.xs }]}>
            {t('profile.allergies_desc')}
          </Text>

          <View style={styles.allergyChipsRow}>
            {patientProfile.allergies.map((allergy) => (
              <Badge
                key={allergy}
                label={allergy}
                variant="danger"
                style={{ marginRight: spacing.xs, marginBottom: spacing.xs }}
              />
            ))}
          </View>
        </Card>

        {/* App Appearance / Theme */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Sun size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>{t('profile.theme_mode')}</Text>
          </View>

          <View style={styles.themeToggleRow}>
            <Pressable
              onPress={() => setMode('light')}
              accessibilityRole="button"
              accessibilityLabel={t('profile.light')}
              accessibilityState={{ selected: mode === 'light' }}
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'light' ? COLOR.primary : COLOR.surfaceAlt,
                  borderColor: mode === 'light' ? COLOR.primary : COLOR.border,
                },
              ]}
            >
              <Sun size={16} color={mode === 'light' ? COLOR.textInverse : COLOR.text} />
              <Text style={[typography.caption, { fontWeight: '700', color: mode === 'light' ? COLOR.textInverse : COLOR.text, marginLeft: 4 }]}>
                {t('profile.light')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('dark')}
              accessibilityRole="button"
              accessibilityLabel={t('profile.dark')}
              accessibilityState={{ selected: mode === 'dark' }}
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'dark' ? COLOR.primary : COLOR.surfaceAlt,
                  borderColor: mode === 'dark' ? COLOR.primary : COLOR.border,
                },
              ]}
            >
              <Moon size={16} color={mode === 'dark' ? COLOR.textInverse : COLOR.text} />
              <Text style={[typography.caption, { fontWeight: '700', color: mode === 'dark' ? COLOR.textInverse : COLOR.text, marginLeft: 4 }]}>
                {t('profile.dark')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('system')}
              accessibilityRole="button"
              accessibilityLabel={t('profile.system')}
              accessibilityState={{ selected: mode === 'system' }}
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'system' ? COLOR.primary : COLOR.surfaceAlt,
                  borderColor: mode === 'system' ? COLOR.primary : COLOR.border,
                },
              ]}
            >
              <Shield size={16} color={mode === 'system' ? COLOR.textInverse : COLOR.text} />
              <Text style={[typography.caption, { fontWeight: '700', color: mode === 'system' ? COLOR.textInverse : COLOR.text, marginLeft: 4 }]}>
                {t('profile.system')}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Language Selection */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Globe size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>{t('profile.language')}</Text>
          </View>

          <View style={styles.langRow}>
            <Pressable
              onPress={() => {
                dispatch(setLanguage('en'));
                i18n.changeLanguage('en');
                showToast.success('App language set to English');
              }}
              accessibilityRole="button"
              accessibilityLabel="English"
              accessibilityState={{ selected: patientProfile.language === 'en' }}
              style={[
                styles.langOption,
                {
                  backgroundColor: patientProfile.language === 'en' ? COLOR.primary : COLOR.surfaceAlt,
                  borderColor: patientProfile.language === 'en' ? COLOR.primary : COLOR.border,
                },
              ]}
            >
              <Text style={[typography.subtitle, { color: patientProfile.language === 'en' ? '#FFFFFF' : COLOR.text, fontWeight: '700' }]}>
                English
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                dispatch(setLanguage('hi'));
                i18n.changeLanguage('hi');
                showToast.success('ऐप की भाषा हिंदी में सेट की गई');
              }}
              accessibilityRole="button"
              accessibilityLabel="Hindi"
              accessibilityState={{ selected: patientProfile.language === 'hi' }}
              style={[
                styles.langOption,
                {
                  backgroundColor: patientProfile.language === 'hi' ? COLOR.primary : COLOR.surfaceAlt,
                  borderColor: patientProfile.language === 'hi' ? COLOR.primary : COLOR.border,
                },
              ]}
            >
              <Text style={[typography.subtitle, { color: patientProfile.language === 'hi' ? '#FFFFFF' : COLOR.text, fontWeight: '700' }]}>
                हिंदी (Hindi)
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Biometrics */}
        <Card style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Fingerprint size={22} color={COLOR.primary} style={{ marginRight: spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.subtitle, { color: COLOR.text }]}>{t('profile.biometric_lock')}</Text>
                <Text style={[typography.caption, { color: COLOR.textMuted }]}>
                  {t('profile.biometric_desc')}
                </Text>
              </View>
            </View>

            <Switch
              value={patientProfile.biometricsEnabled}
              onValueChange={(val) => {
                if (val) {
                  setShowBiometricTestModal(true);
                } else {
                  dispatch(setBiometricsEnabled(false));
                  showToast.info('Biometric lock disabled');
                }
              }}
              trackColor={{ false: COLOR.surfaceAlt, true: COLOR.primary }}
              thumbColor="#FFFFFF"
              accessibilityRole="switch"
              accessibilityLabel={t('profile.biometric_lock')}
              accessibilityState={{ checked: patientProfile.biometricsEnabled }}
            />
          </View>
        </Card>

        <BiometricPromptModal
          visible={showBiometricTestModal}
          title={t('profile.enable_biometric_lock')}
          subtitle={t('profile.enable_biometric_desc')}
          onSuccess={() => {
            dispatch(setBiometricsEnabled(true));
            setShowBiometricTestModal(false);
            showToast.success('Biometric Vault Lock enabled successfully');
          }}
          onCancel={() => {
            setShowBiometricTestModal(false);
          }}
        />

        {/* Offline Sync Status */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Wifi size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>{t('profile.sync_engine')}</Text>
          </View>

          <Text style={[typography.caption, { color: COLOR.textMuted }]}>
            {t('profile.sync_queue_items')} <Text style={{ fontWeight: '800', color: COLOR.primary }}>{syncQueue.length} items</Text>
          </Text>
          <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 2 }]}>
            {t('profile.sync_desc')}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEF3EA',
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  doshaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  allergyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  themeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  langOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
