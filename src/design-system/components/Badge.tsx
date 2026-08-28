import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'accent' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style, icon }) => {
  const COLOR = useColor();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: COLOR.successSoft, text: COLOR.success };
      case 'warning':
        return { bg: COLOR.warningSoft, text: COLOR.warning };
      case 'danger':
        return { bg: COLOR.dangerSoft, text: COLOR.danger };
      case 'info':
        return { bg: COLOR.infoSoft, text: COLOR.info };
      case 'primary':
        return { bg: COLOR.primarySoft, text: COLOR.primary };
      case 'accent':
        return { bg: COLOR.accentSoft, text: COLOR.accent };
      case 'default':
      default:
        return { bg: COLOR.surfaceAlt, text: COLOR.textMuted };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[typography.label, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  icon: {
    marginRight: 4,
  },
});
