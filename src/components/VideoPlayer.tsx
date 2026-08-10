import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';

interface VideoPlayerProps {
  uri: string;
  posterUri?: string;
  style?: any;
  autoPlay?: boolean;
  muted?: boolean;
  compact?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  posterUri,
  style,
  autoPlay = true,
  muted: initialMuted = true,
  compact = false,
}) => {
  const videoRef = useRef<VideoRef>(null);
  const hideTimerRef = useRef<any>(null);

  const [paused, setPaused] = useState(!autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showIconOverlay, setShowIconOverlay] = useState(false);

  // Sync paused state when autoPlay prop changes (ensures only 1 video plays at a time in feed)
  useEffect(() => {
    setPaused(!autoPlay);
  }, [autoPlay]);

  const getFormattedUri = (rawUri: string) => {
    if (!rawUri) return '';
    if (
      rawUri.startsWith('http://') ||
      rawUri.startsWith('https://') ||
      rawUri.startsWith('file://') ||
      rawUri.startsWith('content://')
    ) {
      return rawUri;
    }
    return `http://10.47.248.118:5000${rawUri.startsWith('/') ? '' : '/'}${rawUri}`;
  };

  const formattedUri = getFormattedUri(uri);

  const triggerIconOverlay = () => {
    setShowIconOverlay(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setShowIconOverlay(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const handlePlayPauseToggle = () => {
    setPaused((prev) => !prev);
    triggerIconOverlay();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  if (hasError || !formattedUri) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        {posterUri ? (
          <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.videoPlaceholderBackground} />
        )}
        <TouchableOpacity style={styles.errorOverlay} onPress={() => setHasError(false)}>
          <Play size={36} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.errorText}>Tap to Retry Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={{ uri: formattedUri }}
        style={styles.video}
        paused={paused}
        muted={isMuted}
        resizeMode="cover"
        repeat={true}
        poster={posterUri}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={(err) => {
          console.warn('[VideoPlayer] Video load warning/error:', err, formattedUri);
          setHasError(true);
          setIsLoading(false);
        }}
        onBuffer={({ isBuffering }) => setIsLoading(isBuffering)}
      />

      {/* Tap area to toggle play/pause */}
      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={1}
        onPress={handlePlayPauseToggle}
      >
        {/* Loading spinner */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {/* Play/Pause icon overlay (fades/hides after 2 seconds) */}
        {!isLoading && showIconOverlay && (
          <View style={styles.playOverlay}>
            <View style={styles.playBtn}>
              {paused ? (
                <Play size={compact ? 28 : 36} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Pause size={compact ? 28 : 36} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Mute toggle button on bottom-right */}
      {!isLoading && (
        <TouchableOpacity style={styles.muteBtn} onPress={toggleMute} activeOpacity={0.8}>
          {isMuted ? (
            <VolumeX size={16} color="#FFFFFF" />
          ) : (
            <Volume2 size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  touchArea: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  videoPlaceholderBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
  },
  poster: {
    ...StyleSheet.absoluteFill,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
});
