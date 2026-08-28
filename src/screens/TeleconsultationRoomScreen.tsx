import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Sparkles,
  Video,
  Volume2,
} from 'lucide-react-native';
import { useColor } from '../design-system/theme/ThemeProvider';
import { radius, spacing } from '../design-system/theme/spacing';
import { typography } from '../design-system/theme/typography';
import { RadialGlowBackground } from '../design-system/components/RadialGlowBackground';
import { showToast } from '../design-system/components/Toast';

export const TeleconsultationRoomScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { booking } = route.params || {};
  const COLOR = useColor();
  const insets = useSafeAreaInsets();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const handleEndCall = () => {
    showToast.info('Consultation completed. Prescription saved to Health Vault.');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0A0F0D', paddingTop: insets.top, paddingBottom: insets.bottom || spacing.md }]}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.doctorInfo}>
          <Text style={[typography.subtitle, { color: '#FFFFFF' }]}>
            {booking?.doctorName || 'Dr. Anjali Verma, MD'}
          </Text>
          <Text style={[typography.caption, { color: '#A0B4A5' }]}>
            {booking?.doctorSpecialty || 'Panchakarma Specialist'} · 1-on-1 HD Video Room
          </Text>
        </View>

        <View style={[styles.securePill, { backgroundColor: 'rgba(31,110,67,0.3)' }]}>
          <ShieldCheck size={14} color="#3FA968" style={{ marginRight: 4 }} />
          <Text style={[typography.label, { color: '#3FA968' }]}>ENCRYPTED</Text>
        </View>
      </View>

      {/* Main Remote Video Area */}
      <View style={styles.videoStage}>
        <Image
          source={{
            uri:
              booking?.doctorPhoto ||
              'https://images.unsplash.com/photo-1594824813580-ff677464d509?w=800',
          }}
          style={styles.doctorVideoFeed}
          resizeMode="cover"
        />

        <View style={styles.videoOverlayScrim} />

        {/* Pulse / Nadi Diagnostics Floating Tag */}
        <View style={[styles.diagnosticsTag, { backgroundColor: 'rgba(15,19,15,0.85)' }]}>
          <Sparkles size={14} color="#D9AE55" style={{ marginRight: 6 }} />
          <Text style={[typography.caption, { color: '#EDF1EA', fontWeight: '700' }]}>
            Live Ayurvedic Pulse & Visual Assessment in progress
          </Text>
        </View>

        {/* Patient Self Video Feed Picture-in-Picture */}
        <View style={styles.pipContainer}>
          {isVideoOff ? (
            <View style={[styles.pipFallback, { backgroundColor: '#1A1F19' }]}>
              <CameraOff size={22} color="#9AA598" />
            </View>
          ) : (
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }}
              style={styles.pipImage}
            />
          )}
          <View style={styles.pipLabel}>
            <Text style={[typography.label, { color: '#FFFFFF', fontSize: 9 }]}>YOU</Text>
          </View>
        </View>
      </View>

      {/* Video Call Controls Toolbar */}
      <View style={styles.controlsBar}>
        {/* Mute Mic */}
        <Pressable
          onPress={() => {
            setIsMuted(!isMuted);
            showToast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted');
          }}
          style={[styles.controlBtn, { backgroundColor: isMuted ? '#E0655C' : 'rgba(255,255,255,0.15)' }]}
        >
          {isMuted ? <MicOff size={22} color="#FFFFFF" /> : <Mic size={22} color="#FFFFFF" />}
        </Pressable>

        {/* Toggle Camera */}
        <Pressable
          onPress={() => {
            setIsVideoOff(!isVideoOff);
            showToast.info(isVideoOff ? 'Camera turned on' : 'Camera turned off');
          }}
          style={[styles.controlBtn, { backgroundColor: isVideoOff ? '#E0655C' : 'rgba(255,255,255,0.15)' }]}
        >
          {isVideoOff ? <CameraOff size={22} color="#FFFFFF" /> : <Camera size={22} color="#FFFFFF" />}
        </Pressable>

        {/* Toggle Speaker */}
        <Pressable
          onPress={() => {
            setIsSpeakerOn(!isSpeakerOn);
            showToast.info(isSpeakerOn ? 'Speaker disabled' : 'Speaker enabled');
          }}
          style={[styles.controlBtn, { backgroundColor: isSpeakerOn ? 'rgba(63,169,104,0.3)' : 'rgba(255,255,255,0.15)' }]}
        >
          <Volume2 size={22} color={isSpeakerOn ? '#3FA968' : '#FFFFFF'} />
        </Pressable>

        {/* End Call */}
        <Pressable onPress={handleEndCall} style={[styles.controlBtn, styles.endCallBtn]}>
          <PhoneOff size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  videoStage: {
    flex: 1,
    position: 'relative',
    marginHorizontal: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#151B14',
  },
  doctorVideoFeed: {
    width: '100%',
    height: '100%',
  },
  videoOverlayScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  diagnosticsTag: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  pipContainer: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 100,
    height: 140,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3FA968',
  },
  pipImage: {
    width: '100%',
    height: '100%',
  },
  pipFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  controlBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallBtn: {
    backgroundColor: '#B23B33',
  },
});
