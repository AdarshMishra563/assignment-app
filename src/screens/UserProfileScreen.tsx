import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  MessageSquare,
  UserPlus,
  UserCheck,
  Heart,
  MessageCircle,
  X,
  Film,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { VideoPlayer } from '../components/VideoPlayer';
import { IUser, IChatRoom, IPost } from '../types';
import { apiClient } from '../api/client';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 2;
const GRID_COLS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onSelectChat: (room: IChatRoom) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userId,
  onBack,
  onSelectChat,
}) => {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();

  const [profileUser, setProfileUser] = useState<IUser | null>(null);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [usersCount, setUsersCount] = useState(0);

  // Viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const viewerListRef = useRef<FlatList>(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/posts'),
      ]);

      const allUsers: IUser[] = usersRes.data.data || [];
      const foundUser: IUser = allUsers.find((u: IUser) => u.id === userId) as IUser;
      const allPosts: IPost[] = postsRes.data.data || [];
      const userFilteredPosts = allPosts.filter((p) => p.userId === userId);

      setProfileUser(foundUser || null);
      setUserPosts(userFilteredPosts);
      setUsersCount(allUsers.filter((u) => u.id !== userId).length);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  const handleStartChat = async () => {
    if (!profileUser) return;
    setStartingChat(true);
    try {
      const res = await apiClient.post('/chats/direct', { targetUserId: profileUser.id });
      onSelectChat(res.data.data);
    } catch (err) {
      console.error('Error starting chat:', err);
      Alert.alert('Error', 'Could not open chat room.');
    } finally {
      setStartingChat(false);
    }
  };

  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);

  const openPostViewer = (index: number) => {
    setViewerInitialIndex(index);
    setViewerVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>User Profile Not Found</Text>
      </View>
    );
  }

  const isSelf = currentUser?.id === profileUser.id;

  // ── Grid Tile ──
  const renderGridTile = ({ item, index }: { item: IPost; index: number }) => (
    <TouchableOpacity
      style={[styles.gridTile, { marginRight: (index + 1) % GRID_COLS === 0 ? 0 : GRID_GAP }]}
      activeOpacity={0.8}
      onPress={() => openPostViewer(index)}
    >
      {item.mediaUrl ? (
        <Image source={{ uri: item.mediaUrl }} style={styles.gridImage} resizeMode="cover" />
      ) : (
        <View style={[styles.gridTextTile, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.gridTextContent, { color: theme.textPrimary }]} numberOfLines={4}>
            {item.caption}
          </Text>
        </View>
      )}
      {item.type === 'video' && (
        <View style={styles.videoIconOverlay}>
          <Film size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  // ── Fullscreen Viewer Slide ──
  const renderViewerItem = ({ item }: { item: IPost }) => {
    const hasLiked = currentUser ? item.likes?.includes(currentUser.id) : false;

    return (
      <View style={[styles.viewerSlide, { backgroundColor: theme.background }]}>
        <View style={styles.viewerPostHeader}>
          <UserAvatar name={profileUser.username} uri={profileUser.avatarUrl} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.viewerUsername, { color: theme.textPrimary }]}>{profileUser.username}</Text>
            <Text style={[styles.viewerDate, { color: theme.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {item.mediaUrl ? (
          <View style={styles.viewerMediaContainer}>
            {item.type === 'video' ? (
              <VideoPlayer uri={item.mediaUrl} posterUri={item.thumbnailUrl} compact={false} muted={false} autoPlay={false} />
            ) : (
              <Image source={{ uri: item.mediaUrl }} style={styles.viewerMediaImage} resizeMode="contain" />
            )}
          </View>
        ) : null}

        <View style={styles.viewerActionsRow}>
          <TouchableOpacity style={styles.viewerActionBtn}>
            <Heart size={24} color={hasLiked ? '#FA383E' : theme.textPrimary} fill={hasLiked ? '#FA383E' : 'none'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewerActionBtn}>
            <MessageCircle size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.viewerLikes, { color: theme.textPrimary }]}>
          {item.likes?.length || 0} {(item.likes?.length || 0) === 1 ? 'like' : 'likes'}
        </Text>

        {item.caption ? (
          <Text style={[styles.viewerCaption, { color: theme.textPrimary }]}>
            <Text style={{ fontWeight: '800' }}>{profileUser.username} </Text>
            {item.caption}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{profileUser.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Profile Info & Grid Posts */}
      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        numColumns={GRID_COLS}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={() => (
          <View style={styles.profileHeaderCard}>
            {/* Avatar & Stats */}
            <View style={styles.avatarRow}>
              <UserAvatar name={profileUser.username} uri={profileUser.avatarUrl} size={84} isOnline={profileUser.isOnline} />
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{userPosts.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>Posts</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{totalLikes}</Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>Likes</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{usersCount}</Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>Users</Text>
                </View>
              </View>
            </View>

            {/* Username & Bio */}
            <Text style={[styles.bioName, { color: theme.textPrimary }]}>{profileUser.username}</Text>
            <Text style={[styles.bioEmail, { color: theme.textMuted }]}>{profileUser.email}</Text>
            <Text style={[styles.bioText, { color: theme.textSecondary }]}>
              Registered Pulse Chat User 🚀 • Real-time messaging & media sharing.
            </Text>

            {/* Action Buttons */}
            {!isSelf && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: isFollowing ? theme.cardBackground : theme.primary, borderColor: theme.cardBorder, borderWidth: isFollowing ? 1 : 0 },
                  ]}
                  onPress={handleToggleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={18} color={theme.textPrimary} />
                      <Text style={[styles.btnText, { color: theme.textPrimary }]}>Friends</Text>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} color="#FFFFFF" />
                      <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Add Friend</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}
                  onPress={handleStartChat}
                  disabled={startingChat}
                >
                  {startingChat ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <MessageSquare size={18} color={theme.primary} />
                      <Text style={[styles.btnText, { color: theme.primary }]}>Message</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.gridDivider, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.gridLabel, { color: theme.textPrimary }]}>Posts</Text>
            </View>
          </View>
        )}
        renderItem={renderGridTile}
        ListEmptyComponent={() => (
          <View style={styles.emptyPostsBox}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No posts published yet by {profileUser.username}.</Text>
          </View>
        )}
      />

      {/* ── Fullscreen Post Viewer Modal ── */}
      <Modal
        visible={viewerVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={[styles.viewerContainer, { backgroundColor: theme.background }]}>
          {/* Viewer Header */}
          <View style={[styles.viewerHeader, { borderBottomColor: theme.cardBorder }]}>
            <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.viewerBackBtn}>
              <ArrowLeft size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.viewerHeaderTitle, { color: theme.textPrimary }]}>Posts</Text>
            <View style={{ width: 32 }} />
          </View>

          <FlatList
            ref={viewerListRef}
            data={userPosts}
            keyExtractor={(item) => item.id}
            renderItem={renderViewerItem}
            initialScrollIndex={viewerInitialIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: 0,
              index,
            })}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  notFoundText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  profileHeaderCard: {
    padding: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  bioName: {
    fontSize: 18,
    fontWeight: '800',
  },
  bioEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  gridDivider: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginTop: 14,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gridTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginBottom: GRID_GAP,
    backgroundColor: '#1A1A2E',
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridTextTile: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTextContent: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  videoIconOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  emptyPostsBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  // Viewer Modal
  viewerContainer: {
    flex: 1,
  },
  viewerHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  viewerBackBtn: {
    padding: 6,
  },
  viewerHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  viewerSlide: {
    paddingBottom: 24,
  },
  viewerPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  viewerUsername: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewerDate: {
    fontSize: 11,
  },
  viewerMediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#000000',
  },
  viewerMediaImage: {
    width: '100%',
    height: '100%',
  },
  viewerActionsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  viewerActionBtn: {
    padding: 2,
  },
  viewerLikes: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  viewerCaption: {
    paddingHorizontal: 14,
    fontSize: 14,
    lineHeight: 20,
  },
});
