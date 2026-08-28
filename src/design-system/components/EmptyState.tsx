import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useColor } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action, style }) => {
  const COLOR = useColor();

  return (
    <View style={[styles.container, style]}>
      {icon}
      <Text style={[typography.subtitle, { color: COLOR.text, marginTop: spacing.md, textAlign: 'center' }]}>
        {title}
      </Text>
      {message ? (
        <Text
          style={[
            typography.body,
            { color: COLOR.textMuted, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl },
          ]}
        >
          {message}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
});
