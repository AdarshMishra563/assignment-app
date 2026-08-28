import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface QueuedAction {
  id: string;
  type: 'BOOK_CONSULTATION' | 'SYNC_CART' | 'UPLOAD_RECORD';
  payload: any;
  createdAt: string;
  retryCount: number;
}

interface SyncQueueState {
  queue: QueuedAction[];
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

const initialState: SyncQueueState = {
  queue: [],
  isSyncing: false,
  lastSyncedAt: null,
};

const syncQueueSlice = createSlice({
  name: 'syncQueue',
  initialState,
  reducers: {
    enqueueAction(state, action: PayloadAction<Omit<QueuedAction, 'id' | 'createdAt' | 'retryCount'>>) {
      const newAction: QueuedAction = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        retryCount: 0,
        ...action.payload,
      };
      state.queue.push(newAction);
    },
    dequeueAction(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },
    incrementRetry(state, action: PayloadAction<string>) {
      const item = state.queue.find((i) => i.id === action.payload);
      if (item) {
        item.retryCount += 1;
      }
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
    setLastSynced(state) {
      state.lastSyncedAt = new Date().toISOString();
    },
    clearQueue(state) {
      state.queue = [];
    },
  },
});

export const {
  enqueueAction,
  dequeueAction,
  incrementRetry,
  setSyncing,
  setLastSynced,
  clearQueue,
} = syncQueueSlice.actions;

export default syncQueueSlice.reducer;
