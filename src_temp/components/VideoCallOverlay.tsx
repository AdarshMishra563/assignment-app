import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import { IVideoCallSignal } from '../types';
import { Colors } from '../theme/colors';

interface VideoCallOverlayProps {
  callSignal: IVideoCallSignal;
  onEndCall: () => void;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({ callSignal, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={styles.container}>
        
        {/* Main Video Stream Container */}
        <View style={styles.streamContainer}>
          <View style={styles.remoteVideoPlaceholder}>
            <Text style={styles.callerName}>{callSignal.fromUsername}</Text>
            <Text style={styles.callStatus}>Live Video Stream Active</Text>
          </View>

          {/* Local Camera Picture-in-Picture */}
          <View style={styles.localVideoPip}>
            <Text style={styles.pipText}>You</Text>
          </View>
        </View>

        {/* Video Call Controls Bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff size={22} color="#FFFFFF" /> : <Mic size={22} color="#FFFFFF" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallBtn} onPress={onEndCall}>
            <PhoneOff size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff size={22} color="#FFFFFF" /> : <Video size={22} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 40
  },
  streamContainer: {
    flex: 1,
    position: 'relative',
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  remoteVideoPlaceholder: {
    alignItems: 'center',
    gap: 8
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700'
  },
  callStatus: {
    color: Colors.onlineBadge,
    fontSize: 14,
    fontWeight: '500'
  },
  localVideoPip: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pipText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 20
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  controlBtnActive: {
    backgroundColor: Colors.recordingBadge
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.recordingBadge,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
