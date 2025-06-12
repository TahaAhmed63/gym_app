import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://gymbackend-eight.vercel.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          // Clear tokens and redirect to login
          await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        if (response.data.success) {
          const { access_token, refresh_token, expires_at } = response.data.data;
          
          // Store the new tokens
          await AsyncStorage.setItem('access_token', access_token);
          await AsyncStorage.setItem('refresh_token', refresh_token);
          await AsyncStorage.setItem('token_expires_at', expires_at.toString());

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        // Clear tokens and redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);