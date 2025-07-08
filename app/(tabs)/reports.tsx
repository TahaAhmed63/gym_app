import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import Header from '@/components/common/Header';
import { UserRound, Calendar, CreditCard, ArrowRight, Download, CircleAlert as AlertCircle, Cake, Clock } from 'lucide-react-native';
import { fetchExpiringMembers, fetchBirthdayMembers, downloadReport } from '@/data/reportsService';
import ReportCard from '@/components/reports/ReportCard';
import { useLoading } from '@/contexts/LoadingContext';

type TabType = 'expiry' | 'birthday';
type TimeframeType = '3days' | '7days' | '15days' | '30days';
type DownloadType = 'all' | 'active' | 'inactive' | 'partial';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob?: string;
  plan_end_date?: string;
  status: 'active' | 'inactive';
  photo?: string;
  plans?: {
    name: string;
    price: number;
  };
  days_remaining?: number;
  days_until_birthday?: number;
}

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('expiry');
  const [expiryTimeframe, setExpiryTimeframe] = useState<TimeframeType>('3days');
  const [reportData, setReportData] = useState<Member[]>([]);
  const { showLoading, hideLoading } = useLoading();
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    loadReportData(tab, tab === 'expiry' ? expiryTimeframe : '');
  };
  
  const handleExpiryTimeframeChange = (timeframe: TimeframeType) => {
    setExpiryTimeframe(timeframe);
    loadReportData('expiry', timeframe);
  };
  
  const loadReportData = async (type: TabType, timeframe: string = '') => {
    showLoading();
    
    try {
      let data;
      
      if (type === 'expiry') {
        data = await fetchExpiringMembers(timeframe);
        console.log('Fetched expiring members data:', data);
      } else if (type === 'birthday') {
        data = await fetchBirthdayMembers();
        console.log('Fetched birthday members data:', data);
      }

      setReportData(data || []);
      console.log('reportData after set:', data || []); // Add this line
    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'Failed to load report data. Please try again.');
    } finally {
      hideLoading();
    }
  };
  
  useEffect(() => {
    loadReportData(activeTab, activeTab === 'expiry' ? expiryTimeframe : '');
  }, []);
  
  const handleDownload = async (type: DownloadType | 'expiry' | 'birthday') => {
    showLoading();
    try {
      const downloadType = type === 'expiry' || type === 'birthday' ? 'active' : type;
      await downloadReport(downloadType);
      Alert.alert('Success', 'Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download report. Please try again.');
    } finally {
      hideLoading();
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Header title="Reports" />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expiry' && styles.activeTab]}
          onPress={() => handleTabChange('expiry')}
        >
          <Clock size={20} color={activeTab === 'expiry' ? COLORS.primary : COLORS.darkGray} />
          <Text style={[styles.tabText, activeTab === 'expiry' && styles.activeTabText]}>
            Expiry Reports
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'birthday' && styles.activeTab]}
          onPress={() => handleTabChange('birthday')}
        >
          <Cake size={20} color={activeTab === 'birthday' ? COLORS.primary : COLORS.darkGray} />
          <Text style={[styles.tabText, activeTab === 'birthday' && styles.activeTabText]}>
            Birthday Reports
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Expiry Timeframe Selector */}
      {activeTab === 'expiry' && (
        <View style={styles.timeframeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.timeframeButton, expiryTimeframe === '3days' && styles.activeTimeframe]}
              onPress={() => handleExpiryTimeframeChange('3days')}
            >
              <Text style={[
                styles.timeframeText, 
                expiryTimeframe === '3days' && styles.activeTimeframeText
              ]}>
                1-3 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeframeButton, expiryTimeframe === '7days' && styles.activeTimeframe]}
              onPress={() => handleExpiryTimeframeChange('7days')}
            >
              <Text style={[
                styles.timeframeText, 
                expiryTimeframe === '7days' && styles.activeTimeframeText
              ]}>
                4-7 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeframeButton, expiryTimeframe === '15days' && styles.activeTimeframe]}
              onPress={() => handleExpiryTimeframeChange('15days')}
            >
              <Text style={[
                styles.timeframeText, 
                expiryTimeframe === '15days' && styles.activeTimeframeText
              ]}>
                8-15 Days
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeframeButton, expiryTimeframe === '30days' && styles.activeTimeframe]}
              onPress={() => handleExpiryTimeframeChange('30days')}
            >
              <Text style={[
                styles.timeframeText, 
                expiryTimeframe === '30days' && styles.activeTimeframeText
              ]}>
                16-30 Days
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {/* Report Header */}
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>
          {activeTab === 'expiry' ? 'Expiring Memberships' : 'Upcoming Birthdays'}
        </Text>
        
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => handleDownload(activeTab === 'expiry' ? 'expiry' : 'birthday')}
        >
          <Download size={16} color={COLORS.primary} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
      
      {/* Report Content */}
      <ScrollView
        contentContainerStyle={styles.reportContainer}
        showsVerticalScrollIndicator={false}
      >
        {reportData.length > 0 ? (
          reportData.map(item => (
            <ReportCard 
              key={item.id.toString()}
              item={item}
              type={activeTab}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color={COLORS.darkGray} />
            <Text style={styles.emptyText}>
              {activeTab === 'expiry' 
                ? 'No expiring memberships found'
                : 'No upcoming birthdays found'
              }
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Download Reports Section */}
      <View style={styles.downloadSection}>
        <Text style={styles.downloadTitle}>Download Reports</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.downloadCard}
            onPress={() => handleDownload('all')}
          >
            <View style={[styles.downloadIcon, { backgroundColor: COLORS.primaryLight }]}>
              <UserRound size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.downloadLabel}>All Members</Text>
            <ArrowRight size={16} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.downloadCard}
            onPress={() => handleDownload('active')}
          >
            <View style={[styles.downloadIcon, { backgroundColor: COLORS.successLight }]}>
              <UserRound size={24} color={COLORS.success} />
            </View>
            <Text style={styles.downloadLabel}>Active Members</Text>
            <ArrowRight size={16} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.downloadCard}
            onPress={() => handleDownload('inactive')}
          >
            <View style={[styles.downloadIcon, { backgroundColor: COLORS.errorLight }]}>
              <UserRound size={24} color={COLORS.error} />
            </View>
            <Text style={styles.downloadLabel}>Inactive Members</Text>
            <ArrowRight size={16} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.downloadCard}
            onPress={() => handleDownload('partial')}
          >
            <View style={[styles.downloadIcon, { backgroundColor: COLORS.warningLight }]}>
              <CreditCard size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.downloadLabel}>Partial Payments</Text>
            <ArrowRight size={16} color={COLORS.darkGray} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginRight: 12,
    ...SIZES.shadow,
  },
  activeTab: {
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
  },
  timeframeContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timeframeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    ...SIZES.shadow,
  },
  activeTimeframe: {
    backgroundColor: COLORS.primary,
  },
  timeframeText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  activeTimeframeText: {
    color: COLORS.white,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  reportTitle: {
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
  reportContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginTop: 16,
    textAlign: 'center',
  },
  downloadSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  downloadTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 16,
  },
  downloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 160,
    ...SIZES.shadow,
  },
  downloadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  downloadLabel: {
    ...FONTS.body4,
    color: COLORS.black,
    flex: 1,
  },
});