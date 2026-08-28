import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Colors } from '../theme/colors';

interface UserAvatarProps {
  uri?: string;
  name: string;
  size?: number;
  isOnline?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  uri,
  name,
  size = 48,
  isOnline = false
}) => {
  const fallbackInitial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initialText, { fontSize: size * 0.4 }]}>{fallbackInitial}</Text>
        </View>
      )}

      {isOnline && (
        <View
          style={[
            styles.onlineBadge,
            {
              width: Math.max(12, size * 0.25),
              height: Math.max(12, size * 0.25),
              borderRadius: Math.max(6, size * 0.125)
            }
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  image: {
    backgroundColor: '#1E293B'
  },
  fallback: {
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  initialText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.onlineBadge,
    borderWidth: 2,
    borderColor: Colors.background
  }
});
