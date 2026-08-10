import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Image as ImageIcon, Video, Send, Camera, Check } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import {
  pickImageFromGallery,
  pickVideoFromGallery,
  capturePhoto,
  PickedMedia,
} from '../services/mediaPicker';
import { uploadMediaToS3, getMimeFromUri } from '../services/s3UploadService';
import { VideoPlayer } from '../components/VideoPlayer';

interface CreatePostScreenProps {
  onPostPublished: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onPostPublished }) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'text'>('text');
  const [localMediaUri, setLocalMediaUri] = useState('');  // local picker URI for preview
  const [mediaMime, setMediaMime] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handlePickImage = async () => {
    const result = await pickImageFromGallery();
    if (result) {
      setMediaType('image');
      setLocalMediaUri(result.uri);
      setMediaMime(result.mime || getMimeFromUri(result.uri));
    }
  };

  const handlePickVideo = async () => {
    const result = await pickVideoFromGallery();
    if (result) {
      setMediaType('video');
      setLocalMediaUri(result.uri);
      setMediaMime(result.mime || getMimeFromUri(result.uri));
    }
  };

  const handleCapturePhoto = async () => {
    const result = await capturePhoto();
    if (result) {
      setMediaType('image');
      setLocalMediaUri(result.uri);
      setMediaMime(result.mime || getMimeFromUri(result.uri));
    }
  };

  const handlePublish = async () => {
    if (!caption.trim() && !localMediaUri) {
      Alert.alert('Empty Post', 'Please write a caption or add a media file.');
      return;
    }

    setPublishing(true);
    setUploadProgress(0);
    try {
      let s3PublicUrl = '';

      // Step 1: Upload media to S3 if we have local media
      if (localMediaUri && mediaType !== 'text') {
        setUploadStatus(`Uploading ${mediaType === 'video' ? 'video' : 'photo'} to cloud...`);
        const uploadResult = await uploadMediaToS3(
          localMediaUri,
          mediaMime || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
          (progress) => {
            setUploadProgress(Math.min(99, Math.max(0, progress)));
          }
        );
        s3PublicUrl = uploadResult.publicUrl;
        console.log('✅ [CreatePost] S3 upload complete:', s3PublicUrl);
      }

      // Step 2: Create post with S3 URL (not local URI)
      setUploadStatus('Publishing post...');
      setUploadProgress(95);

      const response = await apiClient.post('/posts', {
        caption,
        type: mediaType,
        mediaUrl: s3PublicUrl,
      });
      console.log('✅ [CreatePost] Post response:', JSON.stringify(response.data, null, 2));

      setUploadProgress(100);
      setUploadStatus('Published!');

      setTimeout(() => {
        setCaption('');
        setLocalMediaUri('');
        setMediaMime('');
        setMediaType('text');
        setUploadProgress(0);
        setUploadStatus('');
        onPostPublished();
      }, 400);
    } catch (err: any) {
      console.error('❌ [CreatePost] Error publishing post:', err);
      Alert.alert('Error', err?.message || 'Failed to publish post.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Create New Post</Text>

      <View style={[styles.postFormCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <TextInput
          style={[styles.captionInput, { color: theme.textPrimary }]}
          placeholder="What's on your mind? Share an update or video..."
          placeholderTextColor={theme.textMuted}
          multiline
          value={caption}
          onChangeText={setCaption}
        />

        {localMediaUri ? (
          <View style={styles.mediaPreviewBox}>
            {mediaType === 'video' ? (
              <VideoPlayer uri={localMediaUri} compact muted autoPlay={false} />
            ) : (
              <Image source={{ uri: localMediaUri }} style={styles.previewImage} />
            )}
            <TouchableOpacity
              style={styles.removeMediaBtn}
              onPress={() => { setLocalMediaUri(''); setMediaMime(''); setMediaType('text'); }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.mediaOptionsRow}>
          <TouchableOpacity
            style={[styles.mediaOptionBtn, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
            onPress={handlePickImage}
          >
            <ImageIcon size={20} color={theme.videoBadge} />
            <Text style={[styles.mediaOptionText, { color: theme.videoBadge }]}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mediaOptionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
            onPress={handlePickVideo}
          >
            <Video size={20} color={theme.recordingBadge} />
            <Text style={[styles.mediaOptionText, { color: theme.recordingBadge }]}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mediaOptionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}
            onPress={handleCapturePhoto}
          >
            <Camera size={20} color="#10B981" />
            <Text style={[styles.mediaOptionText, { color: '#10B981' }]}>Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Upload Progress Bar */}
        {publishing && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, Math.max(0, uploadProgress))}%`,
                  backgroundColor: theme.primary,
                },
              ]}
            />
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
              {uploadStatus || `Uploading... ${Math.min(100, Math.max(0, uploadProgress))}%`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.publishBtn, { backgroundColor: publishing ? theme.textMuted : theme.primary }]}
          onPress={handlePublish}
          disabled={publishing}
        >
          {publishing ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.publishBtnText}>
                {Math.min(100, Math.max(0, uploadProgress))}%
              </Text>
            </>
          ) : (
            <>
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.publishBtnText}>Publish Post</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16
  },
  postFormCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1
  },
  captionInput: {
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top'
  },
  mediaPreviewBox: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 12
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mediaOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16
  },
  mediaOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12
  },
  mediaOptionText: {
    fontSize: 12,
    fontWeight: '700'
  },
  publishBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  progressContainer: {
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 1,
  },
});
