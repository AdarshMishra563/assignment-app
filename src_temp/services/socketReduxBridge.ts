import { store } from '../store';
import { socketService } from './socketService';
import {
  appendMessage,
  setSessionUserId,
  fetchChats,
} from '../store/slices/chatSlice';
import {
  setUserPresence,
  setTypingStatus,
  setRecordingStatus,
  setActiveVideoCall
} from '../store/slices/presenceSlice';
import { IMessage, ITypingState, IRecordingState, IVideoCallSignal } from '../types';

// Handlers are kept at module scope so a second call to
// initializeSocketReduxListeners replaces them instead of stacking a duplicate
// set. Previously every re-run added another `receive_message` listener, so a
// single incoming message was dispatched several times.
let boundSocketId: string | null = null;
let teardown: (() => void) | null = null;

export const initializeSocketReduxListeners = (userId: string) => {
  const socket = socketService.connect(userId);

  store.dispatch(setSessionUserId(userId));

  // Already wired to this exact socket instance — nothing to do.
  if (boundSocketId === socket.id && teardown) {
    return socket;
  }

  if (teardown) {
    teardown();
    teardown = null;
  }

  const onPresence = (data: { userId: string; isOnline: boolean }) => {
    store.dispatch(setUserPresence(data));
  };

  const onMessage = (msg: IMessage) => {
    store.dispatch(appendMessage(msg));
  };

  const onTyping = (data: ITypingState) => {
    if (!data.roomId) return;
    store.dispatch(
      setTypingStatus({ roomId: data.roomId, username: data.username, isTyping: data.isTyping })
    );
  };

  const onRecording = (data: IRecordingState) => {
    if (!data.roomId) return;
    store.dispatch(
      setRecordingStatus({
        roomId: data.roomId,
        username: data.username,
        isRecording: data.isRecording,
      })
    );
  };

  const onVideoCallIncoming = (signal: IVideoCallSignal) => {
    store.dispatch(setActiveVideoCall(signal));
  };

  const onVideoCallEnded = () => {
    store.dispatch(setActiveVideoCall(null));
  };

  // A group or DM someone else created. Re-pull the list so the new room shows
  // up straight away, with its participants and unread count populated.
  const onRoomCreated = () => {
    store.dispatch(fetchChats());
  };

  const onRoomUpdated = () => {
    store.dispatch(fetchChats());
  };

  socket.on('user_presence_change', onPresence);
  socket.on('receive_message', onMessage);
  socket.on('user_typing', onTyping);
  socket.on('user_audio_recording', onRecording);
  socket.on('video_call_incoming', onVideoCallIncoming);
  socket.on('video_call_ended', onVideoCallEnded);
  socket.on('chat_room_created', onRoomCreated);
  socket.on('chat_room_updated', onRoomUpdated);

  boundSocketId = socket.id ?? null;
  teardown = () => {
    // Remove only OUR handlers. `socket.off(event)` with no handler would also
    // rip out listeners registered elsewhere (SocketContext binds some of the
    // same events).
    socket.off('user_presence_change', onPresence);
    socket.off('receive_message', onMessage);
    socket.off('user_typing', onTyping);
    socket.off('user_audio_recording', onRecording);
    socket.off('video_call_incoming', onVideoCallIncoming);
    socket.off('video_call_ended', onVideoCallEnded);
    socket.off('chat_room_created', onRoomCreated);
    socket.off('chat_room_updated', onRoomUpdated);
    boundSocketId = null;
  };

  return socket;
};

export const teardownSocketReduxListeners = () => {
  if (teardown) teardown();
  teardown = null;
  store.dispatch(setSessionUserId(null));
};
