import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IChatRoom, IMessage } from '../../types';
import { apiClient } from '../../api/client';

interface ChatState {
  chats: IChatRoom[];
  activeRoom: IChatRoom | null;
  messages: IMessage[];
  loadingChats: boolean;
  loadingMessages: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeRoom: null,
  messages: [],
  loadingChats: false,
  loadingMessages: false,
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
      return res.data.data;
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
    appendMessage: (state, action: PayloadAction<IMessage>) => {
      state.messages.push(action.payload);
      // Update last message in chats list
      const roomIndex = state.chats.findIndex((c) => c.id === action.payload.roomId);
      if (roomIndex !== -1) {
        state.chats[roomIndex].lastMessage = action.payload;
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: 'delivered' | 'read' }>) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
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
      .addCase(fetchRoomMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchRoomMessages.fulfilled, (state, action: PayloadAction<IMessage[]>) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchRoomMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      });
  }
});

export const { setActiveRoom, appendMessage, updateMessageStatus } = chatSlice.actions;
export default chatSlice.reducer;
