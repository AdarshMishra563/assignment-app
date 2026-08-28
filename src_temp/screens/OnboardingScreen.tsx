import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { User, AtSign, FileText, CheckCircle2 } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { UserAvatar } from '../components/UserAvatar';
import { apiClient } from '../api/client';
import { DarkTheme, LightTheme } from '../theme/colors';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const theme = isDark ? DarkTheme : LightTheme;

  const [fullName, setFullName] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your display name.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.put('/users/profile', {
        fullName: fullName.trim(),
        bio: bio.trim(),
        socialHandle: socialHandle.trim()
      });

      const updatedUser = res.data.data;
      if (user && token) {
        dispatch(setCredentials({ user: { ...user, ...updatedUser }, token }));
      }
      onComplete();
    } catch (err) {
      console.error('Error saving onboarding profile:', err);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Complete Your Profile</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Setup your profile details so friends and teammates can find you on Pulse.
        </Text>

        <View style={styles.avatarBox}>
          <UserAvatar name={fullName || 'U'} uri={user?.avatarUrl} size={80} />
        </View>

        <View style={styles.formGroup}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <User size={18} color={theme.textMuted} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Full Display Name"
              placeholderTextColor={theme.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <FileText size={18} color={theme.textMuted} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Bio (e.g. Software Engineer / Product Designer)"
              placeholderTextColor={theme.textMuted}
              value={bio}
              onChangeText={setBio}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <AtSign size={18} color={theme.textMuted} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Instagram / Twitter Handle (optional)"
              placeholderTextColor={theme.textMuted}
              value={socialHandle}
              onChangeText={setSocialHandle}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle2 size={20} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Get Started</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20
  },
  avatarBox: {
    alignItems: 'center',
    marginBottom: 20
  },
  formGroup: {
    gap: 14
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 14
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
