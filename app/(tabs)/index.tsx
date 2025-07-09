import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import Header from '@/components/common/Header';
import DashboardCard from '@/components/dashboard/DashboardCard';
import {
  ArrowUp,
  ArrowDown,
  UserRound,
  Calendar,
  CreditCard,
  Users,
  Clock,
} from 'lucide-react-native';
import { fetchDashboardData, DashboardData } from '@/data/dashboardService';
import DashboardChart from '@/components/dashboard/DashboardChart';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';
import { COUNTRY_TO_CODE } from '@/components/dashboard/DashboardChart';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function DashboardScreen() {
  const { user, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();
  }, []);

  // Get user's country code or default to US
  const countryCode = user?.country?.toUpperCase()
    ? COUNTRY_TO_CODE[user.country] || 'US'
    : 'US';
  console.log(user, 'user');
  const loadData = async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) setIsLoading(true);
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load dashboard data'
      );
    } finally {
      if (!isRefresh) setIsLoading(false);
    }
  };
  // console.log(dashboardData);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  };



  useFocusEffect(
    useCallback(() => {
      loadData();
      
    }, [])
  );

  const hasPermission = useRolePermissions();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addMember':
        router.push('/members/add');
        break;
      case 'recordPayment':
        router.push('/payments/add');
        break;
      // case 'markAttendance':
      //   router.push('/attendance');
      //   break;
    }
  };

  // Check if user has role 'stuff'
  const isStuff = user?.role?.toLowerCase() === 'staff';

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Header title="Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Header title="Dashboard" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Header title="Dashboard" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Total Members"
            value={dashboardData?.totalMembers || 0}
            icon={<Users size={24} color={COLORS.white} />}
            backgroundColor={COLORS.primary}
            isLoading={isLoading}
            
          />
          <DashboardCard
            title="Active Members"
            value={dashboardData?.activeMembers || 0}
            icon={<UserRound size={24} color={COLORS.white} />}
            backgroundColor={COLORS.success}
            isLoading={isLoading}
          />
        </View>

        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Today's Check-ins"
            value={dashboardData?.todayCheckIns || 0}
            icon={<Calendar size={24} color={COLORS.white} />}
            backgroundColor={COLORS.info}
            isLoading={isLoading}
          />
          <DashboardCard
            title="Expiring Soon"
            value={dashboardData?.expiringSoon || 0}
            icon={<Clock size={24} color={COLORS.white} />}
            backgroundColor={COLORS.warning}
            isLoading={isLoading}
          />
        </View>

        {/* Revenue Chart */}
        {!isStuff && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Revenue Overview</Text>
                     {/* <TouchableOpacity onPress={() => router.push('/reports/revenue')}>
                <Text style={styles.chartAction}>View All</Text>
              </TouchableOpacity> */}
            </View>
            <DashboardChart
              data={dashboardData?.revenueData || []}
              isLoading={isLoading}
              countryCode={countryCode}
            />

            <View style={styles.revenueStats}>
              <View style={styles.revenueItem}>
                <View style={styles.revenueIcon}>
                  <ArrowUp size={16} color={COLORS.success} />
                </View>
                <View>
                  <Text style={styles.revenueValue}>
                    {formatCurrency(
                      parseInt(dashboardData?.totalRevenue || 0),
                      countryCode
                    )}
                  </Text>
                  <Text style={styles.revenueLabel}>Total Revenue</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.revenueItem}>
                <View
                  style={[
                    styles.revenueIcon,
                    { backgroundColor: COLORS.errorLight },
                  ]}
                >
                  <ArrowDown size={16} color={COLORS.error} />
                </View>
                <View>
                  <Text style={styles.revenueValue}>
                    {formatCurrency( parseInt(dashboardData?.pendingDues || 0), countryCode)}
                  </Text>
                  <Text style={styles.revenueLabel}>Pending Dues</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {hasPermission('edit_members') && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleQuickAction('addMember')}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: COLORS.primaryLight },
                  ]}
                >
                  <UserRound size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Add Member</Text>
              </TouchableOpacity>
            )}
            {hasPermission('manage_payments') && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleQuickAction('recordPayment')}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: COLORS.successLight },
                  ]}
                >
                  <CreditCard size={24} color={COLORS.success} />
                </View>
                <Text style={styles.actionText}>Record Payment</Text>
              </TouchableOpacity>
            )}
            {/* <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleQuickAction('markAttendance')}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: COLORS.infoLight }]}>
                        <Calendar size={24} color={COLORS.info} />
                      </View>
                      <Text style={styles.actionText}>Mark Attendance</Text>
                    </TouchableOpacity> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  errorText: {
    ...FONTS.body3,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...SIZES.shadow,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  chartAction: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  revenueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  revenueIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  revenueValue: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  revenueLabel: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 12,
  },
  actionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    ...SIZES.shadow,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    ...FONTS.body4,
    color: COLORS.black,
  },
});
