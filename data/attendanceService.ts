import { api } from './api';

export async function getMemberAttendance(memberId: string) {
  const res = await api.get(`/attendance?member_id=${memberId}`);
  // Adjust if your API response structure is different
  return res.data?.data || [];
}

export async function markMemberAttendance(memberId: string,batchId:string) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const res = await api.post('/attendance', {
    member_id: memberId,
    batch_id: batchId,
    date: today,
    status: 'present',
  });
  return res.data;
} 