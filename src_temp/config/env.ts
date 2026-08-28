// Centralized API and Backend configuration
export const LIVE_BACKEND_URL = 'https://chat-app-backend-8l0i.onrender.com';

// Toggle this to true if you want to test locally against local Node server
export const USE_LOCAL_DEV_SERVER = false;
export const LOCAL_DEV_IP = '10.47.248.118';
export const LOCAL_DEV_PORT = '5000';

export const BACKEND_BASE_URL = USE_LOCAL_DEV_SERVER
  ? `http://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`
  : LIVE_BACKEND_URL;

export const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1`;

// ---------------------------------------------------------------------------
// Google Sign-In (OAuth 2.0)
// ---------------------------------------------------------------------------
// This MUST be the "Web application" OAuth client ID (client_type 3) from the
// Firebase project `chatapp-5d8d5` — NOT the Android client ID.
//
// Where to get it:
//   Firebase Console -> Project Settings -> General -> Your apps -> Android app
//   -> "Web client ID", or Google Cloud Console -> APIs & Services ->
//   Credentials -> OAuth 2.0 Client IDs -> "Web client (auto created by Google Service)".
//
// Taken from android/app/google-services.json -> client[0].oauth_client entry
// with "client_type": 3. This value is not a secret: it ships inside the APK.
//
// The matching Android client (client_type 1) is bound to SHA-1
// 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25 (debug.keystore).
// If you ever sign with a different keystore, register that SHA-1 too or the
// account chooser will close instantly with DEVELOPER_ERROR.
export const GOOGLE_WEB_CLIENT_ID =
  '905606872942-f3k6v76pbhrqpqomjspse3tat6ga8ngv.apps.googleusercontent.com';

export const isGoogleSignInConfigured = () =>
  typeof GOOGLE_WEB_CLIENT_ID === 'string' &&
  GOOGLE_WEB_CLIENT_ID.endsWith('.apps.googleusercontent.com');
