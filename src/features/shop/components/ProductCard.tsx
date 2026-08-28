import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Heart, Minus, Plus, Star } from 'lucide-react-native';
import i18n from 'i18next';
import { Product } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Badge } from '../../../design-system/components/Badge';
import { usePatientAllergies } from '../../../shared/hooks/usePatientAllergies';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addToCart, updateQuantity } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onPress }) => {
  const COLOR = useColor();
  const dispatch = useAppDispatch();
  const allergies = usePatientAllergies();

  const isSaved = useAppSelector((state) =>
    state.wishlist.items.some((p) => p.id === product.id)
  );

  const cartQuantity = useAppSelector(
    (state) => state.cart.items.find((i) => i.product.id === product.id)?.quantity || 0
  );

  // Check allergy clash
  const matchedAllergies = product.allergyTags.filter((tag) =>
    allergies.some((a) => a.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(a.toLowerCase()))
  );
  const hasAllergyWarning = matchedAllergies.length > 0;

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const productDisplayName = i18n.language === 'hi' && product.nameHi ? product.nameHi : product.name;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${productDisplayName}, ₹${product.price}, ${product.rating.toFixed(1)} star rating`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: COLOR.surface, borderColor: COLOR.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={productDisplayName}
        />

        {discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: COLOR.accent }]}>
            <Text style={[typography.label, { color: '#FFFFFF' }]}>{discount}% OFF</Text>
          </View>
        )}

        <Pressable
          onPress={() => dispatch(toggleWishlist(product))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          accessibilityState={{ selected: isSaved }}
          style={[styles.wishlistBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
        >
          <Heart
            size={16}
            color={isSaved ? COLOR.danger : '#555555'}
            fill={isSaved ? COLOR.danger : 'transparent'}
          />
        </Pressable>
      </View>

      <View style={styles.details}>
        {hasAllergyWarning && (
          <View style={[styles.allergyWarning, { backgroundColor: COLOR.dangerSoft }]}>
            <AlertTriangle size={11} color={COLOR.danger} style={{ marginRight: 3 }} />
            <Text style={[typography.label, { color: COLOR.danger, fontSize: 9.5 }]} numberOfLines={1}>
              Allergy Warning: {matchedAllergies.join(', ')}
            </Text>
          </View>
        )}

        <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '800' }]} numberOfLines={1}>
          {product.category}
        </Text>

        <Text style={[typography.subtitle, { color: COLOR.text, marginTop: 2 }]} numberOfLines={2}>
          {i18n.language === 'hi' && product.nameHi ? product.nameHi : product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Star size={12} color={COLOR.accent} fill={COLOR.accent} />
          <Text style={[typography.label, { color: COLOR.text, marginLeft: 3 }]}>
            {product.rating.toFixed(1)}
          </Text>
          <Text style={[typography.label, { color: COLOR.textMuted, marginLeft: 2 }]}>
            ({product.ratingCount})
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={[typography.subtitle, { color: COLOR.text, fontWeight: '800' }]}>
              ₹{product.price}
            </Text>
            {product.originalPrice > product.price && (
              <Text style={[typography.caption, styles.strikethrough, { color: COLOR.textMuted }]}>
                ₹{product.originalPrice}
              </Text>
            )}
          </View>

          {cartQuantity > 0 ? (
            <View style={[styles.stepper, { backgroundColor: COLOR.primary }]}>
              <Pressable
                onPress={() =>
                  dispatch(updateQuantity({ productId: product.id, quantity: cartQuantity - 1 }))
                }
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
                style={styles.stepBtn}
              >
                <Minus size={14} color={COLOR.textInverse} />
              </Pressable>
              <Text style={[typography.label, { color: COLOR.textInverse, fontWeight: '800', marginHorizontal: 6 }]}>
                {cartQuantity}
              </Text>
              <Pressable
                onPress={() =>
                  dispatch(updateQuantity({ productId: product.id, quantity: cartQuantity + 1 }))
                }
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
                style={styles.stepBtn}
              >
                <Plus size={14} color={COLOR.textInverse} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => dispatch(addToCart({ product }))}
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
              style={[styles.addBtn, { backgroundColor: COLOR.primary }]}
            >
              <Plus size={16} color={COLOR.textInverse} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.96,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#EEF3EA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  wishlistBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: 6,
    borderRadius: radius.pill,
  },
  details: {
    padding: spacing.md,
  },
  allergyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    fontSize: 11,
  },
  addBtn: {
    padding: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: {
    padding: 4,
  },
});
