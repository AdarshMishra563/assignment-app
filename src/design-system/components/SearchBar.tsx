import React from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  filterActive?: boolean;
  filterIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search doctors, medicines, tests...',
  onClear,
  onFilterPress,
  filterActive,
  filterIcon,
  style,
}) => {
  const COLOR = useColor();

  return (
    <View style={[styles.container, { backgroundColor: COLOR.surface, borderColor: COLOR.border }, style]}>
      <Search size={18} color={COLOR.textMuted} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLOR.textMuted}
        style={[styles.input, typography.body, { color: COLOR.text }]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clearBtn}
        >
          <X size={16} color={COLOR.textMuted} />
        </Pressable>
      ) : null}
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filter"
          accessibilityState={{ selected: !!filterActive }}
          style={[
            styles.filterBtn,
            {
              backgroundColor: filterActive ? COLOR.primary : COLOR.surfaceAlt,
              borderColor: filterActive ? COLOR.primary : COLOR.border,
            },
          ]}
        >
          {filterIcon ? (
            filterIcon
          ) : (
            <Search size={16} color={filterActive ? COLOR.textInverse : COLOR.textMuted} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  filterBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
