import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mic, Square, Send, Trash2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface VoiceNoteRecorderProps {
  onSendVoiceNote: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onSendVoiceNote,
  onCancel
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSend = () => {
    // Demo audio file URL (e.g. S3 audio stream file)
    const dummyAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    onSendVoiceNote(dummyAudioUrl, seconds || 5);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Trash2 size={20} color={Colors.recordingBadge} />
      </TouchableOpacity>

      <View style={styles.timerBadge}>
        <View style={styles.recordingDot} />
        <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
      </View>

      <View style={styles.actionGroup}>
        {isRecording ? (
          <TouchableOpacity style={styles.stopBtn} onPress={handleStopRecording}>
            <Square size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  cancelBtn: {
    padding: 8
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.recordingBadge
  },
  timerText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stopBtn: {
    backgroundColor: Colors.recordingBadge,
    padding: 10,
    borderRadius: 20
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 20
  }
});
