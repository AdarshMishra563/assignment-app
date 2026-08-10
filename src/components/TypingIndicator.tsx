import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface TypingIndicatorProps {
  username: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.dot} />
        <View style={[styles.dot, { opacity: 0.7 }]} />
        <View style={[styles.dot, { opacity: 0.4 }]} />
      </View>
      <Text style={styles.text}>{username} is typing...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8
  },
  bubble: {
    flexDirection: 'row',
    backgroundColor: Colors.chatBubbleReceiver,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic'
  }
});
