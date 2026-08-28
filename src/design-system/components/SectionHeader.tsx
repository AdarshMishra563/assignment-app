import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useColor } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface SectionHeaderProps {
  title: string;
  buttonText?: string;
  onPress?: () => void;
  description?: string;
  align?: 'default' | 'center';
  containerStyle?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  buttonText,
  onPress,
  description,
  align = 'default',
  containerStyle,
}) => {
  const COLOR = useColor();

  if (align === 'center') {
    return (
      <View style={[styles.centerWrap, containerStyle]}>
        <View style={styles.centerRow}>
          <Sparkles size={16} color={COLOR.accent} />
          <Text style={[typography.subtitle, { color: COLOR.accent, marginHorizontal: spacing.sm }]}>
            {title}
          </Text>
          <Sparkles size={16} color={COLOR.accent} />
        </View>
        {description ? (
          <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 4, textAlign: 'center' }]}>
            {description}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, containerStyle]}>
      <View style={styles.row}>
        <Text style={[typography.subtitle, { color: COLOR.text }]}>{title}</Text>
        {buttonText ? (
          <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '700' }]}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {description ? (
        <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 2 }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  centerWrap: { alignItems: 'center', paddingVertical: spacing.md },
  centerRow: { flexDirection: 'row', alignItems: 'center' },
});
