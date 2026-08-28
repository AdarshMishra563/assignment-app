import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { Send, Mic, Video, Image as ImageIcon, Camera, X, Users, Edit2, Check } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchRoomMessages,
  appendMessage,
  applyRoomStatus,
  setViewingRoom,
} from '../store/slices/chatSlice';
import { setActiveVideoCall } from '../store/slices/presenceSlice';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { VoiceNoteRecorder } from '../components/VoiceNoteRecorder';
import { VideoCallOverlay } from '../components/VideoCallOverlay';
import { VideoPlayer } from '../components/VideoPlayer';
import { UserAvatar } from '../components/UserAvatar';
import { IChatRoom, IMessage } from '../types';
import { socketService } from '../services/socketService';
import { apiClient } from '../api/client';
import { DarkTheme, LightTheme } from '../theme/colors';
import {
  pickImageFromGallery,
  pickVideoFromGallery,
  capturePhoto,
} from '../services/mediaPicker';
import { uploadMediaToS3, getMimeFromUri } from '../services/s3UploadService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatRoomScreenProps {
  room: IChatRoom;
  onBack: () => void;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ room, onBack }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const theme = isDark ? DarkTheme : LightTheme;
  const insets = useSafeAreaInsets();

  const [currentRoom, setCurrentRoom] = useState<IChatRoom>(room);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState<boolean>(false);
  const [editingGroupName, setEditingGroupName] = useState<string>(room.name || '');
  const [isSavingGroup, setIsSavingGroup] = useState<boolean>(false);

  const messages = useAppSelector((state) => state.chat.messages);
  const loading = useAppSelector((state) => state.chat.loadingMessages);

  const onlineUsers = useAppSelector((state) => state.presence.onlineUsers);
  const typingUsers = useAppSelector((state) => state.presence.typingUsers);
  const recordingUsers = useAppSelector((state) => state.presence.recordingUsers);
  const activeVideoCall = useAppSelector((state) => state.presence.activeVideoCall);

  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Media upload state
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [mediaUploadType, setMediaUploadType] = useState<'image' | 'video'>('image');

  const flatListRef = useRef<FlatList>(null);
  const otherParticipant = (currentRoom.participants || []).find((p) => p.id !== user?.id);
  const roomTitle = currentRoom.isGroup ? currentRoom.name : (otherParticipant?.username || 'Chat');
  const isOnline = otherParticipant ? !!onlineUsers[otherParticipant.id] : false;
  const isOtherUserTyping = typingUsers[currentRoom.id];
  const isOtherUserRecording = recordingUsers[currentRoom.id];

  const handleUpdateGroupName = async () => {
    if (!editingGroupName.trim() || editingGroupName.trim() === currentRoom.name) return;
    setIsSavingGroup(true);
    try {
      const res = await apiClient.put(`/chats/${currentRoom.id}`, { name: editingGroupName.trim() });
      const updatedRoom: IChatRoom = res.data.data;
      if (updatedRoom) {
        setCurrentRoom(updatedRoom);
      }
    } catch (err: any) {
      console.error('Failed to update group name:', err);
    } finally {
      setIsSavingGroup(false);
    }
  };

  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  useEffect(() => {
    dispatch(setViewingRoom(room.id));
    dispatch(fetchRoomMessages(room.id));
    socketService.joinRoom(room.id);

    const socket = socketService.getSocket();

    // Mark messages as read when entering room
    if (user?.id && socket) {
      socket.emit('mark_messages_read', { roomId: room.id, userId: user.id });
    }

    if (socket) {
      // Receipts used to trigger a full re-fetch of every message in the room.
      // That rebuilt the entire array on each event, so the list flashed and
      // scrolled on every tick change. Apply the status in place instead.
      const handleStatusUpdate = (data: {
        messageId?: string;
        roomId: string;
        status?: string;
      }) => {
        if (data.roomId !== room.id) return;
        const status = data.status === 'read' ? 'read' : 'delivered';
        dispatch(applyRoomStatus({ roomId: room.id, status, messageId: data.messageId }));
      };

      socket.on('message_status_update', handleStatusUpdate);
      socket.on('messages_read_update', handleStatusUpdate);
      socket.on('messages_delivered_update', handleStatusUpdate);

      return () => {
        socket.off('message_status_update', handleStatusUpdate);
        socket.off('messages_read_update', handleStatusUpdate);
        socket.off('messages_delivered_update', handleStatusUpdate);
        dispatch(setViewingRoom(null));
        // NOTE: deliberately NOT calling socketService.leaveRoom() here.
        // The server only auto-joins rooms once, at register_user. Leaving on
        // unmount permanently unsubscribed this socket from the room, so after
        // opening a chat once the user stopped receiving `receive_message` for
        // it — which silently broke the chat-list preview and the tab badge.
      };
    }

    return () => {
      dispatch(setViewingRoom(null));
    };
  }, [room.id, user?.id, dispatch]);

  const handleSendText = () => {
    if (!inputText.trim() || !user) return;

    const textContent = inputText.trim();
    setInputText('');
    socketService.emitTypingStop(room.id, user.id, user.username);

    // Optimistic local dispatch (0ms rendering latency)
    const tempMsg: IMessage = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomId: room.id,
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatarUrl,
      type: 'text',
      content: textContent,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    dispatch(appendMessage(tempMsg));

    socketService.sendMessage({
      roomId: room.id,
      senderId: user.id,
      type: 'text',
      content: textContent
    });
  };

  const handleSendVoiceNote = (audioUrl: string, duration: number) => {
    if (!user) return;
    socketService.sendMessage({
      roomId: room.id,
      senderId: user.id,
      type: 'audio',
      content: 'Voice Note',
      mediaUrl: audioUrl,
      duration
    });
    setIsRecordingVoice(false);
  };

  const [showMediaOptions, setShowMediaOptions] = useState(false);

  const handlePickPhoto = async () => {
    if (!user) return;
    setShowMediaOptions(false);
    const media = await pickImageFromGallery();
    if (media) {
      setMediaUploading(true);
      setMediaUploadProgress(0);
      setMediaUploadType('image');
      try {
        const mime = media.mime || getMimeFromUri(media.uri);
        const result = await uploadMediaToS3(media.uri, mime, (progress) => {
          setMediaUploadProgress(progress);
        });
        console.log('✅ [Chat] Image uploaded to S3:', result.publicUrl);
        socketService.sendMessage({
          roomId: room.id,
          senderId: user.id,
          type: 'image',
          content: 'Shared Photo Attachment',
          mediaUrl: result.publicUrl,
        });
      } catch (err: any) {
        console.error('❌ [Chat] Image upload failed:', err);
      } finally {
        setMediaUploading(false);
        setMediaUploadProgress(0);
      }
    }
  };

  const handlePickVideo = async () => {
    if (!user) return;
    setShowMediaOptions(false);
    const media = await pickVideoFromGallery();
    if (media) {
      setMediaUploading(true);
      setMediaUploadProgress(0);
      setMediaUploadType('video');
      try {
        const mime = media.mime || getMimeFromUri(media.uri);
        const result = await uploadMediaToS3(media.uri, mime, (progress) => {
          setMediaUploadProgress(progress);
        });
        console.log('✅ [Chat] Video uploaded to S3:', result.publicUrl);
        socketService.sendMessage({
          roomId: room.id,
          senderId: user.id,
          type: 'video',
          content: 'Shared Video Attachment',
          mediaUrl: result.publicUrl,
          duration: media.duration ? Math.round(media.duration / 1000) : undefined,
        });
      } catch (err: any) {
        console.error('❌ [Chat] Video upload failed:', err);
      } finally {
        setMediaUploading(false);
        setMediaUploadProgress(0);
      }
    }
  };

  const handleCapturePhoto = async () => {
    if (!user) return;
    setShowMediaOptions(false);
    const media = await capturePhoto();
    if (media) {
      setMediaUploading(true);
      setMediaUploadProgress(0);
      setMediaUploadType('image');
      try {
        const mime = media.mime || getMimeFromUri(media.uri);
        const result = await uploadMediaToS3(media.uri, mime, (progress) => {
          setMediaUploadProgress(progress);
        });
        console.log('✅ [Chat] Camera photo uploaded to S3:', result.publicUrl);
        socketService.sendMessage({
          roomId: room.id,
          senderId: user.id,
          type: 'image',
          content: 'Camera Photo Attachment',
          mediaUrl: result.publicUrl,
        });
      } catch (err: any) {
        console.error('❌ [Chat] Camera photo upload failed:', err);
      } finally {
        setMediaUploading(false);
        setMediaUploadProgress(0);
      }
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (!user) return;
    if (text.length > 0) {
      socketService.emitTypingStart(room.id, user.id, user.username);
    } else {
      socketService.emitTypingStop(room.id, user.id, user.username);
    }
  };

  // Stable identity so FlatList rows are not re-created on every parent render.
  const renderMessage = React.useCallback(
    ({ item }: { item: IMessage }) => (
      <ChatMessageBubble
        message={item}
        isSender={item.senderId === user?.id}
        isGroup={currentRoom.isGroup}
        onPressMedia={(url, type) => setFullscreenMedia({ url, type })}
      />
    ),
    [user?.id, currentRoom.isGroup]
  );

  const handleStartVideoCall = () => {
    if (!user) return;
    const signalPayload = {
      roomId: room.id,
      fromUserId: user.id,
      fromUsername: user.username,
      type: 'offer' as const
    };
    socketService.getSocket()?.emit('video_call_offer', signalPayload);
    dispatch(setActiveVideoCall(signalPayload));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      // `undefined` on Android made this component a no-op, so the input and
      // send button stayed under the keyboard. 'height' works with the
      // adjustResize soft-input mode declared in AndroidManifest.xml.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ChatHeader
        title={roomTitle || 'Chat'}
        avatarUrl={currentRoom.isGroup ? `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(currentRoom.name || 'Group')}` : otherParticipant?.avatarUrl}
        isOnline={isOnline}
        isGroup={currentRoom.isGroup}
        onBack={onBack}
        onStartVideoCall={handleStartVideoCall}
        onHeaderPress={() => currentRoom.isGroup && setShowGroupInfoModal(true)}
        onMorePress={() => currentRoom.isGroup && setShowGroupInfoModal(true)}
      />

      {/* `loading` is now only true for a room's FIRST fetch, so socket-driven
          refreshes never replace the conversation with a spinner. */}
      {loading && messages.length === 0 ? (
        <ActivityIndicator color={theme.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          // Without flex:1 the list sizes to its content and pushes the input
          // toolbar off the bottom of the screen once the thread gets long.
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
      )}

      {/* Group Info & Members Sheet Modal */}
      <Modal
        visible={showGroupInfoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGroupInfoModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: '82%',
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 30,
              borderWidth: 1,
              borderColor: theme.cardBorder,
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800' }}>Group Info</Text>
              <TouchableOpacity onPress={() => setShowGroupInfoModal(false)} style={{ padding: 4 }}>
                <X size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Group Details Header */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <UserAvatar
                name={currentRoom.name || 'Group'}
                uri={`https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(currentRoom.name || 'Group')}`}
                size={72}
              />
              
              {/* Editable Group Name */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <TextInput
                  style={{
                    color: theme.textPrimary,
                    fontSize: 18,
                    fontWeight: '700',
                    borderBottomWidth: 1,
                    borderBottomColor: theme.cardBorder,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    minWidth: 160,
                    textAlign: 'center',
                  }}
                  value={editingGroupName}
                  onChangeText={setEditingGroupName}
                  placeholder="Group Name"
                  placeholderTextColor={theme.textMuted}
                />
                <TouchableOpacity
                  onPress={handleUpdateGroupName}
                  disabled={isSavingGroup}
                  style={{
                    backgroundColor: theme.primary,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {isSavingGroup ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Group Members List */}
            <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Group Members ({(currentRoom.participants || []).length})
            </Text>

            <FlatList
              data={currentRoom.participants || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.cardBorder,
                  }}
                >
                  <UserAvatar name={item.username} uri={item.avatarUrl} size={42} isOnline={item.isOnline} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }}>
                      {item.username} {item.id === user?.id ? '(You)' : ''}
                    </Text>
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                      {item.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Fullscreen Media Modal */}
      <Modal
        visible={!!fullscreenMedia}
        animationType="fade"
        transparent
        onRequestClose={() => setFullscreenMedia(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20 }}
            onPress={() => setFullscreenMedia(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {fullscreenMedia?.type === 'video' ? (
            <VideoPlayer uri={fullscreenMedia.url} compact={false} muted={false} autoPlay={true} isFocused={!!fullscreenMedia} />
          ) : fullscreenMedia?.url ? (
            <Image source={{ uri: fullscreenMedia.url }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>

      {isOtherUserTyping ? <TypingIndicator username={isOtherUserTyping} /> : null}
      {isOtherUserRecording ? <TypingIndicator username={`${isOtherUserRecording} is recording audio`} /> : null}

      {showMediaOptions && (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginHorizontal: 16,
            marginBottom: 8,
            padding: 10,
            backgroundColor: theme.cardBackground,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
            }}
            onPress={handlePickPhoto}
          >
            <ImageIcon size={18} color={theme.videoBadge} />
            <Text style={{ color: theme.videoBadge, fontSize: 12, fontWeight: '700' }}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
            }}
            onPress={handlePickVideo}
          >
            <Video size={18} color={theme.recordingBadge} />
            <Text style={{ color: theme.recordingBadge, fontSize: 12, fontWeight: '700' }}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
            }}
            onPress={handleCapturePhoto}
          >
            <Camera size={18} color="#10B981" />
            <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {mediaUploading && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
            Uploading {mediaUploadType === 'video' ? 'video' : 'photo'}... {mediaUploadProgress}%
          </Text>
          <View style={{ height: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${mediaUploadProgress}%`, backgroundColor: theme.primary }} />
          </View>
        </View>
      )}

      {/* App.tsx's SafeAreaView only claims top/left/right, so the bottom inset
          is unclaimed and the toolbar sat under the gesture nav bar. Pad it
          here instead of via keyboardVerticalOffset, which would fight the
          adjustResize behaviour while the keyboard is open. */}
      <View
        style={[
          styles.inputToolbar,
          {
            backgroundColor: theme.cardBackground,
            borderTopColor: theme.cardBorder,
            paddingBottom: 12 + insets.bottom,
          },
        ]}
      >
        {isRecordingVoice ? (
          <VoiceNoteRecorder
            onSendVoiceNote={handleSendVoiceNote}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.mediaBtn} onPress={() => setShowMediaOptions(!showMediaOptions)}>
              <ImageIcon size={22} color={theme.videoBadge} />
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Write a message..."
              placeholderTextColor={theme.textMuted}
              value={inputText}
              onChangeText={handleTextChange}
              multiline
            />

            {inputText.trim().length > 0 ? (
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleSendText}>
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.micBtn}
                onPress={() => setIsRecordingVoice(true)}
              >
                <Mic size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {activeVideoCall ? (
        <VideoCallOverlay
          callSignal={activeVideoCall}
          onEndCall={() => {
            socketService.getSocket()?.emit('end_video_call', activeVideoCall);
            dispatch(setActiveVideoCall(null));
          }}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  messagesList: {
    paddingVertical: 12
  },
  inputToolbar: {
    padding: 12,
    borderTopWidth: 1
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  mediaBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)'
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center'
  },
  micBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  }
});
