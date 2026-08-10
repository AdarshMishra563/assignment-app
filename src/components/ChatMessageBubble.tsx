import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Play, Pause, Check, CheckCheck, Film, Mic, UploadCloud } from 'lucide-react-native';
import { IMessage } from '../types';
import { Colors } from '../theme/colors';
import { UserAvatar } from './UserAvatar';
import { VideoPlayer } from './VideoPlayer';

interface ChatMessageBubbleProps {
  message: IMessage;
  isSender: boolean;
  onPressMedia?: (url: string, type: 'image' | 'video') => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isSender, onPressMedia }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const formatTime = (dateStr: string | Date) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderStatus = () => {
    if (!isSender) return null;
    if (message.isUploading) {
      return <ActivityIndicator size={12} color="rgba(255, 255, 255, 0.8)" />;
    }
    if (message.status === 'read') {
      return <CheckCheck size={14} color="#38BDF8" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck size={14} color={Colors.textSecondary} />;
    }
    return <Check size={14} color={Colors.textSecondary} />;
  };

  return (
    <View style={[styles.wrapper, isSender ? styles.wrapperSender : styles.wrapperReceiver]}>
      {/* Sender Profile Avatar for Incoming Messages */}
      {!isSender && (
        <View style={styles.incomingAvatarWrapper}>
          <UserAvatar name={message.senderName || 'U'} uri={message.senderAvatar} size={30} />
        </View>
      )}

      <View style={[styles.bubble, isSender ? styles.bubbleSender : styles.bubbleReceiver]}>
        
        {/* Sender Name if Group Chat or Receiver */}
        {!isSender && message.senderName && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {/* Message Content according to type */}
        {message.type === 'text' && (
          <Text style={[styles.text, isSender ? styles.textSender : styles.textReceiver]}>
            {message.content}
          </Text>
        )}

        {/* Mic Voice Audio Note */}
        {message.type === 'audio' && (
          <View style={styles.mediaContainer}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => setIsPlayingAudio(!isPlayingAudio)}
            >
              {isPlayingAudio ? (
                <Pause size={18} color="#FFFFFF" />
              ) : (
                <Play size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            <View style={styles.audioWaveform}>
              <View style={styles.waveBar} />
              <View style={[styles.waveBar, { height: 18 }]} />
              <View style={[styles.waveBar, { height: 12 }]} />
              <View style={[styles.waveBar, { height: 22 }]} />
              <View style={[styles.waveBar, { height: 10 }]} />
              <View style={[styles.waveBar, { height: 16 }]} />
            </View>

            <Text style={styles.durationText}>
              {message.duration ? `${message.duration}s` : '0:05'}
            </Text>
          </View>
        )}

        {/* Image Attachment */}
        {message.type === 'image' && message.mediaUrl ? (
          <TouchableOpacity
            style={styles.videoContainer}
            activeOpacity={0.9}
            onPress={() => message.mediaUrl && onPressMedia?.(message.mediaUrl, 'image')}
          >
            <Image source={{ uri: message.mediaUrl }} style={styles.videoPreview} resizeMode="cover" />
            
            {/* Uploading Progress Overlay */}
            {message.isUploading && (
              <View style={styles.uploadProgressOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.progressText}>
                  {message.uploadProgress ? `Sending ${message.uploadProgress}%` : 'Sending image...'}
                </Text>
              </View>
            )}

            {/* File Size Badge */}
            {message.fileSize ? (
              <View style={styles.fileSizeBadge}>
                <Text style={styles.fileSizeText}>{message.fileSize}</Text>
              </View>
            ) : null}

            {message.content && message.content !== 'Shared Photo Attachment' && message.content !== 'Camera Photo Attachment' ? (
              <Text style={styles.mediaCaption}>{message.content}</Text>
            ) : null}
          </TouchableOpacity>
        ) : null}

        {/* Video Attachment */}
        {message.type === 'video' && (
          <TouchableOpacity
            style={styles.videoContainer}
            activeOpacity={0.9}
            onPress={() => message.mediaUrl && onPressMedia?.(message.mediaUrl, 'video')}
          >
            {message.mediaUrl ? (
              <VideoPlayer uri={message.mediaUrl} compact muted autoPlay={false} />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Film size={32} color={Colors.primary} />
              </View>
            )}

            {/* Uploading Progress Overlay */}
            {message.isUploading ? (
              <View style={styles.uploadProgressOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.progressText}>
                  {message.uploadProgress ? `Uploading Video ${message.uploadProgress}%` : 'Uploading video...'}
                </Text>
              </View>
            ) : (
              <View style={styles.videoPlayOverlay}>
                <Play size={24} color="#FFFFFF" />
              </View>
            )}

            {/* File Size Badge */}
            {message.fileSize ? (
              <View style={styles.fileSizeBadge}>
                <Text style={styles.fileSizeText}>{message.fileSize}</Text>
              </View>
            ) : null}

            {message.content ? <Text style={styles.mediaCaption}>{message.content}</Text> : null}
          </TouchableOpacity>
        )}

        {/* Timestamp & Read Receipts */}
        <View style={styles.metaContainer}>
          <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
          {renderStatus()}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    flexDirection: 'row',
    paddingHorizontal: 16
  },
  wrapperSender: {
    justifyContent: 'flex-end'
  },
  wrapperReceiver: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  bubbleSender: {
    backgroundColor: Colors.chatBubbleSender,
    borderBottomRightRadius: 4
  },
  bubbleReceiver: {
    backgroundColor: Colors.chatBubbleReceiver,
    borderBottomLeftRadius: 4
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4
  },
  text: {
    fontSize: 14,
    lineHeight: 20
  },
  textSender: {
    color: '#FFFFFF'
  },
  textReceiver: {
    color: Colors.textPrimary
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 160
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1
  },
  waveBar: {
    width: 3,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2
  },
  durationText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 4,
    minWidth: 200,
    height: 140,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoPreview: {
    width: '100%',
    height: '100%'
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoPlayOverlay: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mediaCaption: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    color: '#FFFFFF',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)'
  },
  incomingAvatarWrapper: {
    marginRight: 6,
    alignSelf: 'flex-end',
    marginBottom: 4
  },
  uploadProgressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600'
  },
  fileSizeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  fileSizeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600'
  }
});
