import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';
import { ITypingState, IRecordingState, IVideoCallSignal } from '../types';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Map<string, boolean>;
  typingUsers: Map<string, string>; // roomId -> username typing
  recordingUsers: Map<string, string>; // roomId -> username recording
  activeVideoCall: IVideoCallSignal | null;
  setActiveVideoCall: (call: IVideoCallSignal | null) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),
  recordingUsers: new Map(),
  activeVideoCall: null,
  setActiveVideoCall: () => {}
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [recordingUsers, setRecordingUsers] = useState<Map<string, string>>(new Map());
  const [activeVideoCall, setActiveVideoCall] = useState<IVideoCallSignal | null>(null);

  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      setSocket(null);
      return;
    }

    const s = socketService.connect(user.id);
    setSocket(s);

    // Event listeners
    s.on('user_presence_change', (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const updated = new Map(prev);
        updated.set(data.userId, data.isOnline);
        return updated;
      });
    });

    s.on('user_typing', (data: ITypingState) => {
      if (!data.roomId) return;
      const rId = data.roomId;
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        if (data.isTyping) {
          updated.set(rId, data.username);
        } else {
          updated.delete(rId);
        }
        return updated;
      });
    });

    s.on('user_audio_recording', (data: IRecordingState) => {
      if (!data.roomId) return;
      const rId = data.roomId;
      setRecordingUsers((prev) => {
        const updated = new Map(prev);
        if (data.isRecording) {
          updated.set(rId, data.username);
        } else {
          updated.delete(rId);
        }
        return updated;
      });
    });

    s.on('video_call_incoming', (signal: IVideoCallSignal) => {
      setActiveVideoCall(signal);
    });

    s.on('video_call_ended', () => {
      setActiveVideoCall(null);
    });

    return () => {
      s.off('user_presence_change');
      s.off('user_typing');
      s.off('user_audio_recording');
      s.off('video_call_incoming');
      s.off('video_call_ended');
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      typingUsers,
      recordingUsers,
      activeVideoCall,
      setActiveVideoCall
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
