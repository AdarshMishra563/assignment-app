import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export type TabType = 'home' | 'search' | 'post' | 'chat' | 'profile';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'home', label: 'Feed', icon: Home },
    { key: 'search', label: 'Search', icon: Search },
    { key: 'post', label: 'Post', icon: PlusSquare },
    { key: 'chat', label: 'Chats', icon: MessageSquare },
    { key: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderTopColor: theme.cardBorder }]}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.key;
        const color = isActive ? theme.primary : theme.textMuted;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={() => onTabChange(tab.key)}
          >
            <IconComponent size={22} color={color} />
            <Text style={[styles.tabLabel, { color, fontWeight: isActive ? '700' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3
  }
});
