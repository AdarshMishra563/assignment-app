import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, UserPlus, UserCheck, MessageSquare, Users } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { IUser, IChatRoom } from '../types';
import { apiClient } from '../api/client';

interface FriendsScreenProps {
  onSelectChat: (room: IChatRoom) => void;
  onOpenProfile: (userId: string) => void;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({
  onSelectChat,
  onOpenProfile,
}) => {
  const { user: currentUser } = useAuth();
  const { onlineUsers } = useSocketContext();
  const { theme } = useTheme();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      // Filter out self
      const allUsers: IUser[] = res.data.data || [];
      const otherUsers = allUsers.filter((u) => u.id !== currentUser?.id);
      setUsers(otherUsers);
    } catch (err) {
      console.error('Error fetching registered app users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleFollowUser = (userId: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleStartChat = async (targetUser: IUser) => {
    try {
      const res = await apiClient.post('/chats/direct', { targetUserId: targetUser.id });
      onSelectChat(res.data.data);
    } catch (err) {
      console.error('Failed to start direct chat:', err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.username?.toLowerCase() || '').includes((query || '').toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes((query || '').toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Screen Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <View style={styles.headerTitleRow}>
          <Users size={22} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>App Friends & Community</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
          Discover registered Pulse Chat users, add friends, and start chatting!
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBoxContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
          ]}
        >
          <Search size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search registered app users..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const isOnline = onlineUsers.get(item.id) ?? item.isOnline;
            const isFollowing = !!followingMap[item.id];

            return (
              <View
                style={[
                  styles.userCard,
                  { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
                ]}
              >
                <TouchableOpacity onPress={() => onOpenProfile(item.id)}>
                  <UserAvatar name={item.username} uri={item.avatarUrl} size={52} isOnline={isOnline} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => onOpenProfile(item.id)}
                >
                  <View style={styles.nameRow}>
                    <Text style={[styles.userName, { color: theme.textPrimary }]}>{item.username}</Text>
                    {isOnline && (
                      <View style={styles.onlineBadgeTag}>
                        <Text style={styles.onlineTagText}>Online</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.userEmail, { color: theme.textMuted }]}>{item.email}</Text>
                </TouchableOpacity>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.iconBtn,
                      {
                        backgroundColor: isFollowing ? theme.cardBackground : 'rgba(0, 132, 255, 0.15)',
                        borderColor: theme.cardBorder,
                        borderWidth: isFollowing ? 1 : 0,
                      },
                    ]}
                    onPress={() => toggleFollowUser(item.id)}
                  >
                    {isFollowing ? (
                      <UserCheck size={18} color={theme.primary} />
                    ) : (
                      <UserPlus size={18} color={theme.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chatBtn, { backgroundColor: theme.primary }]}
                    onPress={() => handleStartChat(item)}
                  >
                    <MessageSquare size={16} color="#FFFFFF" />
                    <Text style={styles.chatBtnText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No registered users found matching "{query}".
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  searchBoxContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  onlineBadgeTag: {
    backgroundColor: 'rgba(49, 162, 76, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  onlineTagText: {
    color: '#31A24C',
    fontSize: 10,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
