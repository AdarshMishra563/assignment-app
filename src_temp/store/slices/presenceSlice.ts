import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IVideoCallSignal } from '../../types';

interface PresenceState {
  onlineUsers: Record<string, boolean>; // userId -> isOnline
  typingUsers: Record<string, string>; // roomId -> username
  recordingUsers: Record<string, string>; // roomId -> username
  activeVideoCall: IVideoCallSignal | null;
}

const initialState: PresenceState = {
  onlineUsers: {},
  typingUsers: {},
  recordingUsers: {},
  activeVideoCall: null
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setUserPresence: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      state.onlineUsers[action.payload.userId] = action.payload.isOnline;
    },
    setTypingStatus: (state, action: PayloadAction<{ roomId: string; username: string; isTyping: boolean }>) => {
      if (action.payload.isTyping) {
        state.typingUsers[action.payload.roomId] = action.payload.username;
      } else {
        delete state.typingUsers[action.payload.roomId];
      }
    },
    setRecordingStatus: (state, action: PayloadAction<{ roomId: string; username: string; isRecording: boolean }>) => {
      if (action.payload.isRecording) {
        state.recordingUsers[action.payload.roomId] = action.payload.username;
      } else {
        delete state.recordingUsers[action.payload.roomId];
      }
    },
    setActiveVideoCall: (state, action: PayloadAction<IVideoCallSignal | null>) => {
      state.activeVideoCall = action.payload;
    }
  }
});

export const {
  setUserPresence,
  setTypingStatus,
  setRecordingStatus,
  setActiveVideoCall
} = presenceSlice.actions;

export default presenceSlice.reducer;
