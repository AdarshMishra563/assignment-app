import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Filter, Video, Sparkles } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchDoctors,
  setSpecialtyFilter,
  setCityFilter,
  setSearchQuery,
} from '../store/consultationsSlice';
import { DoctorCard } from '../components/DoctorCard';
import { SPECIALTIES, CITIES } from '../data/mockDoctors';
import { Doctor } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { SearchBar } from '../../../design-system/components/SearchBar';
import { Chip } from '../../../design-system/components/Chip';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { ShimmerPlaceholder } from '../../../design-system/components/ShimmerPlaceholder';
import { RadialGlowBackground } from '../../../design-system/components/RadialGlowBackground';
import { useDebounce } from '../../../shared/hooks/useDebounce';

export const DoctorListScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    doctors,
    totalDoctors,
    loadingDoctors,
    selectedSpecialty,
    selectedCity,
    searchQuery,
    doctorsPage,
    hasMoreDoctors,
  } = useAppSelector((state) => state.consultations);

  const patientDosha = useAppSelector((state) => state.patientProfile.dosha);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    dispatch(
      fetchDoctors({
        page: 1,
        specialty: selectedSpecialty,
        city: selectedCity,
        search: debouncedSearch,
        refresh: true,
      })
    );
  }, [dispatch, selectedSpecialty, selectedCity, debouncedSearch]);

  const handleRefresh = useCallback(() => {
    dispatch(
      fetchDoctors({
        page: 1,
        specialty: selectedSpecialty,
        city: selectedCity,
        search: debouncedSearch,
        refresh: true,
      })
    );
  }, [dispatch, selectedSpecialty, selectedCity, debouncedSearch]);

  const handleEndReached = () => {
    if (!loadingDoctors && hasMoreDoctors) {
      dispatch(
        fetchDoctors({
          page: doctorsPage + 1,
          specialty: selectedSpecialty,
          city: selectedCity,
          search: debouncedSearch,
        })
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <RadialGlowBackground color={COLOR.primary} opacity={0.15} />

      <View style={styles.titleRow}>
        <View>
          <Text style={[typography.label, { color: COLOR.accent, textTransform: 'uppercase' }]}>
            {t('doctors.subtitle')}
          </Text>
          <Text style={[typography.title, { color: COLOR.text, marginTop: 2 }]}>
            {t('doctors.title')}
          </Text>
        </View>

        <View style={[styles.badgeCount, { backgroundColor: COLOR.primarySoft }]}>
          <Stethoscope size={14} color={COLOR.primary} />
          <Text style={[typography.label, { color: COLOR.primary, marginLeft: 4 }]}>
            {totalDoctors.toLocaleString()} Doctors
          </Text>
        </View>
      </View>

      {/* Dosha recommendation banner */}
      {patientDosha && (
        <View style={[styles.doshaBanner, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
          <Sparkles size={16} color={COLOR.accent} style={{ marginRight: spacing.xs }} />
          <Text style={[typography.caption, { color: COLOR.text, flex: 1 }]}>
            Personalized for your <Text style={{ fontWeight: '800', color: COLOR.primary }}>{patientDosha.toUpperCase()}</Text> constitution — Top Panchakarma & Rasayana Vaidyas prioritized.
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <SearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder={t('doctors.search_placeholder')}
        style={{ marginTop: spacing.md }}
      />

      {/* Specialty Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {SPECIALTIES.map((spec) => (
          <Chip
            key={spec}
            label={spec}
            active={selectedSpecialty === spec}
            onPress={() => dispatch(setSpecialtyFilter(spec))}
          />
        ))}
      </ScrollView>

      {/* City Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipRow, { paddingTop: 0 }]}
      >
        {CITIES.map((city) => (
          <Chip
            key={city}
            label={city}
            active={selectedCity === city}
            onPress={() => dispatch(setCityFilter(city))}
          />
        ))}
      </ScrollView>
    </View>
  );

  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: { item: Doctor; index: number }) => (
      <DoctorCard
        doctor={item}
        featured={index === 0}
        onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
        onBookPress={() => navigation.navigate('Booking', { doctorId: item.id })}
      />
    ),
    [navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingTop: insets.top }]}>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loadingDoctors ? (
            <View style={{ padding: spacing.lg }}>
              <ShimmerPlaceholder style={styles.skeletonCard} />
              <ShimmerPlaceholder style={styles.skeletonCard} />
              <ShimmerPlaceholder style={styles.skeletonCard} />
            </View>
          ) : (
            <EmptyState
              icon={<Stethoscope size={40} color={COLOR.textMuted} />}
              title={t('doctors.no_doctors_title')}
              message={t('doctors.no_doctors_desc')}
            />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loadingDoctors && doctors.length === 0}
            onRefresh={handleRefresh}
            tintColor={COLOR.primary}
            colors={[COLOR.primary]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  doshaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  chipRow: {
    paddingVertical: spacing.sm,
  },
  skeletonCard: {
    height: 140,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
});
