// Mock payments data service

import { api } from './api';

export interface Payment {
  id: number;
  member_id: number;
  amount_paid: number;
  total_amount: number;
  due_amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  member?: {
    id: number;
    name: string;
  };
}

export interface PaymentStats {
  totalCollected: number;
  pendingDues: number;
  collectionRate: number;
  pendingRate: number;
}

export interface PaymentSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  totalReceived: number;
  totalDue: number;
  totalBilled: number;
  collectionRate: number;
  paymentMethods: Record<string, number>;
  dailyRevenue: Array<{
    date: string;
    amount: number;
  }>;
}

const mockPayments: Payment[] = Array.from({ length: 20 }, (_, i) => {
  const id = i + 1;
  const memberId = Math.floor(Math.random() * 15) + 1;
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 60));
  
  const status = Math.random() > 0.8 ? 'partial' : Math.random() > 0.9 ? 'pending' : 'paid';
  const amount = Math.floor(Math.random() * 1000) + 500;
  
  return {
    id,
    memberId,
    memberName: `Member ${memberId}`,
    amount,
    date: date.toISOString(),
    paymentMethod: ['Cash', 'Credit Card', 'UPI', 'Bank Transfer'][Math.floor(Math.random() * 4)],
    status,
    plan: ['Monthly Plan', 'Quarterly Plan', 'Annual Plan'][Math.floor(Math.random() * 3)]
  };
});

export const fetchPayments = async (
  period: 'day' | 'week' | 'month' | 'custom' = 'month',
  dateRange?: { startDate: string | null; endDate: string | null }
): Promise<Payment[]> => {
  let url = '/payments';
  const params = new URLSearchParams();

  if (period === 'custom' && dateRange?.startDate && dateRange?.endDate) {
    params.append('start_date', dateRange.startDate);
    params.append('end_date', dateRange.endDate);
  } else {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    params.append('start_date', startDate.toISOString());
    params.append('end_date', new Date().toISOString());
  }

  const response = await api.get(`${url}?${params.toString()}`);
  return response.data.data;
};

export const fetchPaymentStats = async (
  period: 'day' | 'week' | 'month' | 'custom' = 'month',
  dateRange?: { startDate: string | null; endDate: string | null }
): Promise<PaymentStats> => {
  let url = '/payments/summary';
  const params = new URLSearchParams();

  if (period === 'custom' && dateRange?.startDate && dateRange?.endDate) {
    params.append('start_date', dateRange.startDate);
    params.append('end_date', dateRange.endDate);
  } else {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    params.append('start_date', startDate.toISOString());
    params.append('end_date', new Date().toISOString());
  }

  const response = await api.get(`${url}?${params.toString()}`);
  return response.data.data;
};

export const getPaymentById = async (id: string | number): Promise<Payment> => {
  const response = await api.get(`/payments/${id}`);
  return response.data.data;
};

export const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> => {
  console.log(paymentData)
  const response = await api.post('/payments', paymentData);
  console.log(paymentData)
  return response.data.data;
};

export const updatePayment = async (id: string | number, paymentData: Partial<Payment>): Promise<Payment> => {
  console.log(paymentData,"paymentdata")
  const response = await api.put(`/payments/${id}`, paymentData);

  return response.data.data;
};

export const deletePayment = async (id: string | number): Promise<void> => {
  await api.delete(`/payments/${id}`);
};

export const getMemberPayments = async (memberId: string | number): Promise<{
  member: { id: number; name: string };
  summary: { totalPaid: number; totalDue: number };
  payments: Payment[];
}> => {
  const response = await api.get(`/payments/member/${memberId}`);
  return response.data.data;
};