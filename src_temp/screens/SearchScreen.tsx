import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Search, UserPlus, MessageSquare } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { IUser, IChatRoom } from '../types';
import { apiClient } from '../api/client';

interface SearchScreenProps {
  onSelectChat: (room: IChatRoom) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectChat }) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocketContext();
  const { theme } = useTheme();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    (u.username?.toLowerCase() || '').includes((query || '').toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes((query || '').toLowerCase())
  );

  const handleConnectAndChat = async (targetUser: IUser) => {
    try {
      const res = await apiClient.post('/chats/direct', { targetUserId: targetUser.id });
      onSelectChat(res.data.data);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Search Bar Header */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
          <Search size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search people, friends, or usernames..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {query ? 'Search Results' : 'Suggested People You May Know'}
      </Text>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.userCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <UserAvatar
                name={item.username}
                uri={item.avatarUrl}
                size={48}
                isOnline={onlineUsers.get(item.id) ?? item.isOnline}
              />

              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>{item.username}</Text>
                <Text style={[styles.userEmail, { color: theme.textMuted }]}>{item.email}</Text>
              </View>

              <TouchableOpacity
                style={[styles.connectBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleConnectAndChat(item)}
              >
                <MessageSquare size={16} color="#FFFFFF" />
                <Text style={styles.connectBtnText}>Chat</Text>
              </TouchableOpacity>
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
    paddingTop: 12
  },
  searchHeader: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 14
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 12
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 15,
    fontWeight: '700'
  },
  userEmail: {
    fontSize: 12
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  }
});
