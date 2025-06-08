import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, MessageSquare, CreditCard as Edit2, Calendar, MoveVertical as MoreVertical, Clock, CreditCard, Dumbbell, User, Trash2 } from 'lucide-react-native';
import { fetchMemberById, deleteMember } from '@/data/membersService';
import AttendanceCard from '@/components/members/AttendanceCard';
import { getMemberPayments } from '@/data/paymentsService';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams();
  const [member, setMember] = useState(null);
  const [MemberPayments, setMemberPayments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const loadMember = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await fetchMemberById(id);
        setMember(data);
      } catch (error) {
        console.error('Error loading member:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMember();
  }, [id]);

  useEffect(() => {
    const loadpayment = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await getMemberPayments(id);
        setMemberPayments(data);
      } catch (error) {
        console.error('Error loading member:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadpayment();
  }, [id]);
console.log(MemberPayments,"loadpayment")
  const handleCall = () => {
    if (!member?.phone) return;
    
    const phoneNumber = Platform.OS === 'android' ? `tel:${member.phone}` : `telprompt:${member.phone}`;
    Linking.openURL(phoneNumber);
  };

  const handleWhatsApp = () => {
    if (!member?.phone) return;
    
    Linking.openURL(`https://wa.me/${member.phone}`);
  };

  const handleEdit = () => {
    router.push(`/members/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Member',
      'Are you sure you want to delete this member? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMember(id as string);
              Alert.alert('Success', 'Member deleted successfully');
              router.replace('/members');
            } catch (error) {
              console.error('Error deleting member:', error);
              Alert.alert('Error', 'Failed to delete member');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Member not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Member Details</Text>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={handleDelete}
        >
          <Trash2 size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileInitials}>
            {member.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberStatus}>
          {member.status === 'active' ? 'Active' : 'Inactive'}
        </Text>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCall}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.successLight }]}>
              <Phone size={20} color={COLORS.success} />
            </View>
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleWhatsApp}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.successLight }]}>
              <MessageSquare size={20} color={COLORS.success} />
            </View>
            <Text style={styles.actionText}>WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEdit}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Edit2 size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <User size={18} color={activeTab === 'info' ? COLORS.primary : COLORS.darkGray} />
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Info
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <CreditCard size={18} color={activeTab === 'payments' ? COLORS.primary : COLORS.darkGray} />
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Payments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
          onPress={() => setActiveTab('attendance')}
        >
          <Calendar size={18} color={activeTab === 'attendance' ? COLORS.primary : COLORS.darkGray} />
          <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
            Attendance
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'info' && (
          <View style={styles.infoContainer}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{member.phone}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{member.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{formatDate(member.dob)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{member.gender}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{member.address}</Text>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Membership Details</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member ID</Text>
                <Text style={styles.infoValue}>#{member.id}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Batch</Text>
                <View style={styles.batchContainer}>
                  <Text style={styles.batchText}>{member.batch}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plan</Text>
                <View style={styles.planContainer}>
                  <Dumbbell size={16} color={COLORS.white} />
                  <Text style={styles.planText}>{member.plans.name}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Start Date</Text>
                <Text style={styles.infoValue}>{formatDate(member.join_date)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expiry Date</Text>
                <View style={styles.expiryContainer}>
                  <Clock size={16} color={member.status === 'active' ? COLORS.success : COLORS.error} />
                  <Text 
                    style={[
                      styles.expiryText, 
                      { color: member.status === 'active' ? COLORS.success : COLORS.error }
                    ]}
                  >
                    {formatDate(member.expiryDate)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{member.emergency?.name || 'Not provided'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{member.emergency?.phone || 'Not provided'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Relationship</Text>
                <Text style={styles.infoValue}>{member.emergency?.relationship || 'Not provided'}</Text>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'payments' && (
          <View style={styles.paymentContainer}>
            {MemberPayments && MemberPayments.length > 0 ? (
             MemberPayments.map((payment, index) => (
                <View key={index} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.paymentDate}>{formatDate(payment.payment_date)}</Text>
                    <Text 
                      style={[
                        styles.paymentStatus, 
                        { color: payment.due_amount === 0 ? COLORS.success : COLORS.warning }
                      ]}
                    >
                      {payment.due_amount === 0  ? 'Paid' : 'Partial'}
                    </Text>
                  </View>
                  
                  <View style={styles.paymentDetails}>
                    <View>
                      <Text style={styles.paymentPlan}>RS {payment.total_amount}</Text>
                      <Text style={styles.paymentPeriod}>{payment.period}</Text>
                    </View>
                    
                    <View style={styles.paymentAmounts}>
                      <Text style={styles.paymentAmount}>₹{payment.amount_paid}</Text>
                      {payment.due_amount !== 0  && (
                        <Text style={styles.paymentDue}>Due: ₹{payment.due_amount}</Text>
                      )}
                    </View>
                  </View>
                  
                  {payment.due_amount !== 0 && (
                    <TouchableOpacity 
                      style={styles.payButton}
                      onPress={() => router.push(`/payments/${payment.id}`)}
                    >
                      <Text style={styles.payButtonText}>Pay Balance</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No payment records found</Text>
              </View>
            )}
          </View>
        )}
        
        {activeTab === 'attendance' && (
          <View style={styles.attendanceContainer}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.sectionTitle}>Recent Attendance</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {member.attendance && member.attendance.length > 0 ? (
              member.attendance.map((record, index) => (
                <AttendanceCard key={index} record={record} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No attendance records found</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.checkInButton}>
              <Text style={styles.checkInButtonText}>Check-In Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  errorText: {
    ...FONTS.h3,
    color: COLORS.error,
    marginBottom: 20,
  },
  backButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitials: {
    ...FONTS.h2,
    color: COLORS.primary,
  },
  memberName: {
    ...FONTS.h3,
    color: COLORS.white,
    marginBottom: 4,
  },
  memberStatus: {
    ...FONTS.body4,
    color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    ...FONTS.body4,
    color: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    ...SIZES.shadow,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  infoContainer: {
    padding: 16,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SIZES.shadow,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  infoValue: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  batchContainer: {
    backgroundColor: COLORS.infoLight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  batchText: {
    ...FONTS.body4,
    color: COLORS.info,
  },
  planContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  planText: {
    ...FONTS.body4,
    color: COLORS.white,
    marginLeft: 4,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    ...FONTS.body3,
    marginLeft: 4,
  },
  paymentContainer: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SIZES.shadow,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentDate: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  paymentStatus: {
    ...FONTS.body4,
    fontFamily: 'Inter-SemiBold',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentPlan: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  paymentPeriod: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  paymentAmounts: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  paymentDue: {
    ...FONTS.body4,
    color: COLORS.error,
  },
  payButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    ...FONTS.body4,
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },
  attendanceContainer: {
    padding: 16,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  checkInButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  checkInButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontFamily: 'Inter-SemiBold',
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    ...SIZES.shadow,
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
});