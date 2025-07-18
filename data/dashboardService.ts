// Mock dashboard data service

import { fetchMembers } from './membersService';
import { fetchPayments, fetchPaymentStats } from './paymentsService';
import { fetchExpiringMembers } from './reportsService'; // Add this import

export interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  todayCheckIns: number;
  expiringSoon: number;
  totalRevenue: number;
  pendingDues: number;
  revenueData: Array<{ month: string; revenue: number }>;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    // Fetch all required data in parallel
    const [membersResponse, paymentStats, paymentsResponse, expiringMembers] = await Promise.all([
      fetchMembers(),
      fetchPaymentStats('month'),
      fetchPayments('month'),
      fetchExpiringMembers('10days') // Fetch expiring members for 7 days
    ]);
    console.log(paymentStats,"payment stats")
    const members = membersResponse.data;
console.log(members,"testcheck")
    const payments = paymentsResponse.data;
    // Calculate member statistics
    const activeMembers = members?.filter(m => m.status === 'active').length;
    const inactiveMembers = members?.filter(m => m.status === 'inactive').length;

    // Calculate today's check-ins
    const today = new Date().toISOString().split('T')[0];
    const todayCheckIns = members?.filter(m => 
      m.attendance?.some(a => a.date.startsWith(today))
    ).length;

    // Calculate expiring soon (within next 7 days)
    const expiringSoon = expiringMembers.length+1; // Use the length of fetched expiring members
    const totalCollectedCalculation=()=>{
      const totalCollected=payments.reduce((acc,payment)=>acc+payment.amount_paid,0)
      return totalCollected
    }
    const totalPendingCalculation=()=>{
      const totalPending=payments.reduce((acc,payment)=>acc+payment.due_amount,0)
      return totalPending
    }
    // Process revenue data
    const revenueData = processRevenueData(payments);
console.log(revenueData)
    return {
      totalMembers: membersResponse?.meta?.total,
      activeMembers,
      inactiveMembers,
      todayCheckIns,
      expiringSoon,
      totalRevenue:paymentStats.amount_paid,
      pendingDues: paymentStats.due_amount,
      revenueData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

function processRevenueData(payments: any[]): Array<{ month: string; revenue: number }> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = new Map<string, number>();

  // Initialize all months with 0
  months.forEach(month => revenueByMonth.set(month, 0));

  // Calculate revenue for each month
  payments.forEach(payment => {
    const date = new Date(payment.payment_date);
    const month = months[date.getMonth()];
    const currentRevenue = revenueByMonth.get(month) || 0;
    revenueByMonth.set(month, currentRevenue + payment.amount_paid);
  });

  // Convert to array format
  return months.map(month => ({
    month,
    revenue: revenueByMonth.get(month) || 0
  }));
}