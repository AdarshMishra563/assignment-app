import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  HeartPulse,
  Languages,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from 'lucide-react-native';
import i18n from 'i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDoctorById, fetchSlots } from '../store/consultationsSlice';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { GradientButton } from '../../../design-system/components/GradientButton';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { BadgeSeal } from '../../../design-system/components/BadgeSeal';
import { ProgressRing } from '../../../design-system/components/ProgressRing';
import { RadialGlowBackground } from '../../../design-system/components/RadialGlowBackground';
import { WaveDivider } from '../../../design-system/components/WaveDivider';

export const DoctorDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { doctorId } = route.params;
  const COLOR = useColor();
  const dispatch = useAppDispatch();

  const { selectedDoctor, loadingDoctorDetail } = useAppSelector((state) => state.consultations);

  useEffect(() => {
    dispatch(fetchDoctorById(doctorId));
    dispatch(fetchSlots(doctorId));
  }, [dispatch, doctorId]);

  const insets = useSafeAreaInsets();

  if (loadingDoctorDetail || !selectedDoctor) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: COLOR.background }]}>
        <ActivityIndicator size="large" color={COLOR.primary} />
      </View>
    );
  }

  const doctor = selectedDoctor;

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Card */}
        <View style={[styles.heroSection, { backgroundColor: COLOR.surface }]}>
          <RadialGlowBackground color={COLOR.primary} opacity={0.18} />

          <View style={styles.topInfo}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: doctor.photo }}
                style={styles.avatar}
                accessibilityRole="image"
                accessibilityLabel={`Photo of ${i18n.language === 'hi' && doctor.nameHi ? doctor.nameHi : doctor.name}`}
              />
              {doctor.verified && (
                <View style={styles.sealWrapper}>
                  <BadgeSeal size={42} color={COLOR.primary}>
                    <CheckCircle size={20} color={COLOR.primary} fill="#FFFFFF" />
                  </BadgeSeal>
                </View>
              )}
            </View>

            <View style={styles.headerDetails}>
              <Text style={[typography.title, { color: COLOR.text }]}>
                {i18n.language === 'hi' && doctor.nameHi ? doctor.nameHi : doctor.name}
              </Text>
              <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '800', marginTop: 2 }]}>
                {doctor.specialty}
              </Text>

              {doctor.ccimRegNo && (
                <Text style={[typography.label, { color: COLOR.textMuted, marginTop: 2 }]}>
                  {doctor.ccimRegNo}
                </Text>
              )}

              <View style={styles.metaRow}>
                <MapPin size={13} color={COLOR.textMuted} />
                <Text style={[typography.caption, { color: COLOR.textMuted, marginLeft: 4 }]}>
                  {doctor.clinicName}
                </Text>
              </View>

              <View style={styles.ratingBadgeRow}>
                <View style={[styles.ratingPill, { backgroundColor: COLOR.accentSoft }]}>
                  <Star size={13} color={COLOR.accent} fill={COLOR.accent} />
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800', marginLeft: 4 }]}>
                    {doctor.rating.toFixed(1)} ({doctor.ratingCount} reviews)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stat Tiles */}
          <View style={[styles.statsRow, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
            <View style={styles.statTile}>
              <Award size={18} color={COLOR.primary} />
              <Text style={[typography.caption, { fontWeight: '800', color: COLOR.text, marginTop: 4 }]}>
                {doctor.yearsExperience}+ Years
              </Text>
              <Text style={[typography.label, { color: COLOR.textMuted }]}>CLINICAL EXP</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: COLOR.border }]} />

            <View style={styles.statTile}>
              <Languages size={18} color={COLOR.primary} />
              <Text style={[typography.caption, { fontWeight: '800', color: COLOR.text, marginTop: 4 }]}>
                {doctor.languages.slice(0, 2).join(', ')}
              </Text>
              <Text style={[typography.label, { color: COLOR.textMuted }]}>LANGUAGES</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: COLOR.border }]} />

            <View style={styles.statTile}>
              <ProgressRing
                progress={(doctor.availableSlotsCount || 4) / 8}
                color={COLOR.primary}
                trackColor={COLOR.border}
                size={34}
                strokeWidth={3.5}
              >
                <Video size={13} color={COLOR.primary} style={{ alignSelf: 'center', marginTop: 10 }} />
              </ProgressRing>
              <Text style={[typography.label, { color: COLOR.textMuted, marginTop: 4 }]}>TODAY'S SLOTS</Text>
            </View>
          </View>
        </View>

        <WaveDivider color={COLOR.background} />

        <View style={styles.body}>
          {/* Nadi Pariksha Expert Highlight */}
          {doctor.nadiParikshaExpert && (
            <Card style={[styles.sectionCard, { backgroundColor: COLOR.primarySoft, borderColor: COLOR.primary }]}>
              <View style={styles.cardHeaderRow}>
                <HeartPulse size={20} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
                <Text style={[typography.subtitle, { color: COLOR.primary }]}>Master Pulse Diagnostician (Nadi Pariksha)</Text>
              </View>
              <Text style={[typography.caption, { color: COLOR.text, marginTop: 4, lineHeight: 18 }]}>
                Certified to detect subtle organ bio-rhythms and sub-doshic imbalances via classical Ayurvedic pulse palpation during tele-consultation.
              </Text>
            </Card>
          )}

          {/* Sub-Specialties */}
          {doctor.subSpecialties && (
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Sparkles size={18} color={COLOR.accent} style={{ marginRight: spacing.xs }} />
                <Text style={[typography.subtitle, { color: COLOR.text }]}>Clinical Specializations & Treatments</Text>
              </View>
              <View style={styles.subSpecChips}>
                {doctor.subSpecialties.map((sub, i) => (
                  <Badge
                    key={i}
                    label={sub}
                    variant="primary"
                    style={{ marginRight: spacing.xs, marginVertical: 3 }}
                  />
                ))}
              </View>
            </Card>
          )}

          {/* About Section */}
          <Card style={styles.sectionCard}>
            <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.xs }]}>
              Clinical Biography & Practice
            </Text>
            <Text style={[typography.body, { color: COLOR.textMuted, lineHeight: 22 }]}>
              {doctor.about}
            </Text>
          </Card>

          {/* OPD Schedule */}
          {doctor.opdTimings && (
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Clock size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
                <Text style={[typography.subtitle, { color: COLOR.text }]}>OPD Tele-Consultation Hours</Text>
              </View>
              <Text style={[typography.body, { color: COLOR.text, fontWeight: '700', marginTop: 4 }]}>
                {doctor.opdTimings}
              </Text>
              <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 2 }]}>
                Instant slot reservation with automated room link generation
              </Text>
            </Card>
          )}

          {/* Education & Qualifications */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <GraduationCap size={20} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Education & Certifications</Text>
            </View>
            <Text style={[typography.body, { color: COLOR.text, fontWeight: '700', marginTop: spacing.xs }]}>
              {doctor.education}
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 2 }]}>
              Central Council of Indian Medicine (CCIM) Registered Practitioner
            </Text>
          </Card>

          {/* Care Promise */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <ShieldCheck size={20} color={COLOR.success} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Amrutam Clinical Promise</Text>
            </View>
            <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: spacing.xs, lineHeight: 18 }]}>
              • 30-min HD 1-on-1 Video Consultation{'\n'}
              • Personalized Ayurvedic Nadi & Prakriti Diagnosis{'\n'}
              • Instant Digital e-Prescription & Ahara Diet Plan{'\n'}
              • Free 7-Day Follow-up Chat with Care Team
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: COLOR.surface,
            borderColor: COLOR.border,
            paddingBottom: insets.bottom ? insets.bottom + spacing.sm : spacing.md,
          },
        ]}
      >
        <View>
          <Text style={[typography.label, { color: COLOR.textMuted }]}>CONSULTATION FEE</Text>
          <Text style={[typography.title, { color: COLOR.text, fontWeight: '900' }]}>
            ₹{doctor.consultationFee}
          </Text>
        </View>

        <GradientButton
          title="Select Consultation Slot"
          onPress={() => navigation.navigate('Booking', { doctorId: doctor.id })}
          style={{ flex: 1, marginLeft: spacing.lg }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  topInfo: {
    flexDirection: 'row',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E3E6DE',
  },
  sealWrapper: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  headerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  statTile: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subSpecChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    elevation: 8,
  },
});
