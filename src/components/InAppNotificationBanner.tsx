import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { MessageSquare, X } from 'lucide-react-native';
import { UserAvatar } from './UserAvatar';
import { useTheme } from '../context/ThemeContext';

export interface InAppNotificationData {
  roomId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
}

interface InAppNotificationBannerProps {
  notification: InAppNotificationData | null;
  onPressOpen: (roomId: string) => void;
  onDismiss: () => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  notification,
  onPressOpen,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (notification) {
      Animated.timing(slideAnim, {
        toValue: 12,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-100);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.bannerContent}
        activeOpacity={0.9}
        onPress={() => {
          handleDismiss();
          onPressOpen(notification.roomId);
        }}
      >
        <UserAvatar name={notification.senderName} uri={notification.senderAvatar} size={42} />

        <View style={styles.textColumn}>
          <Text style={[styles.senderTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {notification.senderName}
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]} numberOfLines={1}>
            {notification.content}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.replyBtn, { backgroundColor: theme.primary }]}
          onPress={() => {
            handleDismiss();
            onPressOpen(notification.roomId);
          }}
        >
          <MessageSquare size={14} color="#FFFFFF" />
          <Text style={styles.replyBtnText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
          <X size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  textColumn: {
    flex: 1,
  },
  senderTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 13,
    marginTop: 2,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  replyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
});
