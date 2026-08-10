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
