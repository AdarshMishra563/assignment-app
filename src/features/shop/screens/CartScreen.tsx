import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Tag, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from '../store/cartSlice';
import { CartLineItem } from '../components/CartLineItem';
import { CartItem } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Card } from '../../../design-system/components/Card';
import { TextField } from '../../../design-system/components/TextField';
import { Button } from '../../../design-system/components/Button';
import { GradientButton } from '../../../design-system/components/GradientButton';
import { DashedDivider } from '../../../design-system/components/DashedDivider';
import { EmptyState } from '../../../design-system/components/EmptyState';

export const CartScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { items, appliedCoupon, deliveryFee } = useAppSelector((state) => state.cart);

  const [couponInput, setCouponInput] = useState('');

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = appliedCoupon
    ? Math.min(
        Math.round((subtotal * appliedCoupon.discountPercentage) / 100),
        appliedCoupon.maxDiscount
      )
    : 0;

  const total = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? deliveryFee : 0));

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      dispatch(applyCoupon(couponInput));
      setCouponInput('');
    }
  };

  const renderFooter = () => {
    if (items.length === 0) return null;

    return (
      <View style={styles.footer}>
        {/* Coupon Card */}
        <Card style={styles.couponCard}>
          <View style={styles.couponHeader}>
            <Tag size={16} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>{t('shop.apply_coupon')}</Text>
          </View>

          {appliedCoupon ? (
            <View style={[styles.appliedCouponRow, { backgroundColor: COLOR.successSoft }]}>
              <View>
                <Text style={[typography.caption, { color: COLOR.success, fontWeight: '800' }]}>
                  {appliedCoupon.code} Applied!
                </Text>
                <Text style={[typography.label, { color: COLOR.success }]}>
                  {appliedCoupon.discountPercentage}% off (Saved ₹{discountAmount})
                </Text>
              </View>
              <Button
                title={t('shop.remove')}
                variant="ghost"
                onPress={() => dispatch(removeCoupon())}
                textStyle={{ color: COLOR.danger, fontSize: 12 }}
              />
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextField
                placeholder="Enter AMRUTAM10 or VEDIC20"
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
                containerStyle={{ flex: 1, marginBottom: 0, marginRight: spacing.sm }}
              />
              <Button
                title={t('shop.apply')}
                variant="outline"
                onPress={handleApplyCoupon}
                style={{ paddingVertical: 12 }}
              />
            </View>
          )}
        </Card>

        {/* Bill Breakdown */}
        <Card style={styles.billCard}>
          <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.sm }]}>
            {t('shop.price_summary')}
          </Text>

          <View style={styles.billRow}>
            <Text style={[typography.body, { color: COLOR.textMuted }]}>{t('shop.items_subtotal')}</Text>
            <Text style={[typography.body, { color: COLOR.text, fontWeight: '700' }]}>
              ₹{subtotal}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={[typography.body, { color: COLOR.success }]}>
                {t('shop.promotional_discount')}
              </Text>
              <Text style={[typography.body, { color: COLOR.success, fontWeight: '700' }]}>
                -₹{discountAmount}
              </Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={[typography.body, { color: COLOR.textMuted }]}>
              {t('shop.shipping')}
            </Text>
            <Text style={[typography.body, { color: COLOR.text, fontWeight: '700' }]}>
              ₹{deliveryFee}
            </Text>
          </View>

          <DashedDivider color={COLOR.border} />

          <View style={[styles.billRow, { marginTop: spacing.xs }]}>
            <Text style={[typography.subtitle, { color: COLOR.text }]}>{t('shop.total_to_pay')}</Text>
            <Text style={[typography.title, { color: COLOR.primary, fontWeight: '900' }]}>
              ₹{total}
            </Text>
          </View>
        </Card>

        <View style={styles.securePromise}>
          <ShieldCheck size={16} color={COLOR.success} style={{ marginRight: spacing.xs }} />
          <Text style={[typography.caption, { color: COLOR.textMuted }]}>
            {t('shop.genuine_promise')}
          </Text>
        </View>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartLineItem
        item={item}
        onIncrement={() =>
          dispatch(
            updateQuantity({
              productId: item.product.id,
              quantity: item.quantity + 1,
            })
          )
        }
        onDecrement={() =>
          dispatch(
            updateQuantity({
              productId: item.product.id,
              quantity: item.quantity - 1,
            })
          )
        }
        onRemove={() => dispatch(removeFromCart(item.product.id))}
      />
    ),
    [dispatch]
  );

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background }]}>
      <View style={styles.header}>
        <Text style={[typography.title, { color: COLOR.text }]}>{t('shop.cart_title')} ({items.length})</Text>
        <Text style={[typography.caption, { color: COLOR.textMuted }]}>
          {t('shop.cart_subtitle')}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon={<ShoppingBag size={52} color={COLOR.textMuted} />}
            title={t('shop.cart_empty_title')}
            message={t('shop.cart_empty_desc')}
            action={
              <GradientButton
                title={t('home.hero2_cta')}
                onPress={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })}
              />
            }
          />
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: 120 + insets.bottom }]}
      />

      {items.length > 0 && (
        <View
          style={[
            styles.checkoutBar,
            {
              backgroundColor: COLOR.surface,
              borderColor: COLOR.border,
              paddingBottom: insets.bottom ? insets.bottom + spacing.sm : spacing.md,
            },
          ]}
        >
          <View>
            <Text style={[typography.label, { color: COLOR.textMuted }]}>{t('shop.total_to_pay')}</Text>
            <Text style={[typography.title, { color: COLOR.text, fontWeight: '900' }]}>
              ₹{total}
            </Text>
          </View>
          <GradientButton
            title={t('shop.checkout')}
            icon={<ArrowRight size={16} color="#FFFFFF" />}
            onPress={() => navigation.navigate('Checkout', { total, subtotal, discountAmount })}
            style={{ flex: 1, marginLeft: spacing.lg }}
          />
        </View>
      )}
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
    padding: spacing.lg,
    paddingBottom: 110,
  },
  footer: {
    marginTop: spacing.md,
  },
  couponCard: {
    marginBottom: spacing.md,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  billCard: {
    marginBottom: spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  securePromise: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  checkoutBar: {
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
