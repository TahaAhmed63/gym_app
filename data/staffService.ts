import { api } from './api';
import { StaffMember } from './authService';

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    staff: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface StaffResponse {
  success: boolean;
  data: StaffMember;
}

export async function getAllStaff(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}): Promise<PaginatedResponse<StaffMember>> {
  try {
    const response = await api.get('/staff', { params });
    return response.data;
  } catch (error) {
    console.error('Get all staff error:', error);
    throw error;
  }
}

export async function getStaffById(id: string): Promise<StaffMember> {
  try {
    const response = await api.get(`/staff/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Get staff by ID error:', error);
    throw error;
  }
}

export async function createStaff(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions?: string[];
}): Promise<StaffMember> {
  try {
    const response = await api.post('/staff', data);
    return response.data.data;
  } catch (error) {
    console.error('Create staff error:', error);
    throw error;
  }
}

export async function updateStaff(
  id: string,
  data: {
    name?: string;
    phone?: string;
    role?: string;
    permissions?: string[];
  }
): Promise<StaffMember> {
  try {
    const response = await api.put(`/staff/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Update staff error:', error);
    throw error;
  }
}

export async function deleteStaff(id: string, deleteUser: boolean = false): Promise<void> {
  try {
    await api.delete(`/staff/${id}`, {
      data: { deleteUser }
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    throw error;
  }
}

export async function updateStaffPermissions(
  id: string,
  permissions: string[]
): Promise<StaffMember> {
  try {
    const response = await api.patch(`/staff/${id}/permissions`, { permissions });
    return response.data.data;
  } catch (error) {
    console.error('Update staff permissions error:', error);
    throw error;
  }
} 