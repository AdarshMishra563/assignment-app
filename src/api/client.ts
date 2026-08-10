import axios from 'axios';
import { Platform } from 'react-native';
import { storageService } from '../services/storageService';
import { API_BASE_URL } from '../config/env';

export { API_BASE_URL };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s timeout to prevent hanging forever
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Auth token or user headers
apiClient.interceptors.request.use((config) => {
  const token = storageService.getItemSync('pulse_auth_token');
  const userJson = storageService.getItemSync('pulse_user');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      config.headers['x-user-id'] = user.id;
      config.headers['x-username'] = user.username;
    } catch (e) {}
  }

  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API Response ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// S3 Upload Helper Function
export const uploadFileToS3 = async (file: File): Promise<string> => {
  try {
    const res = await apiClient.get('/media/presigned-url', {
      params: {
        fileName: file.name,
        fileType: file.type
      }
    });

    const { uploadUrl, publicUrl } = res.data.data;

    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to AWS S3:', error);
    throw error;
  }
};
