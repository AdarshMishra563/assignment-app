import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Clock, Lock } from 'lucide-react-native';
import { Slot } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

interface SlotGridProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: Slot) => void;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ slots, selectedSlotId, onSelectSlot }) => {
  const COLOR = useColor();

  const formatSlotTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const now = new Date();

  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const isSelected = selectedSlotId === slot.id;
        const isBooked = slot.status === 'booked';
        const slotDate = new Date(slot.startsAt);
        const isPast = slotDate.getTime() < now.getTime();
        const isUnavailable = isBooked || isPast;

        return (
          <Pressable
            key={slot.id}
            disabled={isUnavailable}
            onPress={() => onSelectSlot(slot)}
            style={[
              styles.slotTile,
              {
                backgroundColor: isSelected
                  ? COLOR.primary
                  : isUnavailable
                  ? COLOR.surfaceAlt
                  : COLOR.surface,
                borderColor: isSelected
                  ? COLOR.primary
                  : isUnavailable
                  ? 'transparent'
                  : COLOR.border,
                opacity: isUnavailable ? 0.6 : 1,
              },
            ]}
          >
            {isBooked ? (
              <Lock size={12} color={COLOR.textMuted} style={styles.icon} />
            ) : isPast ? (
              <Clock size={12} color={COLOR.textMuted} style={styles.icon} />
            ) : (
              <Clock
                size={12}
                color={isSelected ? '#FFFFFF' : COLOR.primary}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                typography.caption,
                {
                  fontWeight: '700',
                  color: isSelected
                    ? '#FFFFFF'
                    : isUnavailable
                    ? COLOR.textMuted
                    : COLOR.text,
                  textDecorationLine: isUnavailable ? 'line-through' : 'none',
                },
              ]}
            >
              {formatSlotTime(slot.startsAt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  slotTile: {
    width: '30%',
    marginHorizontal: '1.66%',
    marginVertical: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 4,
  },
});
