import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, Star, Video } from 'lucide-react-native';
import i18n from 'i18next';
import { Doctor } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Badge } from '../../../design-system/components/Badge';
import { ProgressRing } from '../../../design-system/components/ProgressRing';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
  onBookPress?: () => void;
  featured?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = React.memo(({ doctor, onPress, onBookPress, featured }) => {
  const COLOR = useColor();

  const slotsRatio = (doctor.availableSlotsCount || 4) / (doctor.totalSlotsToday || 8);

  const doctorDisplayName = i18n.language === 'hi' && doctor.nameHi ? doctor.nameHi : doctor.name;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${doctorDisplayName}, ${doctor.specialty}, ${doctor.rating.toFixed(1)} star rating, consultation fee ₹${doctor.consultationFee}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: COLOR.surface, borderColor: COLOR.border },
        pressed && styles.pressed,
      ]}
    >
      {featured && (
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: doctor.photo }}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={`Photo of ${doctorDisplayName}`}
          />
          <View style={[styles.heroBadge, { backgroundColor: COLOR.primary }]}>
            <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={[typography.label, { color: '#FFFFFF', marginLeft: 4 }]}>TOP RATED VAIDYA</Text>
          </View>
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.topRow}>
          {!featured && (
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: doctor.photo }}
                style={styles.avatar}
                accessibilityRole="image"
                accessibilityLabel={`Photo of ${doctorDisplayName}`}
              />
              {doctor.verified && (
                <View style={[styles.verifiedBadge, { backgroundColor: COLOR.surface }]}>
                  <CheckCircle size={15} color={COLOR.primary} fill="#FFFFFF" />
                </View>
              )}
            </View>
          )}

          <View style={styles.mainInfo}>
            <View style={styles.nameRow}>
              <Text style={[typography.subtitle, { color: COLOR.text, flex: 1 }]} numberOfLines={1}>
                {i18n.language === 'hi' && doctor.nameHi ? doctor.nameHi : doctor.name}
              </Text>
              <View style={[styles.ratingRow, { backgroundColor: COLOR.surfaceAlt }]}>
                <Star size={12} color={COLOR.accent} fill={COLOR.accent} />
                <Text style={[typography.label, { color: COLOR.text, marginLeft: 3 }]}>
                  {doctor.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '700', marginTop: 2 }]}>
              {doctor.specialty}
            </Text>

            <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 2 }]} numberOfLines={1}>
              {doctor.yearsExperience} yrs exp · {doctor.city}
            </Text>
          </View>
        </View>

        <Text style={[typography.bodySmall, { color: COLOR.textMuted, marginTop: spacing.sm }]} numberOfLines={2}>
          {doctor.about}
        </Text>

        <View style={[styles.bottomDivider, { backgroundColor: COLOR.border }]} />

        <View style={styles.bottomRow}>
        <View style={styles.feeCol}>
          <Text style={[typography.label, { color: COLOR.textMuted }]}>CONSULTATION FEE</Text>
          <Text style={[typography.subtitle, { color: COLOR.text, fontWeight: '800' }]}>
            ₹{doctor.consultationFee}
          </Text>
        </View>

        <View style={styles.capacityCol}>
          <ProgressRing
            progress={slotsRatio}
            color={COLOR.primary}
            trackColor={COLOR.surfaceAlt}
            size={32}
            strokeWidth={3.5}
          >
            <Video size={13} color={COLOR.primary} style={{ alignSelf: 'center', marginTop: 9 }} />
          </ProgressRing>
          <View style={{ marginLeft: spacing.xs }}>
            <Text style={[typography.label, { color: COLOR.textMuted, fontSize: 10 }]}>TODAY'S SLOTS</Text>
            <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700' }]}>
              {doctor.availableSlotsCount || 4} available
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onBookPress || onPress}
          accessibilityRole="button"
          accessibilityLabel={`Book appointment with ${doctorDisplayName}`}
          style={[styles.bookBtn, { backgroundColor: COLOR.primary }]}
        >
          <Text style={[typography.label, { color: COLOR.textInverse }]}>BOOK</Text>
        </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBody: {
    padding: spacing.md,
  },
  heroWrap: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#E3E6DE',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: radius.pill,
    padding: 1,
  },
  mainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  bottomDivider: {
    height: 1,
    marginVertical: spacing.sm + 2,
    opacity: 0.6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeCol: {
    justifyContent: 'center',
  },
  capacityCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.pill,
  },
});
