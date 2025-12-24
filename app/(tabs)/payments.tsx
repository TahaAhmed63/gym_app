import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { COUNTRY_TO_CODE } from '@/components/dashboard/DashboardChart';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { router } from 'expo-router';
import { Plus, Filter, Download, ArrowUp, ArrowDown } from 'lucide-react-native';
import Header from '@/components/common/Header';
import PaymentCard from '@/components/payments/PaymentCard';
import DateRangePicker from '@/components/payments/DateRangePicker';
import { fetchPayments, fetchPaymentStats, exportPaymentsToExcel } from '@/data/paymentsService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const {user}=useAuth()
  const [period, setPeriod] = useState<'day'|'week'|'month'|'custom'>('month');
  const [dateRange, setDateRange] = useState<{ startDate: Date|null, endDate: Date|null }>({ startDate: null, endDate: null });
  const [showPendingDuesOnly, setShowPendingDuesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const countryCode = user?.country ? COUNTRY_TO_CODE[user.country] || 'US' : 'US';
  
  const loadPayments = async (pageToLoad = 1, append = false) => {
    if (append) setIsFetchingMore(true);
    else setIsLoading(true);
    try {
      // Convert dateRange to string for fetchPayments
      const stringDateRange = dateRange.startDate && dateRange.endDate ? {
        startDate: dateRange.startDate instanceof Date ? dateRange.startDate.toISOString() : null,
        endDate: dateRange.endDate instanceof Date ? dateRange.endDate.toISOString() : null,
      } : { startDate: null, endDate: null };
      const response = await fetchPayments(period, stringDateRange, pageToLoad, 10);
      setTotalPages(response.meta.totalPages);
      setPage(pageToLoad);
      setPayments(prev => append ? [...prev, ...response.data] : response.data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      if (append) setIsFetchingMore(false);
      else setIsLoading(false);
    }
  };
  
  const loadStats = async () => {
    setIsStatsLoading(true);
    try {
      // Convert dateRange to string for fetchPaymentStats
      const stringDateRange = dateRange.startDate && dateRange.endDate ? {
        startDate: dateRange.startDate instanceof Date ? dateRange.startDate.toISOString() : null,
        endDate: dateRange.endDate instanceof Date ? dateRange.endDate.toISOString() : null,
      } : { startDate: null, endDate: null };
      const data = await fetchPaymentStats(period, stringDateRange);
      setStats(data);
    } catch (error) {
      console.error('Error loading payment stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };
  
  useEffect(() => {
    loadStats();
    loadPayments(1, false);
  }, [period, dateRange]);
  
  const handlePeriodChange = (newPeriod: 'day'|'week'|'month'|'custom') => {
    setPeriod(newPeriod);
    setShowPendingDuesOnly(false);
  };
  
  const handleDateRangeChange = (range: { startDate: Date|null, endDate: Date|null }) => {
    setDateRange(range);
    setPeriod('custom');
    setShowPendingDuesOnly(false);
  };

  const handlePendingDuesTab = () => {
    setShowPendingDuesOnly(true);
  };
  
  const handleAddPayment = () => {
    router.push('/payments/add');
  };

  const handleExport = async () => {
    try {
      // Convert dateRange to string for exportPaymentsToExcel
      const stringDateRange = dateRange.startDate && dateRange.endDate ? {
        startDate: dateRange.startDate instanceof Date ? dateRange.startDate.toISOString() : null,
        endDate: dateRange.endDate instanceof Date ? dateRange.endDate.toISOString() : null,
      } : { startDate: null, endDate: null };
      const blob = await exportPaymentsToExcel(period, stringDateRange);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        if (!reader.result) return;
        const base64data = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
        // use cacheDirectory for a reliable write location and plain 'base64' encoding
  const fileUri = `${(FileSystem as any).cacheDirectory}payments_export.xlsx`;
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: 'base64',
        } as any);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      };
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export payments data');
    }
  };
console.log(stats,"new stats")
  const filteredPayments = showPendingDuesOnly
    ? payments.filter((p) => p.due_amount > 0)
    : payments;


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <Header title="Payments" />
      
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        {isStatsLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(parseInt(stats.amount_paid)|| 0, countryCode)} </Text>
              <Text style={styles.statLabel}>Total Collected</Text>
              <View style={[styles.statBadge, { backgroundColor: COLORS.successLight }]}>
                <ArrowUp size={12} color={COLORS.success} />
                <Text style={[styles.statBadgeText, { color: COLORS.success }]}> {stats?.collectionRate || 0}% </Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(parseInt(stats.due_amount)| 0, countryCode)}</Text>
              <Text style={styles.statLabel}>Pending Dues</Text>
              <View style={[styles.statBadge, { backgroundColor: COLORS.errorLight }]}>
                <ArrowDown size={12} color={COLORS.error} />
                <Text style={[styles.statBadgeText, { color: COLORS.error }]}> {stats?.pendingRate || 0}% </Text>
              </View>
            </View>
          </>
        )}
      </View>
      {/* Time Period Selector */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodContainer}
        >
          <TouchableOpacity
            style={[styles.periodButton, period === 'day' && styles.activePeriod]}
            onPress={() => handlePeriodChange('day')}
          >
            <Text style={[styles.periodText, period === 'day' && styles.activePeriodText]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.activePeriod]}
            onPress={() => handlePeriodChange('week')}
          >
            <Text style={[styles.periodText, period === 'week' && styles.activePeriodText]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.activePeriod]}
            onPress={() => handlePeriodChange('month')}
          >
            <Text style={[styles.periodText, period === 'month' && styles.activePeriodText]}>
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'custom' && styles.activePeriod]}
            onPress={() => handlePeriodChange('custom')}
          >
            <Text style={[styles.periodText, period === 'custom' && styles.activePeriodText]}>
              Custom
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, showPendingDuesOnly && styles.activePeriod]}
            onPress={handlePendingDuesTab}
          >
            <Text style={[styles.periodText, showPendingDuesOnly && styles.activePeriodText]}>
              Pending Dues
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {period === 'custom' && (
          <DateRangePicker
            onSelect={handleDateRangeChange}
            initialRange={dateRange}
          />
        )}
      </View>
      {/* Payments List Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          Recent Transactions
        </Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={handleExport}
        >
          <Download size={16} color={COLORS.white} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
      {/* Payments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              coutrycode={countryCode}
              onPress={() => router.push(`/payments/${item.id}`)}
            />
          )}
          onEndReached={() => {
            if (page < totalPages && !isFetchingMore && !isLoading) {
              loadPayments(page + 1, true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingMore ? <ActivityIndicator /> : null}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddPayment}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    ...SIZES.shadow,
  },
  statValue: {
    ...FONTS.h3,
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    ...FONTS.body4,
    color: COLORS.lightGray,
    marginBottom: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statBadgeText: {
    ...FONTS.caption,
    marginLeft: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  periodContainer: {
    paddingVertical: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    marginRight: 8,
    ...SIZES.shadow,
  },
  activePeriod: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    ...FONTS.body4,
    color: COLORS.white,
  },
  activePeriodText: {
    color: COLORS.white,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  listTitle: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  exportText: {
    ...FONTS.body4,
    color: COLORS.white,
    marginLeft: 4,
  },
  paymentsContainer: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.lightGray,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SIZES.shadow,
  },
});