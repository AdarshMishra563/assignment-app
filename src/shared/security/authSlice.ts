import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { env } from '../../config/env';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  memberSince: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  /**
   * Epoch ms at which `token` stops being valid. This app has no real
   * login flow (see client.ts's session-expiry check), so the mock
   * session simply starts counting down from app boot / login and, once
   * it lapses, is treated the same way an expired real JWT would be:
   * auth state is cleared and the user is told to sign in again.
   */
  tokenExpiresAt: number | null;
  user: User | null;
  loading: boolean;
  /** Set when the session was cleared because it expired (vs. an explicit logout), so the UI can tell the two apart if needed. */
  sessionExpiredReason: boolean;
}

const initialState: AuthState = {
  isAuthenticated: true,
  token: 'mock-jwt-amrutam-token-xyz',
  tokenExpiresAt: Date.now() + env.SESSION_TTL_MS,
  user: {
    id: 'usr_patient_001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isVerified: true,
    memberSince: '2024-01-15',
  },
  loading: false,
  sessionExpiredReason: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.tokenExpiresAt = Date.now() + env.SESSION_TTL_MS;
      state.loading = false;
      state.sessionExpiredReason = false;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenExpiresAt = null;
      state.loading = false;
      state.sessionExpiredReason = false;
    },
    /**
     * Dispatched by client.ts (see checkSessionExpiry) once it detects the
     * mock token's TTL has lapsed. Clears auth state the same way logout
     * does, but flags *why* so the UI can distinguish an expired session
     * from a deliberate sign-out. There is no re-auth screen in this app
     * (the original AuthScreen was removed from an earlier chat-app
     * version) — re-authentication UI is out of scope here; this only
     * covers detecting expiry and clearing state gracefully.
     */
    sessionExpired(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenExpiresAt = null;
      state.loading = false;
      state.sessionExpiredReason = true;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { loginSuccess, logout, sessionExpired, setLoading, updateUser } = authSlice.actions;
export default authSlice.reducer;
