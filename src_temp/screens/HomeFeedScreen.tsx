import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Heart, MessageCircle, Share2, Plus, Bell, Sun, Moon, Trash2 } from 'lucide-react-native';
import { useAppSelector } from '../store/hooks';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentsModal } from '../components/CommentsModal';
import { apiClient } from '../api/client';
import { Colors } from '../theme/colors';
import { IUser, IPost } from '../types';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface HomeFeedScreenProps {
  onOpenProfile?: (userId: string) => void;
  onNavigateToCreatePost?: () => void;
  route?: any;
}

export const HomeFeedScreen: React.FC<HomeFeedScreenProps> = ({ onOpenProfile, onNavigateToCreatePost, route }) => {
  const user = useAppSelector((state) => state.auth.user);
  const { theme, isDark, toggleTheme } = useTheme();
  const isFocused = useIsFocused();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const fetchFeedAndUsers = async (pageNum = 1) => {
    try {
      const [postsRes, usersRes] = await Promise.all([
        apiClient.get(`/posts?page=${pageNum}&limit=10`),
        apiClient.get('/users')
      ]);

      const fetchedPosts: IPost[] = postsRes.data.data || [];
      if (pageNum === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      }

      setHasMore(fetchedPosts.length >= 10);
      const allUsers: IUser[] = usersRes.data.data || [];
      setUsersList(allUsers.filter((u) => u.id !== user?.id));
    } catch (err) {
      console.error('Error fetching feed or users:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeedAndUsers(nextPage);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<any> }) => {
    const videoItem = viewableItems.find((item) => item.item?.type === 'video');
    if (videoItem) {
      setActiveVideoId(videoItem.item.id);
    } else {
      setActiveVideoId(null);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleOpenStory = (userId: string) => {
    if (!viewedStories.includes(userId)) {
      setViewedStories((prev) => [...prev, userId]);
    }
    onOpenProfile?.(userId);
  };

  const usersWithPosts = usersList.filter((u) => posts.some((p) => p.userId === u.id));

  useEffect(() => {
    fetchFeedAndUsers(1);
  }, [user?.id, route?.params?.refresh]);

  const handleToggleLike = async (postId: string) => {
    if (!user) return;

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const currentLikes = targetPost.likes || [];
    const hasLiked = currentLikes.includes(user.id);
    const updatedLikes = hasLiked
      ? currentLikes.filter((id) => id !== user.id)
      : [...currentLikes, user.id];

    // Optimistic UI update (0ms delay)
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p))
    );

    try {
      const res = await apiClient.post(`/posts/${postId}/like`);
      const backendPost: IPost = res.data.data;
      if (backendPost) {
        setPosts((prev) => prev.map((p) => (p.id === backendPost.id ? backendPost : p)));
      }
    } catch (err) {
      console.error('Error liking post, reverting optimistic update:', err);
      // Revert state on network/API failure
      setPosts((prev) => prev.map((p) => (p.id === postId ? targetPost : p)));
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            try {
              await apiClient.delete(`/posts/${postId}`);
            } catch (err: any) {
              console.error('Error deleting post:', err);
              Alert.alert('Error', err?.message || 'Could not delete post.');
              fetchFeedAndUsers(1);
            }
          },
        },
      ]
    );
  };

  const formatPostTime = (dateVal?: string | Date) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderPostItem = ({ item }: { item: IPost }) => {
    const likesList = item.likes || [];
    const hasLiked = user ? likesList.includes(user.id) : false;

    return (
      <View style={styles.instaPostContainer}>
        
        {/* Top Header: Author Avatar + Name + Delete (if owner) */}
        <View style={styles.postHeaderRow}>
          <TouchableOpacity
            style={styles.postHeader}
            onPress={() => onOpenProfile?.(item.userId)}
          >
            <UserAvatar name={item.username} uri={item.userAvatar} size={38} />
            <View style={styles.postHeaderInfo}>
              <Text style={[styles.postUsername, { color: theme.textPrimary }]}>{item.username}</Text>
              <Text style={[styles.postTime, { color: theme.textMuted }]}>
                {formatPostTime(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          {user && item.userId === user.id ? (
            <TouchableOpacity onPress={() => handleDeletePost(item.id)} style={{ padding: 8 }}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Full-width Media View (Open View) */}
        {item.mediaUrl ? (
          <View style={styles.fullWidthMediaContainer}>
            {item.type === 'video' ? (
              <VideoPlayer
                uri={item.mediaUrl}
                posterUri={item.thumbnailUrl}
                compact
                muted={!(isFocused && activeVideoId === item.id)}
                isFocused={isFocused}
                autoPlay={isFocused && activeVideoId === item.id}
              />
            ) : (
              <Image source={{ uri: item.mediaUrl }} style={styles.fullWidthImage} resizeMode="cover" />
            )}
          </View>
        ) : null}

        {/* Action Buttons: Like, Comment */}
        <View style={styles.instaActionsRow}>
          <TouchableOpacity onPress={() => handleToggleLike(item.id)} style={styles.actionIconButton}>
            <Heart
              size={24}
              color={hasLiked ? '#FA383E' : theme.textPrimary}
              fill={hasLiked ? '#FA383E' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => setActiveCommentPostId(item.id)}
          >
            <MessageCircle size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Likes & Comments Count */}
        <Text style={[styles.likesCountText, { color: theme.textPrimary }]}>
          {likesList.length} {likesList.length === 1 ? 'like' : 'likes'}
        </Text>

        {/* Caption: Bold Author Name + Description */}
        {item.caption ? (
          <Text style={[styles.instaCaptionText, { color: theme.textPrimary }]}>
            <Text style={[styles.boldAuthorName, { color: theme.textPrimary }]}>{item.username} </Text>
            {item.caption}
          </Text>
        ) : null}

        {item.commentsCount ? (
          <TouchableOpacity onPress={() => setActiveCommentPostId(item.id)} style={{ paddingHorizontal: 14, marginTop: 4 }}>
            <Text style={{ color: theme.textMuted, fontSize: 13 }}>
              View all {item.commentsCount} comments
            </Text>
          </TouchableOpacity>
        ) : null}

      </View>
    );
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchFeedAndUsers(1);
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Feed Top Header */}
      <View style={[styles.appHeader, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.headerUserGroup} onPress={() => user && onOpenProfile?.(user.id)}>
          <UserAvatar name={user?.username || 'U'} uri={user?.avatarUrl} size={36} isOnline={true} />
          <View>
            <Text style={[styles.headerGreeting, { color: theme.textMuted }]}>Logged in as</Text>
            <Text style={[styles.headerUserName, { color: theme.textPrimary }]}>{user?.username || 'Pulse Member'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={22} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.themeToggleBtn} onPress={toggleTheme}>
            {isDark ? <Sun size={20} color="#FBBF24" /> : <Moon size={20} color="#6366F1" />}
          </TouchableOpacity>
        </View>
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator color={theme.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color={theme.primary} />
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 6 }}>Loading more posts...</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={() => (
            <View style={[styles.storiesBar, { borderBottomColor: theme.cardBorder }]}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ id: 'add_story', isAdd: true }, ...usersWithPosts]}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 14 }}
                renderItem={({ item }: { item: any }) => {
                  if ('isAdd' in item) {
                    return (
                      <TouchableOpacity style={styles.storyItem} onPress={onNavigateToCreatePost}>
                        <View style={styles.addStoryWrapper}>
                          <UserAvatar name={user?.username || 'You'} uri={user?.avatarUrl} size={54} />
                          <View style={styles.addPlusBadge}>
                            <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        </View>
                        <Text style={[styles.storyName, { color: theme.textPrimary }]} numberOfLines={1}>Your Story</Text>
                      </TouchableOpacity>
                    );
                  }

                  const isViewed = viewedStories.includes(item.id);

                  return (
                    <TouchableOpacity style={styles.storyItem} onPress={() => handleOpenStory(item.id)}>
                      <View style={[styles.storyRing, { borderColor: isViewed ? '#64748B' : '#E1306C' }]}>
                        <UserAvatar name={item.username} uri={item.avatarUrl} size={52} />
                      </View>
                      <Text style={[styles.storyName, { color: isViewed ? theme.textMuted : theme.textPrimary }]} numberOfLines={1}>
                        {item.username}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        />
      )}

      {/* Real-time Comments Sheet Modal */}
      <CommentsModal
        visible={!!activeCommentPostId}
        postId={activeCommentPostId}
        onClose={() => setActiveCommentPostId(null)}
        onOpenProfile={(authorId) => {
          setActiveCommentPostId(null);
          onOpenProfile?.(authorId);
        }}
        onCommentAdded={(postId, newCount) => {
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, commentsCount: newCount } : p))
          );
        }}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  appHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1
  },
  headerUserGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerGreeting: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  headerUserName: {
    fontSize: 15,
    fontWeight: '800'
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  notificationBtn: {
    padding: 6,
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FA383E',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  themeToggleBtn: {
    padding: 6
  },
  storiesBar: {
    borderBottomWidth: 1,
    paddingBottom: 4
  },
  storyItem: {
    alignItems: 'center',
    width: 68
  },
  addStoryWrapper: {
    position: 'relative',
    marginBottom: 4
  },
  addPlusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0084FF',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  storyRing: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E1306C',
    marginBottom: 4
  },
  storyName: {
    fontSize: 11,
    textAlign: 'center'
  },
  instaPostContainer: {
    marginBottom: 24
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  postHeaderInfo: {
    flex: 1
  },
  postUsername: {
    fontSize: 14,
    fontWeight: '700'
  },
  postTime: {
    fontSize: 11
  },
  fullWidthMediaContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    maxHeight: SCREEN_HEIGHT * 0.55,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  fullWidthImage: {
    width: '100%',
    height: '100%'
  },
  instaActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6
  },
  actionIconButton: {
    padding: 2
  },
  likesCountText: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6
  },
  instaCaptionText: {
    paddingHorizontal: 14,
    fontSize: 14,
    lineHeight: 20
  },
  boldAuthorName: {
    fontWeight: '800'
  }
});
