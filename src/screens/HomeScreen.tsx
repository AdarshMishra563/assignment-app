import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ChevronRight,
  FileText,
  Heart,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Video,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDoctors } from '../features/consultations/store/consultationsSlice';
import { fetchProducts } from '../features/shop/store/productsSlice';
import { fetchHealthRecords } from '../features/health-records/store/healthRecordsSlice';
import { useColor } from '../design-system/theme/ThemeProvider';
import { radius, spacing } from '../design-system/theme/spacing';
import { typography } from '../design-system/theme/typography';
import { ZAxisHeroBanner } from '../design-system/components/ZAxisHeroBanner';
import { Card } from '../design-system/components/Card';
import { SectionHeader } from '../design-system/components/SectionHeader';
import { Badge } from '../design-system/components/Badge';
import { WaveDivider } from '../design-system/components/WaveDivider';
import { RadialGlowBackground } from '../design-system/components/RadialGlowBackground';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
  'https://images.unsplash.com/photo-1594824813580-ff677464d509?w=800',
];

const HERO_CAPTION_KEYS = [
  { labelKey: 'home.hero1_label', titleKey: 'home.hero1_title', subKey: 'home.hero1_sub', ctaKey: 'home.hero1_cta' },
  { labelKey: 'home.hero2_label', titleKey: 'home.hero2_title', subKey: 'home.hero2_sub', ctaKey: 'home.hero2_cta' },
  { labelKey: 'home.hero3_label', titleKey: 'home.hero3_title', subKey: 'home.hero3_sub', ctaKey: 'home.hero3_cta' },
];

export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const HERO_CAPTIONS = HERO_CAPTION_KEYS.map((k) => ({
    label: t(k.labelKey),
    title: t(k.titleKey),
    subtitle: t(k.subKey),
    cta: t(k.ctaKey),
  }));

  const user = useAppSelector((state) => state.auth.user);
  const patientProfile = useAppSelector((state) => state.patientProfile);
  const topDoctors = useAppSelector((state) => state.consultations.doctors.slice(0, 4));
  const topProducts = useAppSelector((state) => state.products.products.slice(0, 6));
  const recentRecords = useAppSelector((state) => state.healthRecords.records.slice(0, 2));

  useEffect(() => {
    dispatch(fetchDoctors({ page: 1 }));
    dispatch(fetchProducts({ page: 1 }));
    dispatch(fetchHealthRecords({ page: 1 }));
  }, [dispatch]);

  const handleHeroPress = (index: number) => {
    if (index === 0) navigation.navigate('ConsultationsTab');
    else if (index === 1) navigation.navigate('ShopTab');
    else navigation.navigate('HealthRecordsTab');
  };

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <RadialGlowBackground color={COLOR.primary} opacity={0.12} />
          <View>
            <Text style={[typography.label, { color: COLOR.accent, textTransform: 'uppercase' }]}>
              {t('home.welcome')}
            </Text>
            <Text style={[typography.title, { color: COLOR.text }]}>
              {user?.name || 'Aarav Sharma'}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('ProfileTab')}
            accessibilityRole="button"
            accessibilityLabel="Go to profile"
            style={[styles.avatarCircle, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}
          >
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
              style={styles.headerAvatar}
              accessibilityRole="image"
              accessibilityLabel={`Profile photo of ${user?.name || 'Aarav Sharma'}`}
            />
          </Pressable>
        </View>

        {/* Z-Axis Hero Banner */}
        <View style={styles.heroWrapper}>
          <ZAxisHeroBanner
            height={220}
            images={HERO_IMAGES}
            captions={HERO_CAPTIONS}
            onPressCaption={handleHeroPress}
          />
        </View>

        {/* Dosha Status Bar */}
        <Pressable
          onPress={() => navigation.navigate('DoshaQuiz')}
          accessibilityRole="button"
          accessibilityLabel={t('home.prakriti_title')}
          style={[styles.doshaCard, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}
        >
          <View style={[styles.doshaIconCircle, { backgroundColor: COLOR.accentSoft }]}>
            <Sparkles size={20} color={COLOR.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.label, { color: COLOR.accent, textTransform: 'uppercase' }]}>
              {t('home.prakriti_title')}
            </Text>
            <Text style={[typography.subtitle, { color: COLOR.text }]}>
              {patientProfile.dosha ? `${patientProfile.dosha.toUpperCase()} Dominant` : 'Pitta Dominant'}
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted }]}>
              {t('home.prakriti_sub')}
            </Text>
          </View>
          <ChevronRight size={18} color={COLOR.textMuted} />
        </Pressable>

        {/* Quick Action Navigation Grid */}
        <View style={styles.quickGrid}>
          <Pressable
            onPress={() => navigation.navigate('ConsultationsTab')}
            accessibilityRole="button"
            accessibilityLabel={t('home.quick_book')}
            style={[styles.quickTile, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}
          >
            <View style={[styles.tileIcon, { backgroundColor: COLOR.primarySoft }]}>
              <Stethoscope size={22} color={COLOR.primary} />
            </View>
            <Text style={[typography.subtitle, { color: COLOR.text, marginTop: spacing.xs }]}>
              {t('home.quick_book')}
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted }]}>
              {t('home.quick_book_sub')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('ShopTab')}
            accessibilityRole="button"
            accessibilityLabel={t('home.quick_shop')}
            style={[styles.quickTile, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}
          >
            <View style={[styles.tileIcon, { backgroundColor: COLOR.accentSoft }]}>
              <ShoppingBag size={22} color={COLOR.accent} />
            </View>
            <Text style={[typography.subtitle, { color: COLOR.text, marginTop: spacing.xs }]}>
              {t('home.quick_shop')}
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted }]}>
              {t('home.quick_shop_sub')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('HealthRecordsTab')}
            accessibilityRole="button"
            accessibilityLabel={t('home.quick_vault')}
            style={[styles.quickTile, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}
          >
            <View style={[styles.tileIcon, { backgroundColor: COLOR.infoSoft }]}>
              <FileText size={22} color={COLOR.info} />
            </View>
            <Text style={[typography.subtitle, { color: COLOR.text, marginTop: spacing.xs }]}>
              {t('home.quick_vault')}
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted }]}>
              {t('home.quick_vault_sub')}
            </Text>
          </Pressable>
        </View>

        {/* Available Doctors Section */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title={t('home.senior_doctors')}
            buttonText={t('home.see_all_doctors')}
            onPress={() => navigation.navigate('ConsultationsTab')}
            description={t('home.senior_doctors_desc')}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
            {topDoctors.map((doc) => (
              <Pressable
                key={doc.id}
                onPress={() => navigation.navigate('DoctorDetail', { doctorId: doc.id })}
                accessibilityRole="button"
                accessibilityLabel={`${doc.name}, ${doc.specialty}`}
                style={[styles.horizontalDoctorCard, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}
              >
                <Image
                  source={{ uri: doc.photo }}
                  style={styles.docImg}
                  accessibilityRole="image"
                  accessibilityLabel={`Photo of ${doc.name}`}
                />
                <Text style={[typography.subtitle, { color: COLOR.text, marginTop: spacing.xs }]} numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '700' }]} numberOfLines={1}>
                  {doc.specialty}
                </Text>
                <Text style={[typography.caption, { color: COLOR.textMuted }]} numberOfLines={1}>
                  ₹{doc.consultationFee} · {doc.yearsExperience} yrs exp
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Best Seller Remedies Section */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title={t('home.featured_remedies')}
            buttonText={t('home.visit_shop')}
            onPress={() => navigation.navigate('ShopTab')}
            description={t('home.featured_remedies_desc')}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
            {topProducts.map((prod) => (
              <Pressable
                key={prod.id}
                onPress={() => navigation.navigate('ProductDetail', { productId: prod.id })}
                accessibilityRole="button"
                accessibilityLabel={`${prod.name}, ₹${prod.price}`}
                style={[styles.horizontalProductCard, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}
              >
                <Image
                  source={{ uri: prod.image }}
                  style={styles.prodImg}
                  accessibilityRole="image"
                  accessibilityLabel={prod.name}
                />
                <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '800', marginTop: spacing.xs }]} numberOfLines={1}>
                  {prod.category}
                </Text>
                <Text style={[typography.subtitle, { color: COLOR.text, fontSize: 13 }]} numberOfLines={2}>
                  {prod.name}
                </Text>
                <Text style={[typography.subtitle, { color: COLOR.text, fontWeight: '800', marginTop: 4 }]}>
                  ₹{prod.price}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Recent Health Records */}
        <View style={[styles.sectionContainer, { marginBottom: 60 }]}>
          <SectionHeader
            title={t('home.recent_records')}
            buttonText={t('home.full_timeline')}
            onPress={() => navigation.navigate('HealthRecordsTab')}
            description={t('home.recent_records_desc')}
          />

          {recentRecords.map((rec) => (
            <Card key={rec.id} style={{ marginBottom: spacing.xs + 2 }}>
              <Pressable
                onPress={() => navigation.navigate('RecordDetail', { recordId: rec.id })}
                accessibilityRole="button"
                accessibilityLabel={`${rec.title}, ${rec.doctorName}`}
                style={styles.recordRow}
              >
                <View style={[styles.recordIconBox, { backgroundColor: COLOR.primarySoft }]}>
                  <FileText size={18} color={COLOR.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[typography.subtitle, { color: COLOR.text, fontSize: 14 }]} numberOfLines={1}>
                    {rec.title}
                  </Text>
                  <Text style={[typography.caption, { color: COLOR.textMuted }]}>
                    {rec.doctorName} · {new Date(rec.date).toLocaleDateString()}
                  </Text>
                </View>
                <ChevronRight size={16} color={COLOR.textMuted} />
              </Pressable>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },
  heroWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  doshaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  doshaIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  quickTile: {
    width: '31%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  horizontalRow: {
    paddingVertical: spacing.xs,
  },
  horizontalDoctorCard: {
    width: 140,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  docImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF3EA',
  },
  horizontalProductCard: {
    width: 140,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  prodImg: {
    width: '100%',
    height: 90,
    borderRadius: radius.sm,
    backgroundColor: '#EEF3EA',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
