import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Home,
  ShoppingBag,
  Stethoscope,
  User,
} from 'lucide-react-native';
import { useColor } from '../design-system/theme/ThemeProvider';
import { radius, spacing } from '../design-system/theme/spacing';
import { typography } from '../design-system/theme/typography';
import { useAppSelector } from '../store/hooks';

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const COLOR = useColor();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? COLOR.primary : COLOR.textMuted;
    const size = 22;

    switch (routeName) {
      case 'HomeTab':
        return <Home size={size} color={color} />;
      case 'ConsultationsTab':
        return <Stethoscope size={size} color={color} />;
      case 'ShopTab':
        return (
          <View style={{ position: 'relative' }}>
            <ShoppingBag size={size} color={color} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: COLOR.primary }]}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        );
      case 'HealthRecordsTab':
        return <FileText size={size} color={color} />;
      case 'ProfileTab':
        return <User size={size} color={color} />;
      default:
        return <Home size={size} color={color} />;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'HomeTab':
        return t('tabs.home');
      case 'ConsultationsTab':
        return t('tabs.doctors');
      case 'ShopTab':
        return t('tabs.shop');
      case 'HealthRecordsTab':
        return t('tabs.records');
      case 'ProfileTab':
        return t('tabs.profile');
      default:
        return routeName;
    }
  };

  const bottomPadding = Math.max(insets.bottom, 6);
  const barHeight = 58 + (insets.bottom > 0 ? insets.bottom : 6);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: COLOR.surface,
          borderTopColor: COLOR.border,
          height: barHeight,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={getTabLabel(route.name)}
            accessibilityState={{ selected: isFocused }}
            style={[styles.tabItem, isFocused && { backgroundColor: COLOR.primarySoft }]}
          >
            {getTabIcon(route.name, isFocused)}
            <Text
              style={[
                typography.label,
                styles.label,
                {
                  color: isFocused ? COLOR.primary : COLOR.textMuted,
                  fontWeight: isFocused ? '800' : '600',
                },
              ]}
            >
              {getTabLabel(route.name)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 10,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
