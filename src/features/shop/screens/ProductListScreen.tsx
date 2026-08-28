import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Sparkles, Heart, ShoppingCart } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchProducts,
  setCategory,
  setDoshaFilter,
  setSortBy,
} from '../store/productsSlice';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/mockProducts';
import { Product } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { SearchBar } from '../../../design-system/components/SearchBar';
import { Chip } from '../../../design-system/components/Chip';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { ShimmerPlaceholder } from '../../../design-system/components/ShimmerPlaceholder';
import { RadialGlowBackground } from '../../../design-system/components/RadialGlowBackground';
import { useDebounce } from '../../../shared/hooks/useDebounce';

export const ProductListScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    products,
    totalProducts,
    loadingProducts,
    selectedCategory,
    selectedDoshaFilter,
    searchQuery,
    sortBy,
    productsPage,
    hasMoreProducts,
  } = useAppSelector((state) => state.products);

  const patientDosha = useAppSelector((state) => state.patientProfile.dosha);
  const cartItemsCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: 1,
        category: selectedCategory,
        dosha: selectedDoshaFilter,
        search: debouncedSearch,
        sortBy,
        refresh: true,
      })
    );
  }, [dispatch, selectedCategory, selectedDoshaFilter, debouncedSearch, sortBy]);

  const handleRefresh = useCallback(() => {
    dispatch(
      fetchProducts({
        page: 1,
        category: selectedCategory,
        dosha: selectedDoshaFilter,
        search: debouncedSearch,
        sortBy,
        refresh: true,
      })
    );
  }, [dispatch, selectedCategory, selectedDoshaFilter, debouncedSearch, sortBy]);

  const handleEndReached = () => {
    if (!loadingProducts && hasMoreProducts) {
      dispatch(
        fetchProducts({
          page: productsPage + 1,
          category: selectedCategory,
          dosha: selectedDoshaFilter,
          search: debouncedSearch,
          sortBy,
        })
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <RadialGlowBackground color={COLOR.accent} opacity={0.12} />

      <View style={styles.titleRow}>
        <View>
          <Text style={[typography.label, { color: COLOR.accent, textTransform: 'uppercase' }]}>
            {t('shop.subtitle')}
          </Text>
          <Text style={[typography.title, { color: COLOR.text, marginTop: 2 }]}>
            {t('shop.title')}
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <Pressable
            onPress={() => navigation.navigate('Wishlist')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View wishlist"
            style={[styles.iconButton, { backgroundColor: COLOR.surfaceAlt }]}
          >
            <Heart size={20} color={COLOR.text} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Cart')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={cartItemsCount > 0 ? `View cart, ${cartItemsCount} items` : 'View cart'}
            style={[styles.iconButton, { backgroundColor: COLOR.surfaceAlt, marginLeft: spacing.xs }]}
          >
            <ShoppingCart size={20} color={COLOR.text} />
            {cartItemsCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: COLOR.primary }]}>
                <Text style={[typography.label, { color: COLOR.textInverse, fontSize: 10 }]}>
                  {cartItemsCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Dosha recommendation banner */}
      {patientDosha && (
        <View style={[styles.doshaBanner, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
          <Sparkles size={16} color={COLOR.accent} style={{ marginRight: spacing.xs }} />
          <Text style={[typography.caption, { color: COLOR.text, flex: 1 }]}>
            Showing classical formulations balancing your <Text style={{ fontWeight: '800', color: COLOR.primary }}>{patientDosha.toUpperCase()}</Text> constitution.
          </Text>
          <Pressable
            onPress={() =>
              dispatch(
                setDoshaFilter(selectedDoshaFilter === patientDosha ? null : patientDosha)
              )
            }
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${patientDosha} dosha`}
            accessibilityState={{ selected: selectedDoshaFilter === patientDosha }}
            style={[
              styles.doshaFilterToggle,
              {
                backgroundColor:
                  selectedDoshaFilter === patientDosha ? COLOR.primary : 'transparent',
                borderColor: COLOR.primary,
              },
            ]}
          >
            <Text
              style={[
                typography.label,
                {
                  color:
                    selectedDoshaFilter === patientDosha
                      ? COLOR.textInverse
                      : COLOR.primary,
                },
              ]}
            >
              {selectedDoshaFilter === patientDosha ? t('shop.filtered') : t('shop.filter')}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Search Bar */}
      <SearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder={t('shop.search_placeholder')}
        style={{ marginTop: spacing.md }}
      />

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onPress={() => dispatch(setCategory(cat))}
          />
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortRow}>
        <Text style={[typography.label, { color: COLOR.textMuted }]}>
          {totalProducts.toLocaleString()} REMEDIES FOUND
        </Text>
        <View style={styles.sortChips}>
          <Pressable
            onPress={() => dispatch(setSortBy('popular'))}
            accessibilityRole="button"
            accessibilityLabel={t('shop.sort_popular')}
            accessibilityState={{ selected: sortBy === 'popular' }}
            style={[styles.sortChip, sortBy === 'popular' && { backgroundColor: COLOR.primarySoft }]}
          >
            <Text style={[typography.label, { color: sortBy === 'popular' ? COLOR.primary : COLOR.textMuted }]}>
              {t('shop.sort_popular')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => dispatch(setSortBy('price_low'))}
            accessibilityRole="button"
            accessibilityLabel={t('shop.sort_price_low')}
            accessibilityState={{ selected: sortBy === 'price_low' }}
            style={[styles.sortChip, sortBy === 'price_low' && { backgroundColor: COLOR.primarySoft }]}
          >
            <Text style={[typography.label, { color: sortBy === 'price_low' ? COLOR.primary : COLOR.textMuted }]}>
              {t('shop.sort_price_low')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => dispatch(setSortBy('rating'))}
            accessibilityRole="button"
            accessibilityLabel={t('shop.sort_rating')}
            accessibilityState={{ selected: sortBy === 'rating' }}
            style={[styles.sortChip, sortBy === 'rating' && { backgroundColor: COLOR.primarySoft }]}
          >
            <Text style={[typography.label, { color: sortBy === 'rating' ? COLOR.primary : COLOR.textMuted }]}>
              {t('shop.sort_rating')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.gridItem}>
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        />
      </View>
    ),
    [navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingTop: insets.top }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loadingProducts ? (
            <View style={{ padding: spacing.lg }}>
              <ShimmerPlaceholder style={styles.skeletonGrid} />
              <ShimmerPlaceholder style={styles.skeletonGrid} />
            </View>
          ) : (
            <EmptyState
              icon={<ShoppingBag size={44} color={COLOR.textMuted} />}
              title={t('shop.no_remedies_title')}
              message={t('shop.no_remedies_desc')}
            />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loadingProducts && products.length === 0}
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doshaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  doshaFilterToggle: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginLeft: spacing.xs,
  },
  chipRow: {
    paddingVertical: spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sortChips: {
    flexDirection: 'row',
  },
  sortChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginLeft: 4,
  },
  columnWrapper: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  skeletonGrid: {
    height: 200,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
});
