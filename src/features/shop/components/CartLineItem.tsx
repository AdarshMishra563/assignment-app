import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react-native';
import { CartItem } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { usePatientAllergies } from '../../../shared/hooks/usePatientAllergies';

interface CartLineItemProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartLineItem: React.FC<CartLineItemProps> = React.memo(({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const COLOR = useColor();
  const allergies = usePatientAllergies();
  const product = item.product;

  const matchedAllergies = product.allergyTags.filter((tag) =>
    allergies.some((a) => a.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(a.toLowerCase()))
  );
  const hasAllergyConflict = matchedAllergies.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        accessibilityRole="image"
        accessibilityLabel={product.name}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[typography.subtitle, { color: COLOR.text, flex: 1 }]} numberOfLines={1}>
            {product.name}
          </Text>
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${product.name} from cart`}
            style={{ padding: 2 }}
          >
            <Trash2 size={16} color={COLOR.danger} />
          </Pressable>
        </View>

        <Text style={[typography.caption, { color: COLOR.textMuted }]}>
          {product.category}
        </Text>

        {hasAllergyConflict && (
          <View style={[styles.allergyTag, { backgroundColor: COLOR.dangerSoft }]}>
            <AlertTriangle size={11} color={COLOR.danger} style={{ marginRight: 3 }} />
            <Text style={[typography.label, { color: COLOR.danger, fontSize: 9.5 }]}>
              Allergy Warning: {matchedAllergies.join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.bottomRow}>
          <Text style={[typography.subtitle, { color: COLOR.text, fontWeight: '800' }]}>
            ₹{product.price * item.quantity}
          </Text>

          <View style={[styles.stepper, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
            <Pressable
              onPress={onDecrement}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={styles.stepBtn}
            >
              <Minus size={14} color={COLOR.text} />
            </Pressable>
            <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800', marginHorizontal: 8 }]}>
              {item.quantity}
            </Text>
            <Pressable
              onPress={onIncrement}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={styles.stepBtn}
            >
              <Plus size={14} color={COLOR.text} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: '#EEF3EA',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepBtn: {
    padding: 4,
  },
});
