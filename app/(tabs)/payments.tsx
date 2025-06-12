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
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const {user}=useAuth()
  const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'custom'
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const countryCode = user?.country ? COUNTRY_TO_CODE[user.country] || 'US' : 'US';
  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPayments(period, dateRange);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadStats = async () => {
    setIsStatsLoading(true);
    try {
      const data = await fetchPaymentStats(period, dateRange);
      setStats(data);
    } catch (error) {
      console.error('Error loading payment stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };
  
  useEffect(() => {
    loadStats();
    loadPayments();
  }, [period, dateRange]);
  
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };
  
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setPeriod('custom');
  };
  
  const handleAddPayment = () => {
    router.push('/payments/add');
  };

  const handleExport = async () => {
    try {
      const blob = await exportPaymentsToExcel(period, dateRange);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        // Save file
        const fileUri = `${FileSystem.documentDirectory}payments_export.xlsx`;
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Share file
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

const totalCollectedCalculation=()=>{
  const totalCollected=payments.reduce((acc,payment)=>acc+payment.amount_paid,0)
  return totalCollected
}
const totalPendingCalculation=()=>{
  const totalPending=payments.reduce((acc,payment)=>acc+payment.due_amount,0)
  return totalPending
}
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Header title="Payments" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {isStatsLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <View style={styles.statCard}>
                
                <Text style={styles.statValue}>{formatCurrency(totalCollectedCalculation()|| 0, countryCode)} </Text>
                <Text style={styles.statLabel}>Total Collected</Text>
                <View style={[styles.statBadge, { backgroundColor: COLORS.successLight }]}>
                  <ArrowUp size={12} color={COLORS.success} />
                  <Text style={[styles.statBadgeText, { color: COLORS.success }]}>
                    {stats?.collectionRate || 0}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency(totalPendingCalculation()|| 0, countryCode)}</Text>
                <Text style={styles.statLabel}>Pending Dues</Text>
                <View style={[styles.statBadge, { backgroundColor: COLORS.errorLight }]}>
                  <ArrowDown size={12} color={COLORS.error} />
                  <Text style={[styles.statBadgeText, { color: COLORS.error }]}>
                    {stats?.pendingRate || 0}%
                  </Text>
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
              style={[styles.periodButton, period === 'year' && styles.activePeriod]}
              onPress={() => handlePeriodChange('year')}
            >
              <Text style={[styles.periodText, period === 'year' && styles.activePeriodText]}>
                This Year
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.periodButton, period === 'custom' && styles.activePeriod]}
              onPress={() => setPeriod('custom')}
            >
              <Text style={[styles.periodText, period === 'custom' && styles.activePeriodText]}>
                Custom
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
            <Download size={16} color={COLORS.primary} />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
        
        {/* Payments List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.paymentsContainer}>
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id.toString()}
                coutrycode={countryCode}
                payment={payment}
                onPress={() => router.push(`/payments/${payment.id}`)}
              />
            ))}
            
            {payments.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No payments found for this period</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
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
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    ...SIZES.shadow,
  },
  statValue: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    ...FONTS.body4,
    color: COLORS.darkGray,
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
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: 8,
    ...SIZES.shadow,
  },
  activePeriod: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
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
    color: COLORS.black,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  exportText: {
    ...FONTS.body4,
    color: COLORS.primary,
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
    color: COLORS.darkGray,
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