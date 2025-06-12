import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

const AUTOMATION_SETTINGS_KEY = 'automation_settings';

export interface AutomationSettings {
  autoInactiveMembers: boolean;
}

export const getAutomationSettings = async (): Promise<AutomationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(AUTOMATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : { autoInactiveMembers: false };
  } catch (error) {
    console.error('Error getting automation settings:', error);
    return { autoInactiveMembers: false };
  }
};

export const saveAutomationSettings = async (settings: AutomationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTOMATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving automation settings:', error);
    throw error;
  }
};

export const checkMemberStatus = async (): Promise<void> => {
  try {
    const settings = await getAutomationSettings();
    if (!settings.autoInactiveMembers) {
      return;
    }

    const access_token = await AsyncStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/members/check-status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check member status');
    }
  } catch (error) {
    console.error('Error checking member status:', error);
    throw error;
  }
}; 