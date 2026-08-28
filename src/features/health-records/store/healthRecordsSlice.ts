import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../../api/client';
import { HealthRecord, HealthRecordType } from '../types';
import { showToast } from '../../../design-system/components/Toast';

interface HealthRecordsState {
  records: HealthRecord[];
  totalRecords: number;
  recordsPage: number;
  hasMoreRecords: boolean;
  loadingRecords: boolean;

  selectedRecord: HealthRecord | null;
  loadingRecordDetail: boolean;

  selectedTypeFilter: string;
  searchQuery: string;
}

const initialState: HealthRecordsState = {
  records: [],
  totalRecords: 0,
  recordsPage: 1,
  hasMoreRecords: true,
  loadingRecords: false,

  selectedRecord: null,
  loadingRecordDetail: false,

  selectedTypeFilter: 'all',
  searchQuery: '',
};

export const fetchHealthRecords = createAsyncThunk(
  'healthRecords/fetchHealthRecords',
  async (
    params: {
      page?: number;
      type?: string;
      search?: string;
      refresh?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const page = params.page || 1;
      const { data } = await apiClient.get<{
        items: HealthRecord[];
        total: number;
        page: number;
        hasMore: boolean;
      }>('/health-records', {
        params: {
          page,
          limit: 20,
          type: params.type,
          search: params.search,
        },
      });
      return { ...data, refresh: params.refresh };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch clinical records');
    }
  }
);

export const fetchRecordById = createAsyncThunk(
  'healthRecords/fetchRecordById',
  async (recordId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<HealthRecord>(`/health-records/${recordId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load record details');
    }
  }
);

const healthRecordsSlice = createSlice({
  name: 'healthRecords',
  initialState,
  reducers: {
    setTypeFilter(state, action: PayloadAction<string>) {
      state.selectedTypeFilter = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    addRecord(state, action: PayloadAction<HealthRecord>) {
      state.records.unshift(action.payload);
      showToast.success('New health record saved to timeline');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthRecords.pending, (state, action) => {
        state.loadingRecords = true;
        if (action.meta.arg.refresh) {
          state.records = [];
        }
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.loadingRecords = false;
        if (action.payload.refresh || action.payload.page === 1) {
          state.records = action.payload.items;
        } else {
          state.records = [...state.records, ...action.payload.items];
        }
        state.recordsPage = action.payload.page;
        state.totalRecords = action.payload.total;
        state.hasMoreRecords = action.payload.hasMore;
      })
      .addCase(fetchHealthRecords.rejected, (state) => {
        state.loadingRecords = false;
      });

    builder
      .addCase(fetchRecordById.pending, (state) => {
        state.loadingRecordDetail = true;
      })
      .addCase(fetchRecordById.fulfilled, (state, action) => {
        state.loadingRecordDetail = false;
        state.selectedRecord = action.payload;
      })
      .addCase(fetchRecordById.rejected, (state) => {
        state.loadingRecordDetail = false;
      });
  },
});

export const { setTypeFilter, setSearchQuery, addRecord } = healthRecordsSlice.actions;
export default healthRecordsSlice.reducer;
