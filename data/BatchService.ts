import AsyncStorage from '@react-native-async-storage/async-storage';

interface Batch {
  id: string;
  name: string;
  schedule_time: string;
}

const API_BASE_URL = 'https://gymbackend-eight.vercel.app/api';

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

export async function fetchBatches(): Promise<Batch[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/batches`, {
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch batches');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
}

export async function fetchBatchById(id: string | string[]): Promise<Batch | null> {
  try {
    const batchId = typeof id === 'string' ? id : id[0];
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}`, {
      headers
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch batch');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching batch:', error);
    throw error;
  }
}

export async function createBatch(batchData: Omit<Batch, 'id'>): Promise<Batch> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers,
      body: JSON.stringify(batchData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create batch');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
}

export async function updateBatch(id: string, batchData: Partial<Batch>): Promise<Batch> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(batchData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update batch');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating batch:', error);
    throw error;
  }
}

export async function deleteBatch(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete batch');
    }
  } catch (error) {
    console.error('Error deleting batch:', error);
    throw error;
  }
}