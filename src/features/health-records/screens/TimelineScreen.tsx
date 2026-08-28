import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { Activity, FileText, Plus, ShieldCheck } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchHealthRecords, setTypeFilter } from '../store/healthRecordsSlice';
import { TimelineEntry } from '../components/TimelineEntry';
import { MonthSectionHeader } from '../components/MonthSectionHeader';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { SearchBar } from '../../../design-system/components/SearchBar';
import { Chip } from '../../../design-system/components/Chip';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { ShimmerPlaceholder } from '../../../design-system/components/ShimmerPlaceholder';
import { RadialGlowBackground } from '../../../design-system/components/RadialGlowBackground';
import { useDebounce } from '../../../shared/hooks/useDebounce';

const RECORD_TYPES = [
  { id: 'all', labelKey: 'records.filter_all' },
  { id: 'prescription', labelKey: 'records.filter_prescriptions' },
  { id: 'lab_report', labelKey: 'records.filter_lab_reports' },
  { id: 'allergy', labelKey: 'records.filter_allergies' },
  { id: 'vaccination', labelKey: 'records.filter_vaccinations' },
  { id: 'diet_plan', labelKey: 'records.filter_diet_plans' },
];

export const TimelineScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const {
    records,
    totalRecords,
    loadingRecords,
    selectedTypeFilter,
    searchQuery,
    recordsPage,
    hasMoreRecords,
  } = useAppSelector((state) => state.healthRecords);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    dispatch(
      fetchHealthRecords({
        page: 1,
        type: selectedTypeFilter,
        search: debouncedSearch,
        refresh: true,
      })
    );
  }, [dispatch, selectedTypeFilter, debouncedSearch]);

  const handleRefresh = useCallback(() => {
    dispatch(
      fetchHealthRecords({
        page: 1,
        type: selectedTypeFilter,
        search: debouncedSearch,
        refresh: true,
      })
    );
  }, [dispatch, selectedTypeFilter, debouncedSearch]);

  const handleEndReached = () => {
    if (!loadingRecords && hasMoreRecords) {
      dispatch(
        fetchHealthRecords({
          page: recordsPage + 1,
          type: selectedTypeFilter,
          search: debouncedSearch,
        })
      );
    }
  };

  // Group records chronologically by Month/Year
  const groupedData = useMemo(() => {
    const groups: { [key: string]: typeof records } = {};

    records.forEach((rec) => {
      const date = new Date(rec.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(rec);
    });

    const flatListItems: { type: 'header' | 'record'; data: any }[] = [];

    Object.entries(groups).forEach(([monthTitle, recs]) => {
      flatListItems.push({
        type: 'header',
        data: { monthTitle, count: recs.length },
      });
      recs.forEach((r) => {
        flatListItems.push({
          type: 'record',
          data: r,
        });
      });
    });

    return flatListItems;
  }, [records]);

  const renderHeader = () => (
    <View style={styles.header}>
      <RadialGlowBackground color={COLOR.primary} opacity={0.15} />

      <View style={styles.titleRow}>
        <View>
          <Text style={[typography.label, { color: COLOR.accent, textTransform: 'uppercase' }]}>
            {t('records.subtitle')}
          </Text>
          <Text style={[typography.title, { color: COLOR.text, marginTop: 2 }]}>
            {t('records.title')}
          </Text>
        </View>

        <View style={[styles.badgeCount, { backgroundColor: COLOR.primarySoft }]}>
          <ShieldCheck size={14} color={COLOR.primary} />
          <Text style={[typography.label, { color: COLOR.primary, marginLeft: 4 }]}>
            {totalRecords.toLocaleString()} Records
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder={t('records.search_placeholder')}
        style={{ marginTop: spacing.md }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {RECORD_TYPES.map((type) => (
          <Chip
            key={type.id}
            label={t(type.labelKey)}
            active={selectedTypeFilter === type.id}
            onPress={() => dispatch(setTypeFilter(type.id))}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = useCallback(
    ({ item, index }: { item: { type: 'header' | 'record'; data: any }; index: number }) => {
      if (item.type === 'header') {
        return (
          <MonthSectionHeader
            monthTitle={item.data.monthTitle}
            recordCount={item.data.count}
          />
        );
      }
      return (
        <TimelineEntry
          record={item.data}
          onPress={() =>
            navigation.navigate('RecordDetail', { recordId: item.data.id })
          }
          isFirst={index === 1}
          isLast={index === groupedData.length - 1}
        />
      );
    },
    [navigation, groupedData.length]
  );

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingTop: insets.top }]}>
      <FlatList
        data={groupedData}
        keyExtractor={(item, index) => `${item.type}_${item.data.id || index}`}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loadingRecords ? (
            <View style={{ padding: spacing.lg }}>
              <ShimmerPlaceholder style={styles.skeletonTimeline} />
              <ShimmerPlaceholder style={styles.skeletonTimeline} />
              <ShimmerPlaceholder style={styles.skeletonTimeline} />
            </View>
          ) : (
            <EmptyState
              icon={<FileText size={44} color={COLOR.textMuted} />}
              title={t('records.no_records_title')}
              message={t('records.no_records_desc')}
            />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loadingRecords && records.length === 0}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },
  header: {
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
    borderRadius: radius.pill,
  },
  chipRow: {
    paddingVertical: spacing.sm,
  },
  skeletonTimeline: {
    height: 100,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    marginLeft: 30,
  },
});
