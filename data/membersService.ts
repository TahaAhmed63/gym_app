import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock members data service

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string | null;
}

interface PaymentRecord {
  date: string;
  amount: number;
  due: number;
  status: 'paid' | 'partial';
  plan: string;
  period: string;
}

interface Member {
  id: number;
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  status: 'active' | 'inactive';
  plan: string;
  batch: string;
  startDate: string;
  expiryDate: string;
  emergency?: EmergencyContact;
  attendance?: AttendanceRecord[];
  payments?: PaymentRecord[];
}

const API_BASE_URL = 'https://gymbackend-nfa0.onrender.com/api';

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

export async function fetchMembers(): Promise<Member[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/members`, {
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch members');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

export async function fetchMemberById(id: string | string[]): Promise<Member | null> {
  try {
    const memberId = typeof id === 'string' ? id : id[0];
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
      headers
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch member');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching member:', error);
    throw error;
  }
}

export async function createMember(memberData: Omit<Member, 'id'>): Promise<Member> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers,
      body: JSON.stringify(memberData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create member');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
}

export async function updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(memberData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update member');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}

export async function deleteMember(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete member');
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}