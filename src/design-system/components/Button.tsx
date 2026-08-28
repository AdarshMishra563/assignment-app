import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const COLOR = useColor();

  const getStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border, borderWidth: 1 },
          text: { color: COLOR.text },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderColor: COLOR.primary, borderWidth: 1.5 },
          text: { color: COLOR.primary },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: COLOR.primary },
        };
      case 'danger':
        return {
          container: { backgroundColor: COLOR.danger },
          text: { color: '#FFFFFF' },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: COLOR.primary },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const vStyle = getStyle();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        vStyle.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text.color} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconBox}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              vStyle.text,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    marginRight: spacing.xs + 2,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
