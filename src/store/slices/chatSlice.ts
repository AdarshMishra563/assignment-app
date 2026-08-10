import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IChatRoom, IMessage } from '../../types';
import { apiClient } from '../../api/client';

interface ChatState {
  chats: IChatRoom[];
  activeRoom: IChatRoom | null;
  messages: IMessage[];
  loadingChats: boolean;
  loadingMessages: boolean;
  /**
   * Room whose messages are currently held in `messages`. Used to decide
   * whether a fetch is the FIRST load for this room (show a spinner) or a
   * background refresh (never show a spinner — it causes the whole list to
   * flash on every socket event).
   */
  loadedRoomId: string | null;
  /** Rooms that have completed at least one successful message fetch. */
  loadedRooms: Record<string, boolean>;
  /** Signed-in user id, mirrored here so reducers can attribute messages. */
  sessionUserId: string | null;
  /** Room currently open on screen (null when the user is elsewhere). */
  viewingRoomId: string | null;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeRoom: null,
  messages: [],
  loadingChats: false,
  loadingMessages: false,
  loadedRoomId: null,
  loadedRooms: {},
  sessionUserId: null,
  viewingRoomId: null,
  error: null
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/chats');
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch chats');
  }
});

export const fetchRoomMessages = createAsyncThunk(
  'chat/fetchRoomMessages',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/messages/${roomId}`);
      // roomId is carried through so the reducer can tell a first load apart
      // from a background refresh, and can ignore a stale response that lands
      // after the user has already switched rooms.
      return { roomId, messages: (res.data.data || []) as IMessage[] };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<IChatRoom | null>) => {
      state.activeRoom = action.payload;
    },
    setChats: (state, action: PayloadAction<IChatRoom[]>) => {
      state.chats = action.payload;
    },
    /**
     * Clear the unread badge for a room the user just opened, and flip any of
     * that room's loaded messages to 'read' locally so ticks update without a
     * refetch.
     */
    markRoomRead: (state, action: PayloadAction<string>) => {
      const room = state.chats.find((c) => c.id === action.payload);
      if (room) room.unreadCount = 0;
    },
    /**
     * Apply a room-wide status change (delivered/read receipts) in place.
     * Replaces the old behaviour of re-fetching every message on each receipt
     * event, which rebuilt the whole array and made the list flash.
     */
    applyRoomStatus: (
      state,
      action: PayloadAction<{ roomId: string; status: 'delivered' | 'read'; messageId?: string }>
    ) => {
      const { roomId, status, messageId } = action.payload;
      const rank = { sent: 0, delivered: 1, read: 2 } as const;

      for (const msg of state.messages) {
        if (msg.roomId !== roomId) continue;
        if (messageId && msg.id !== messageId) continue;
        // Never move a receipt backwards (read -> delivered).
        if (rank[msg.status] < rank[status]) {
          msg.status = status;
        }
      }
    },
    appendMessage: (state, action: PayloadAction<IMessage>) => {
      const incoming = action.payload;

      // The socket is joined to EVERY room the user belongs to, so this fires
      // for other conversations too. Only merge into `messages` when it really
      // belongs to the room on screen — otherwise foreign messages leak into
      // the open chat.
      if (incoming.roomId === state.loadedRoomId) {
        // 1. Deduplicate by exact message ID
        const existingById = state.messages.findIndex((m) => m.id === incoming.id);
        if (existingById !== -1) {
          state.messages[existingById] = incoming;
        } else {
          // 2. Replace matching temporary optimistic message (temp_...) if present
          const tempIndex = state.messages.findIndex(
            (m) =>
              m.id?.startsWith('temp_') &&
              m.senderId === incoming.senderId &&
              (m.content === incoming.content || (incoming.mediaUrl && m.mediaUrl === incoming.mediaUrl))
          );

          if (tempIndex !== -1) {
            state.messages[tempIndex] = incoming;
          } else {
            state.messages.push(incoming);
          }
        }
      }

      // Keep the chat list in sync: newest conversation first, bump the unread
      // badge when the message is from somebody else and its room is not open.
      const roomIndex = state.chats.findIndex((c) => c.id === incoming.roomId);
      if (roomIndex !== -1) {
        const room = state.chats[roomIndex];
        room.lastMessage = incoming;
        room.updatedAt = incoming.createdAt;

        const fromSomeoneElse =
          !!state.sessionUserId && incoming.senderId !== state.sessionUserId;
        const roomIsOpen = state.viewingRoomId === incoming.roomId;

        if (fromSomeoneElse && !roomIsOpen && !incoming.id.startsWith('temp_')) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        }

        // Move to the top of the list.
        state.chats.splice(roomIndex, 1);
        state.chats.unshift(room);
      }
    },
    /** Identity of the signed-in user, used to decide unread ownership. */
    setSessionUserId: (state, action: PayloadAction<string | null>) => {
      state.sessionUserId = action.payload;
    },
    /** Room currently rendered on screen; suppresses its own unread badge. */
    setViewingRoom: (state, action: PayloadAction<string | null>) => {
      state.viewingRoomId = action.payload;
      if (action.payload) {
        const room = state.chats.find((c) => c.id === action.payload);
        if (room) room.unreadCount = 0;
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: 'delivered' | 'read' }>) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg && msg.status !== action.payload.status) {
        msg.status = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loadingChats = true;
      })
      .addCase(fetchChats.fulfilled, (state, action: PayloadAction<IChatRoom[]>) => {
        state.loadingChats = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loadingChats = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRoomMessages.pending, (state, action) => {
        const roomId = action.meta.arg;
        // Only the very first fetch for a room is allowed to raise the spinner.
        // Background refreshes keep the existing list on screen.
        if (!state.loadedRooms[roomId]) {
          state.loadingMessages = true;
        }
        // Switching rooms: drop the previous room's messages immediately so the
        // old conversation is never briefly rendered under the new header.
        if (state.loadedRoomId !== roomId) {
          state.messages = [];
          state.loadedRoomId = roomId;
        }
      })
      .addCase(fetchRoomMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        // Ignore a late response for a room the user has already left.
        if (state.loadedRoomId !== roomId) return;

        state.loadingMessages = false;
        state.loadedRooms[roomId] = true;

        // Preserve optimistic messages that the server round-trip has not
        // returned yet, otherwise they vanish and reappear.
        const pending = state.messages.filter(
          (m) => m.id.startsWith('temp_') && !messages.some((s) => s.content === m.content)
        );
        state.messages = pending.length ? [...messages, ...pending] : messages;
      })
      .addCase(fetchRoomMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setActiveRoom,
  setChats,
  markRoomRead,
  applyRoomStatus,
  appendMessage,
  setSessionUserId,
  setViewingRoom,
  updateMessageStatus
} = chatSlice.actions;
export default chatSlice.reducer;
