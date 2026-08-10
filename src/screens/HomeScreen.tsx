import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { LogOut, Plus, Search, MessageSquarePlus, Users, Sun, Moon } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { useSocketContext } from '../context/SocketContext';
import { UserAvatar } from '../components/UserAvatar';
import { IChatRoom, IUser } from '../types';
import { apiClient } from '../api/client';
import { Colors } from '../theme/colors';

interface HomeScreenProps {
  onSelectChat: (room: IChatRoom) => void;
  onOpenProfile?: (userId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectChat, onOpenProfile }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const { onlineUsers } = useSocketContext();

  const [chats, setChats] = useState<IChatRoom[]>([]);
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Group Mode State
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chatsRes, usersRes] = await Promise.all([
        apiClient.get('/chats'),
        apiClient.get('/users')
      ]);

      // Sort chats by most recent message first
      const rawChats: IChatRoom[] = chatsRes.data.data || [];
      rawChats.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
        return timeB - timeA;
      });
      setChats(rawChats);
      setUsersList(usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load chats or users:', err);
    } finally {
      setLoading(false);
    }
  };

  const { socket } = useSocketContext();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: any) => {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c.id === newMsg.roomId);
        if (chatIndex !== -1) {
          const targetChat = {
            ...prevChats[chatIndex],
            lastMessage: newMsg,
            updatedAt: newMsg.createdAt,
            unreadCount: (prevChats[chatIndex].unreadCount || 0) + (newMsg.senderId !== user?.id ? 1 : 0)
          };
          const remainingChats = prevChats.filter((c) => c.id !== newMsg.roomId);
          return [targetChat, ...remainingChats];
        }
        return prevChats;
      });
    };

    socket.on('message:received', handleNewMessage);
    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('message:received', handleNewMessage);
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, user?.id]);

  const handleStartChat = async (targetUser: IUser) => {
    try {
      const res = await apiClient.post('/chats/direct', { targetUserId: targetUser.id });
      const room: IChatRoom = res.data.data;
      setShowNewChatModal(false);
      onSelectChat(room);
    } catch (err) {
      console.error('Error starting direct chat:', err);
    }
  };

  const filteredUsers = usersList.filter((u) =>
    (u.username?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
  );

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const toggleSelectUserForGroup = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      Alert.alert('Validation Error', 'Please enter a Group Name.');
      return;
    }
    if (selectedUserIds.length === 0) {
      Alert.alert('Validation Error', 'Please select at least 1 group member.');
      return;
    }

    setCreatingGroup(true);
    try {
      const res = await apiClient.post('/chats/group', {
        name: groupName.trim(),
        participantIds: selectedUserIds,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(groupName)}`,
      });
      const newRoom: IChatRoom = res.data.data;
      setShowNewChatModal(false);
      setIsGroupMode(false);
      setGroupName('');
      setSelectedUserIds([]);
      onSelectChat(newRoom);
    } catch (err: any) {
      console.error('Failed to create group chat:', err);
      Alert.alert('Error', err?.message || 'Could not create group chat.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const getMessagePreview = (msg: IChatRoom['lastMessage']) => {
    if (!msg) return 'Tap to start conversation';
    switch (msg.type) {
      case 'audio': return '🎤 Voice Note';
      case 'image': return '📷 Photo';
      case 'video': return '🎬 Video';
      case 'file': return '📎 File';
      default: return msg.content;
    }
  };

  const formatChatTime = (dateStr: string | Date) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const renderChatItem = ({ item }: { item: IChatRoom }) => {
    const otherParticipant = item.participants.find((p) => p.id !== user?.id);
    const roomTitle = item.isGroup ? item.name : (otherParticipant?.username || 'Chat');
    const avatarUrl = otherParticipant?.avatarUrl;
    const isOnline = otherParticipant ? onlineUsers.get(otherParticipant.id) : false;
    const hasUnread = (item.unreadCount || 0) > 0;

    return (
      <TouchableOpacity style={styles.chatCard} onPress={() => onSelectChat(item)}>
        <TouchableOpacity onPress={() => otherParticipant && onOpenProfile?.(otherParticipant.id)}>
          <UserAvatar name={roomTitle || 'C'} uri={avatarUrl} size={48} isOnline={isOnline} />
        </TouchableOpacity>

        <View style={styles.chatDetails}>
          <View style={styles.chatHeaderRow}>
            <Text style={[styles.chatTitle, hasUnread && { fontWeight: '800' }]} numberOfLines={1}>{roomTitle}</Text>
            <Text style={[styles.chatTime, hasUnread && { color: Colors.primary, fontWeight: '700' }]}>
              {item.lastMessage ? formatChatTime(item.lastMessage.createdAt) : ''}
            </Text>
          </View>

          <View style={styles.chatPreviewRow}>
            <Text style={[styles.lastMessageText, hasUnread && { color: Colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
              {getMessagePreview(item.lastMessage)}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={() => (
          <View>
            {/* Top Header Bar */}
            <View style={styles.header}>
              <View style={styles.userInfoGroup}>
                <TouchableOpacity onPress={() => user && onOpenProfile?.(user.id)}>
                  <UserAvatar name={user?.username || 'U'} uri={user?.avatarUrl} size={40} isOnline={true} />
                </TouchableOpacity>
                <Text style={styles.userName}>Messages</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(toggleTheme())}>
                  {isDark ? <Sun size={20} color="#FBBF24" /> : <Moon size={20} color="#6366F1" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
                  <LogOut size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchBarContainer}>
              <Search size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search chats, contacts, or people..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Recent Conversations List */}
            <View style={styles.chatsListSection}>
              <View style={styles.chatsListHeader}>
                <Text style={styles.sectionLabel}>Recent Conversations</Text>
                <TouchableOpacity onPress={() => setShowNewChatModal(true)}>
                  <MessageSquarePlus size={22} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
              ) : chats.length === 0 ? (
                <View style={{ paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textMuted, fontSize: 13, textAlign: 'center' }}>
                    No active chats yet. Start a conversation with registered users below!
                  </Text>
                </View>
              ) : (
                <View>
                  {chats.map((chatItem) => (
                    <React.Fragment key={chatItem.id}>
                      {renderChatItem({ item: chatItem })}
                    </React.Fragment>
                  ))}
                </View>
              )}
            </View>

            {/* Registered App Users Section Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={styles.sectionLabel}>Registered App Users & Community</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const isOnline = onlineUsers.get(item.id) ?? item.isOnline;
          return (
            <View style={{ paddingHorizontal: 20 }}>
              <View style={styles.modalUserCard}>
                <TouchableOpacity onPress={() => onOpenProfile?.(item.id)}>
                  <UserAvatar name={item.username} uri={item.avatarUrl} size={44} isOnline={isOnline} />
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => onOpenProfile?.(item.id)}>
                  <Text style={styles.modalUserName}>{item.username}</Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12 }}>{item.email}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => handleStartChat(item)}
                >
                  <MessageSquarePlus size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Start New Chat & Group Modal */}
      <Modal visible={showNewChatModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header Tabs */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: !isGroupMode ? Colors.primary : 'rgba(255,255,255,0.08)',
                }}
                onPress={() => setIsGroupMode(false)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Direct Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: isGroupMode ? Colors.primary : 'rgba(255,255,255,0.08)',
                }}
                onPress={() => setIsGroupMode(true)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Create Group</Text>
              </TouchableOpacity>
            </View>

            {isGroupMode && (
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: Colors.inputBackground,
                    borderColor: Colors.inputBorder,
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 44,
                    marginBottom: 12,
                    color: Colors.textPrimary,
                  },
                ]}
                placeholder="Group Name (e.g. Project Pulse Team)"
                placeholderTextColor={Colors.textMuted}
                value={groupName}
                onChangeText={setGroupName}
              />
            )}

            <FlatList
              data={usersList}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 280 }}
              renderItem={({ item }) => {
                const isSelected = selectedUserIds.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalUserCard,
                      isSelected && { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: 12 },
                    ]}
                    onPress={() => {
                      if (isGroupMode) {
                        toggleSelectUserForGroup(item.id);
                      } else {
                        handleStartChat(item);
                      }
                    }}
                  >
                    <UserAvatar name={item.username} uri={item.avatarUrl} size={40} isOnline={onlineUsers.get(item.id)} />
                    <Text style={[styles.modalUserName, { flex: 1 }]}>{item.username}</Text>
                    {isGroupMode && (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: 2,
                          borderColor: isSelected ? Colors.primary : Colors.textMuted,
                          backgroundColor: isSelected ? Colors.primary : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {isSelected && <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {isGroupMode ? (
              <TouchableOpacity
                style={[styles.startNewBtn, { marginTop: 14, alignItems: 'center' }]}
                onPress={handleCreateGroupChat}
                disabled={creatingGroup}
              >
                {creatingGroup ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.startNewBtnText}>Create Group Chat ({selectedUserIds.length})</Text>
                )}
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => {
                setShowNewChatModal(false);
                setIsGroupMode(false);
                setGroupName('');
                setSelectedUserIds([]);
              }}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  userInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  userGreeting: {
    color: Colors.textMuted,
    fontSize: 12
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800'
  },
  logoutBtn: {
    padding: 8
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.inputBorder
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14
  },
  contactsSection: {
    paddingLeft: 20,
    marginVertical: 12
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  contactAvatarItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60
  },
  contactName: {
    color: Colors.textPrimary,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center'
  },
  chatsListSection: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 8
  },
  chatsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder
  },
  chatDetails: {
    flex: 1,
    marginLeft: 14
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  chatTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  chatTime: {
    color: Colors.textMuted,
    fontSize: 11
  },
  lastMessageText: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1
  },
  chatPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 12
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14
  },
  startNewBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12
  },
  startNewBtnText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%'
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16
  },
  modalUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12
  },
  modalUserName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600'
  },
  closeModalBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12
  },
  closeModalText: {
    color: Colors.textSecondary,
    fontWeight: '600'
  }
});
