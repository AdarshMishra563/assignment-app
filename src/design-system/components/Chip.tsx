import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const Chip: React.FC<{
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ label, active, onPress, icon, style }) => {
  const COLOR = useColor();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? COLOR.primary : COLOR.surfaceAlt,
          borderColor: active ? COLOR.primary : COLOR.border,
        },
        style,
      ]}
    >
      {icon ? <>{icon}</> : null}
      <Text
        style={[
          typography.caption,
          {
            fontWeight: '700',
            color: active ? COLOR.textInverse : COLOR.textMuted,
            marginLeft: icon ? 4 : 0,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
});
