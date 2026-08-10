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
import { Send, Mic, Video, Image as ImageIcon, Camera, X } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRoomMessages } from '../store/slices/chatSlice';
import { setActiveVideoCall } from '../store/slices/presenceSlice';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { VoiceNoteRecorder } from '../components/VoiceNoteRecorder';
import { VideoCallOverlay } from '../components/VideoCallOverlay';
import { VideoPlayer } from '../components/VideoPlayer';
import { IChatRoom } from '../types';
import { socketService } from '../services/socketService';
import { DarkTheme, LightTheme } from '../theme/colors';
import {
  pickImageFromGallery,
  pickVideoFromGallery,
  capturePhoto,
} from '../services/mediaPicker';
import { uploadMediaToS3, getMimeFromUri } from '../services/s3UploadService';

interface ChatRoomScreenProps {
  room: IChatRoom;
  onBack: () => void;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ room, onBack }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const theme = isDark ? DarkTheme : LightTheme;

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
  const otherParticipant = room.participants.find((p) => p.id !== user?.id);
  const roomTitle = room.isGroup ? room.name : (otherParticipant?.username || 'Chat');
  const isOnline = otherParticipant ? !!onlineUsers[otherParticipant.id] : false;
  const isOtherUserTyping = typingUsers[room.id];
  const isOtherUserRecording = recordingUsers[room.id];

  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  useEffect(() => {
    dispatch(fetchRoomMessages(room.id));
    socketService.joinRoom(room.id);

    // Emit read receipt event when entering room
    if (user?.id) {
      socketService.getSocket()?.emit('mark_messages_read', { roomId: room.id, userId: user.id });
    }

    return () => {
      socketService.leaveRoom(room.id);
    };
  }, [room.id, user?.id, dispatch]);

  const handleSendText = () => {
    if (!inputText.trim() || !user) return;

    socketService.sendMessage({
      roomId: room.id,
      senderId: user.id,
      type: 'text',
      content: inputText.trim()
    });

    socketService.emitTypingStop(room.id, user.id, user.username);
    setInputText('');
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ChatHeader
        title={roomTitle || 'Chat'}
        avatarUrl={otherParticipant?.avatarUrl}
        isOnline={isOnline}
        onBack={onBack}
        onStartVideoCall={handleStartVideoCall}
      />

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessageBubble
              message={item}
              isSender={item.senderId === user?.id}
              onPressMedia={(url, type) => setFullscreenMedia({ url, type })}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

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
            <VideoPlayer uri={fullscreenMedia.url} compact={false} muted={false} autoPlay={true} />
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

      <View style={[styles.inputToolbar, { backgroundColor: theme.cardBackground, borderTopColor: theme.cardBorder }]}>
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
