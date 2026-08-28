import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';

export const Card: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}> = ({ children, style, elevated = true }) => {
  const COLOR = useColor();
  return (
    <View
      style={[
        {
          backgroundColor: COLOR.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: COLOR.border,
          padding: spacing.md,
        },
        elevated && styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
});
