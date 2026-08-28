import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react-native';
import { useAppSelector } from '../../../store/hooks';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { EmptyState } from '../../../design-system/components/EmptyState';
import { GradientButton } from '../../../design-system/components/GradientButton';

export const WishlistScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { items } = useAppSelector((state) => state.wishlist);

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
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingBottom: insets.bottom || spacing.md }]}>
      <View style={styles.header}>
        <Text style={[typography.title, { color: COLOR.text }]}>{t('shop.wishlist_title')} ({items.length})</Text>
        <Text style={[typography.caption, { color: COLOR.textMuted }]}>
          {t('shop.wishlist_subtitle')}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon={<Heart size={48} color={COLOR.textMuted} />}
            title={t('shop.wishlist_empty_title')}
            message={t('shop.wishlist_empty_desc')}
            action={
              <GradientButton
                title={t('shop.browse_remedies')}
                onPress={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })}
              />
            }
          />
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 + insets.bottom }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: 80,
  },
  columnWrapper: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
});
