import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../types';
import { apiClient } from '../../api/client';
import { storageService } from '../../services/storageService';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { username: string; email: string }, { rejectWithValue }) => {
    try {
      console.log('[authSlice] Sending POST /auth/login with payload:', payload);
      const res = await apiClient.post('/auth/login', payload);
      console.log('[authSlice] Received response:', res.status, res.data);
      return res.data.data; // { user, token }
    } catch (err: any) {
      console.error('[authSlice] API Error:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      return rejectWithValue(err.response?.data?.error || err.message || 'Authentication failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (payload: { email: string; username?: string; photoUrl?: string; idToken?: string }, { rejectWithValue }) => {
    try {
      console.log('[authSlice] Sending POST /auth/google with payload:', payload);
      const res = await apiClient.post('/auth/google', payload);
      console.log('[authSlice] Google auth response:', res.status, res.data);
      return res.data.data; // { user, token }
    } catch (err: any) {
      console.error('[authSlice] Google auth API error:', err);
      return rejectWithValue(err.response?.data?.error || err.message || 'Google Authentication failed');
    }
  }
);

export const loadSavedSession = createAsyncThunk(
  'auth/loadSavedSession',
  async (_, { dispatch }) => {
    try {
      console.log('[authSlice] Restoring session from AsyncStorage...');
      const token = await storageService.getItem('pulse_auth_token');
      const userJson = await storageService.getItem('pulse_user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        console.log('[authSlice] Restored session for user:', user.username);
        dispatch(setCredentials({ user, token }));
        return { user, token };
      }
    } catch (e) {
      console.warn('[authSlice] Failed to restore session from AsyncStorage:', e);
    }
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatarUrl = action.payload;
        storageService.setItem('pulse_user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      storageService.removeItem('pulse_auth_token');
      storageService.removeItem('pulse_user');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: IUser; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        storageService.setItem('pulse_auth_token', action.payload.token);
        storageService.setItem('pulse_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action: PayloadAction<{ user: IUser; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        storageService.setItem('pulse_auth_token', action.payload.token);
        storageService.setItem('pulse_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCredentials, updateUserAvatar, logout } = authSlice.actions;
export default authSlice.reducer;
