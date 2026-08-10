import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from './UserAvatar';
import { apiClient } from '../api/client';

export interface IComment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

interface CommentsModalProps {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
  onCommentAdded?: (postId: string, newCount: number) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  postId,
  onClose,
  onCommentAdded,
}) => {
  const { theme } = useTheme();
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchComments = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/posts/${postId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    }
  }, [visible, postId]);

  const handleSendComment = async () => {
    if (!postId || !inputText.trim()) return;
    setSending(true);
    try {
      const res = await apiClient.post(`/posts/${postId}/comments`, { text: inputText.trim() });
      const newComment = res.data.data?.comment;
      const updatedPost = res.data.data?.post;

      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      }
      if (updatedPost && onCommentAdded) {
        onCommentAdded(postId, updatedPost.commentsCount);
      }
      setInputText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={[styles.sheetContainer, { backgroundColor: theme.cardBackground }]}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Comments ({comments.length})
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ flex: 1, marginVertical: 40 }} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item, idx) => item.id || String(idx)}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <UserAvatar name={item.username} uri={item.userAvatar} size={36} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentMeta}>
                      <Text style={[styles.usernameText, { color: theme.textPrimary }]}>
                        {item.username}
                      </Text>
                      <Text style={[styles.timeText, { color: theme.textMuted }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={[styles.commentText, { color: theme.textPrimary }]}>
                      {item.text}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    No comments yet. Be the first to comment!
                  </Text>
                </View>
              )}
            />
          )}

          {/* Input Toolbar */}
          <View style={[styles.inputToolbar, { borderTopColor: theme.cardBorder, backgroundColor: theme.background }]}>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary },
              ]}
              placeholder="Write a comment..."
              placeholderTextColor={theme.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: theme.primary }]}
              onPress={handleSendComment}
              disabled={sending || !inputText.trim()}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '65%',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 10,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
