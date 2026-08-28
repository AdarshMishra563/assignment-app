import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export const MonthSectionHeader: React.FC<{ monthTitle: string; recordCount: number }> = ({
  monthTitle,
  recordCount,
}) => {
  const COLOR = useColor();

  return (
    <View style={[styles.container, { backgroundColor: COLOR.surfaceAlt }]}>
      <Calendar size={14} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
      <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800' }]}>
        {monthTitle}
      </Text>
      <View style={[styles.countPill, { backgroundColor: COLOR.surface }]}>
        <Text style={[typography.label, { color: COLOR.primary, fontSize: 10 }]}>
          {recordCount} {recordCount === 1 ? 'entry' : 'entries'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  countPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
  },
});
