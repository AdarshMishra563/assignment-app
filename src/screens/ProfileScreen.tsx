import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Settings,
  Sun,
  Moon,
  LogOut,
  Camera,
  Edit3,
  Trash2,
  Heart,
  MessageCircle,
  X,
  ChevronRight,
  Film,
  ArrowLeft,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateUserAvatar } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';

import { UserAvatar } from '../components/UserAvatar';
import { VideoPlayer } from '../components/VideoPlayer';
import { IPost, IChatRoom } from '../types';
import { apiClient } from '../api/client';
import { DarkTheme, LightTheme } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 2;
const GRID_COLS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

interface ProfileScreenProps {
  onSelectChat: (room: IChatRoom) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSelectChat }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const theme = isDark ? DarkTheme : LightTheme;

  const [myPosts, setMyPosts] = useState<IPost[]>([]);
  const [allPosts, setAllPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [editingPost, setEditingPost] = useState<IPost | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [chatsCount, setChatsCount] = useState(0);

  // Post viewer modal state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const viewerListRef = useRef<FlatList>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      const [postsRes, chatsRes] = await Promise.all([
        apiClient.get('/posts'),
        apiClient.get('/chats').catch(() => ({ data: { data: [] } })),
      ]);

      const posts: IPost[] = postsRes.data.data || [];
      setAllPosts(posts);
      setMyPosts(posts.filter((p) => p.userId === user?.id));

      const chatRooms = chatsRes.data.data || [];
      setChatsCount(chatRooms.length);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);

  const handleDeletePost = (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/posts/${postId}`);
            setMyPosts((prev) => prev.filter((p) => p.id !== postId));
            setViewerVisible(false);
          } catch (err) {
            console.error('Error deleting post:', err);
            Alert.alert('Error', 'Could not delete post.');
          }
        },
      },
    ]);
  };

  const handleEditPost = (post: IPost) => {
    setEditingPost(post);
    setEditCaption(post.caption || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    try {
      const res = await apiClient.put(`/posts/${editingPost.id}`, { caption: editCaption });
      const updated: IPost = res.data.data || { ...editingPost, caption: editCaption };
      setMyPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      setMyPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? { ...p, caption: editCaption } : p))
      );
    }
    setEditingPost(null);
  };

  const handleUpdateProfileImage = async () => {
    try {
      const { pickAvatarImage } = require('../services/mediaPicker');
      const { uploadMediaToS3, getMimeFromUri } = require('../services/s3UploadService');

      const media = await pickAvatarImage();
      if (media?.uri) {
        Alert.alert('Uploading Avatar...', 'Please wait while your profile picture uploads to S3.');
        const mime = media.mime || getMimeFromUri(media.uri);
        const s3Result = await uploadMediaToS3(media.uri, mime);

        console.log('✅ [Profile] Avatar uploaded to S3:', s3Result.publicUrl);

        // Send updated S3 avatar URL to backend API DB
        await apiClient.put('/users/profile', { avatarUrl: s3Result.publicUrl });

        // Update Redux state & AsyncStorage session
        dispatch(updateUserAvatar(s3Result.publicUrl));
        Alert.alert('Profile Picture Updated', 'Your profile picture has been saved to S3 & database!');
      }
    } catch (err: any) {
      console.error('Error updating profile image:', err);
      Alert.alert('Upload Failed', err?.message || 'Failed to update profile picture.');
    }
  };

  const openPostViewer = (index: number) => {
    setViewerInitialIndex(index);
    setViewerVisible(true);
  };

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

  // ── Fullscreen Post Viewer Item ──
  const renderViewerItem = ({ item }: { item: IPost }) => {
    const hasLiked = user ? item.likes?.includes(user.id) : false;

    return (
      <View style={[styles.viewerSlide, { backgroundColor: theme.background }]}>
        {/* Post Header */}
        <View style={styles.viewerPostHeader}>
          <UserAvatar name={user?.username || 'U'} uri={user?.avatarUrl} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.viewerUsername, { color: theme.textPrimary }]}>{item.username || user?.username}</Text>
            <Text style={[styles.viewerDate, { color: theme.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.viewerPostActions}>
            <TouchableOpacity onPress={() => handleEditPost(item)} style={styles.viewerActionIcon}>
              <Edit3 size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePost(item.id)} style={styles.viewerActionIcon}>
              <Trash2 size={18} color="#FA383E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Full-width Media */}
        {item.mediaUrl ? (
          <View style={styles.viewerMediaContainer}>
            {item.type === 'video' ? (
              <VideoPlayer uri={item.mediaUrl} posterUri={item.thumbnailUrl} compact={false} muted={false} autoPlay={false} />
            ) : (
              <Image source={{ uri: item.mediaUrl }} style={styles.viewerMediaImage} resizeMode="contain" />
            )}
          </View>
        ) : null}

        {/* Actions Row */}
        <View style={styles.viewerActionsRow}>
          <TouchableOpacity style={styles.viewerActionBtn}>
            <Heart size={24} color={hasLiked ? '#FA383E' : theme.textPrimary} fill={hasLiked ? '#FA383E' : 'none'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewerActionBtn}>
            <MessageCircle size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Likes */}
        <Text style={[styles.viewerLikes, { color: theme.textPrimary }]}>
          {item.likes?.length || 0} {(item.likes?.length || 0) === 1 ? 'like' : 'likes'}
        </Text>

        {/* Caption */}
        {item.caption ? (
          <Text style={[styles.viewerCaption, { color: theme.textPrimary }]}>
            <Text style={{ fontWeight: '800' }}>{item.username || user?.username} </Text>
            {item.caption}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        numColumns={GRID_COLS}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={() => (
          <View>
            {/* Top Header */}
            <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{user?.username || 'Profile'}</Text>
              <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
                <Settings size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatarRow}>
                <TouchableOpacity onPress={handleUpdateProfileImage}>
                  <View style={styles.avatarContainer}>
                    <UserAvatar name={user?.username || 'U'} uri={user?.avatarUrl} size={84} isOnline={true} />
                    <View style={[styles.cameraBadge, { borderColor: theme.background }]}>
                      <Camera size={14} color="#FFFFFF" />
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{myPosts.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Posts</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{chatsCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Chats</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{totalLikes}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Likes</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.bioName, { color: theme.textPrimary }]}>{user?.username}</Text>
              <Text style={[styles.bioEmail, { color: theme.textMuted }]}>{user?.email}</Text>
              <Text style={[styles.bioText, { color: theme.textSecondary }]}>
                Pulse Chat Member 🚀 • Sharing moments & connecting.
              </Text>
            </View>

            {/* Grid Section Divider */}
            <View style={[styles.gridDivider, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.gridLabel, { color: theme.textPrimary }]}>Posts</Text>
            </View>
          </View>
        )}
        renderItem={renderGridTile}
        ListEmptyComponent={() =>
          loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No posts yet. Share your first moment!
              </Text>
            </View>
          )
        }
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
            data={myPosts}
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

      {/* ── Settings Slide-Up Modal ── */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.settingsSheet, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.settingsSheetHeader, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.settingsTitle, { color: theme.textPrimary }]}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                style={[styles.settingsRow, { borderBottomColor: theme.cardBorder }]}
                onPress={() => dispatch(toggleTheme())}
              >
                {isDark ? <Sun size={20} color="#FBBF24" /> : <Moon size={20} color="#6366F1" />}
                <Text style={[styles.settingsRowText, { color: theme.textPrimary }]}>
                  {isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                </Text>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingsRow, { borderBottomColor: theme.cardBorder }]}
                onPress={() => {
                  setShowSettings(false);
                  handleUpdateProfileImage();
                }}
              >
                <Camera size={20} color={theme.primary} />
                <Text style={[styles.settingsRowText, { color: theme.textPrimary }]}>Change Profile Photo</Text>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingsRow, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setShowSettings(false);
                  dispatch(logout());
                }}
              >
                <LogOut size={20} color="#FA383E" />
                <Text style={[styles.settingsRowText, { color: '#FA383E' }]}>Sign Out</Text>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Edit Post Modal ── */}
      <Modal visible={!!editingPost} animationType="fade" transparent>
        <View style={styles.editModalOverlay}>
          <View style={[styles.editModalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.editModalTitle, { color: theme.textPrimary }]}>Edit Post</Text>
            <TextInput
              style={[
                styles.editInput,
                { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary },
              ]}
              value={editCaption}
              onChangeText={setEditCaption}
              multiline
              placeholder="Update caption..."
              placeholderTextColor={theme.textMuted}
            />
            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editModalBtn, { backgroundColor: theme.cardBorder }]}
                onPress={() => setEditingPost(null)}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveEdit}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  settingsBtn: {
    padding: 6,
  },
  profileSection: {
    padding: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#0084FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
    fontSize: 17,
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
  // Grid
  gridDivider: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Post Viewer Modal
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
  viewerPostActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewerActionIcon: {
    padding: 4,
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
  // Settings Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  settingsSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  settingsSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingsRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  // Edit Post Modal
  editModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 30,
  },
  editModalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  editModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
