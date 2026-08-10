import { store } from '../store';
import { socketService } from './socketService';
import { appendMessage } from '../store/slices/chatSlice';
import {
  setUserPresence,
  setTypingStatus,
  setRecordingStatus,
  setActiveVideoCall
} from '../store/slices/presenceSlice';
import { IMessage, ITypingState, IRecordingState, IVideoCallSignal } from '../types';

export const initializeSocketReduxListeners = (userId: string) => {
  const socket = socketService.connect(userId);

  // 1. Presence changes -> Redux
  socket.on('user_presence_change', (data: { userId: string; isOnline: boolean }) => {
    store.dispatch(setUserPresence(data));
  });

  // 2. Incoming messages -> Redux
  socket.on('receive_message', (msg: IMessage) => {
    store.dispatch(appendMessage(msg));
  });

  // 3. Typing indicators -> Redux
  socket.on('user_typing', (data: ITypingState) => {
    if (data.roomId) {
      store.dispatch(setTypingStatus({ roomId: data.roomId, username: data.username, isTyping: data.isTyping }));
    }
  });

  // 4. Voice recording alerts -> Redux
  socket.on('user_audio_recording', (data: IRecordingState) => {
    if (data.roomId) {
      store.dispatch(setRecordingStatus({ roomId: data.roomId, username: data.username, isRecording: data.isRecording }));
    }
  });

  // 5. Video Call Signals -> Redux
  socket.on('video_call_incoming', (signal: IVideoCallSignal) => {
    store.dispatch(setActiveVideoCall(signal));
  });

  socket.on('video_call_ended', () => {
    store.dispatch(setActiveVideoCall(null));
  });

  return socket;
};
