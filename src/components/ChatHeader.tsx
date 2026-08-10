import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Video, Phone, MoreVertical } from 'lucide-react-native';
import { UserAvatar } from './UserAvatar';
import { Colors } from '../theme/colors';

interface ChatHeaderProps {
  title: string;
  avatarUrl?: string;
  isOnline?: boolean;
  onBack: () => void;
  onStartVideoCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  avatarUrl,
  isOnline = false,
  onBack,
  onStartVideoCall
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <UserAvatar name={title} uri={avatarUrl} size={40} isOnline={isOnline} />

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{title}</Text>
          <Text style={styles.userStatus}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconBtn} onPress={onStartVideoCall}>
          <Video size={22} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <MoreVertical size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: Colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  backBtn: {
    padding: 4
  },
  userInfo: {
    flex: 1
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  userStatus: {
    color: Colors.textSecondary,
    fontSize: 12
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBtn: {
    padding: 8
  }
});
