import { io, Socket } from 'socket.io-client';
import { BACKEND_BASE_URL } from '../config/env';

const SOCKET_SERVER_URL = BACKEND_BASE_URL;

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to Socket.io server with ID:', this.socket?.id);
        this.socket?.emit('register_user', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from Socket.io server');
      });
    } else if (!this.socket.connected) {
      this.socket.connect();
      this.socket.emit('register_user', userId);
    }

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinRoom(roomId: string) {
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave_room', roomId);
  }

  sendMessage(data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: 'text' | 'audio' | 'video' | 'image' | 'file';
    mediaUrl?: string;
    duration?: number;
  }) {
    this.socket?.emit('send_message', data);
  }

  emitTypingStart(roomId: string, userId: string, username: string) {
    this.socket?.emit('typing_start', { roomId, userId, username });
  }

  emitTypingStop(roomId: string, userId: string, username: string) {
    this.socket?.emit('typing_stop', { roomId, userId, username });
  }

  emitAudioRecordingStart(roomId: string, userId: string, username: string) {
    this.socket?.emit('audio_recording_start', { roomId, userId, username });
  }

  emitAudioRecordingStop(roomId: string, userId: string, username: string) {
    this.socket?.emit('audio_recording_stop', { roomId, userId, username });
  }

  markMessagesRead(roomId: string, userId: string) {
    this.socket?.emit('mark_messages_read', { roomId, userId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
