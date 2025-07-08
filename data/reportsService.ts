// Mock reports data service

import { apiCall } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob?: string;
  plan_end_date?: string;
  status: 'active' | 'inactive';
  photo?: string;
  plans?: {
    name: string;
    price: number;
  };
  days_remaining?: number;
  days_until_birthday?: number;
}

export async function fetchExpiringMembers(timeframe: string): Promise<Member[]> {
  const response = await apiCall<Member[]>(`/reports/expiring?timeframe=${timeframe}`);
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch expiring members');
  }
  console.log(response,"new" )
  return response.data || [];
}

export async function fetchBirthdayMembers(): Promise<Member[]> {
  const response = await apiCall<Member[]>('/reports/birthday');
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch birthday members');
  }
  return response.data || [];
}

export async function downloadReport(type: 'all' | 'active' | 'inactive' | 'partial'): Promise<void> {
  try {
    const response = await fetch(`https://gymbackend-eight.vercel.app/api/reports/download/${type}`, {
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    // Get the blob from the response
    const blob = await response.blob();
    
    // Convert blob to base64
    const reader = new FileReader();
    const base64Data = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Remove the data URL prefix to get just the base64 data
    const base64 = base64Data.split(',')[1];
    
    // Create a temporary file path
    const fileUri = `${FileSystem.cacheDirectory}${type}_members_report.csv`;
    
    // Write the file
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}