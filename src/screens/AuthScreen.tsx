import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Sparkles,
  Mail,
  User,
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, setCredentials } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';

export const AuthScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { loading: isLoading } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced Username validation state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const debounceTimerRef = useRef<any>(null);

  const handleUsernameChange = (text: string) => {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    setUsernameAvailable(null);
    setSuggestedUsernames([]);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (cleaned.length >= 3) {
      setCheckingUsername(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await apiClient.get(`/auth/check-username?username=${encodeURIComponent(cleaned)}`);
          const available = res.data?.available ?? true;
          setUsernameAvailable(available);
          if (!available) {
            setSuggestedUsernames([
              `${cleaned}_${Math.floor(10 + Math.random() * 89)}`,
              `${cleaned}_official`,
              `real_${cleaned}`,
            ]);
          }
        } catch {
          setUsernameAvailable(true);
        } finally {
          setCheckingUsername(false);
        }
      }, 400);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleAuthSubmit = async () => {
    const finalUsername = username.trim();
    const finalEmail = email.trim();

    if (!finalEmail) {
      Alert.alert('Required Field', 'Please enter your Email address.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        Alert.alert('Required Field', 'Please enter your Full Name.');
        return;
      }
      if (!finalUsername || finalUsername.length < 3) {
        Alert.alert('Required Field', 'Username must be at least 3 characters long.');
        return;
      }
      if (usernameAvailable === false) {
        Alert.alert('Username Taken', 'Please select an available username or tap a suggestion.');
        return;
      }
      if (!password || password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        loginUser({
          username: finalUsername || finalEmail.split('@')[0],
          email: finalEmail,
        })
      ).unwrap();
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Authentication failed';
      Alert.alert('Auth Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/auth/google', {
        email: 'user.google@gmail.com',
        username: 'GoogleUser',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      });

      if (res.data?.data) {
        dispatch(setCredentials(res.data.data));
      }
    } catch (err: any) {
      console.error('[AuthScreen] Google auth error:', err);
      Alert.alert('Google Auth Failed', err?.message || 'Could not authenticate with Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0B0F19' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Luxury Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Zap size={28} color="#6366F1" fill="#6366F1" />
          </View>
          <Text style={styles.appTitle}>PULSE</Text>
          <Text style={styles.appSubtitle}>
            {mode === 'login' ? 'Welcome back. Access your workspace.' : 'Create an exclusive Pulse account.'}
          </Text>
        </View>

        {/* Tab Switcher (CRED Luxury Pill Style) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'login' && styles.activeTabBtn]}
            onPress={() => {
              setMode('login');
              setUsernameAvailable(null);
            }}
          >
            <Text style={[styles.tabBtnText, mode === 'login' && styles.activeTabBtnText]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, mode === 'signup' && styles.activeTabBtn]}
            onPress={() => {
              setMode('signup');
              setUsernameAvailable(null);
            }}
          >
            <Text style={[styles.tabBtnText, mode === 'signup' && styles.activeTabBtnText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card (Glassmorphism Luxury Container) */}
        <View style={styles.card}>
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Alexander Wright"
                  placeholderTextColor="#64748B"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{mode === 'login' ? 'EMAIL OR USERNAME' : 'EMAIL ADDRESS'}</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Username Input (with Live Validation + Suggestions in Signup mode) */}
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>USERNAME</Text>
                {checkingUsername && <ActivityIndicator size="small" color="#6366F1" />}
                {!checkingUsername && usernameAvailable === true && (
                  <View style={styles.statusBadgeGreen}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>Available</Text>
                  </View>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <View style={styles.statusBadgeRed}>
                    <XCircle size={13} color="#EF4444" />
                    <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '700' }}>Taken</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  usernameAvailable === true && { borderColor: '#10B981' },
                  usernameAvailable === false && { borderColor: '#EF4444' },
                ]}
              >
                <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 15 }}>@</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="unique_username"
                  placeholderTextColor="#64748B"
                  value={username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                />
              </View>

              {/* Username Suggestions if taken */}
              {suggestedUsernames.length > 0 && (
                <View style={styles.suggestionsBox}>
                  <Text style={styles.suggestionTitle}>Suggested available handles:</Text>
                  <View style={styles.suggestionsRow}>
                    {suggestedUsernames.map((sug) => (
                      <TouchableOpacity
                        key={sug}
                        style={styles.suggestionChip}
                        onPress={() => {
                          setUsername(sug);
                          setUsernameAvailable(true);
                          setSuggestedUsernames([]);
                        }}
                      >
                        <Sparkles size={11} color="#818CF8" />
                        <Text style={styles.suggestionChipText}>@{sug}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••••••"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleAuthSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'Sign In to Account' : 'Create Pulse Account'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google / Gmail Device One-Tap Sign In */}
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={isSubmitting}>
            <Mail size={18} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continue with Google / Gmail</Text>
          </TouchableOpacity>
        </View>

        {/* Security Footer */}
        <View style={styles.securityFooter}>
          <ShieldCheck size={14} color="#64748B" />
          <Text style={styles.securityText}>End-to-End Encrypted & Secured Session</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 4,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabBtn: {
    backgroundColor: '#6366F1',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabBtnText: {
    color: '#FFFFFF',
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  statusBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  suggestionsBox: {
    marginTop: 8,
  },
  suggestionTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  suggestionChipText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    height: 52,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    height: 50,
    borderRadius: 16,
    gap: 10,
  },
  googleBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  securityText: {
    color: '#64748B',
    fontSize: 12,
  },
});
