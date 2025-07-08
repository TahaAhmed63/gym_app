import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const access_token = await AsyncStorage.getItem('access_token');
    
    const response = await fetch(`https://gymbackend-eight.vercel.app/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data, // Modified line
      message: data.message,
    };
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error instanceof TypeError && error.message === 'Network request failed') {
      return {
        success: false,
        error: 'No internet connection. Please check your network and try again.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export function handleApiError(error: string, onRetry?: () => void) {
  Alert.alert(
    'Error',
    error,
    onRetry
      ? [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: onRetry },
        ]
      : [{ text: 'OK' }]
  );
} 