import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import Header from '@/components/common/Header';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import MemberSelector from '@/components/members/MemberSelector';
import DatePicker from '@/components/common/DatePicker';
import { getPaymentById, updatePayment, deletePayment } from '@/data/paymentsService';

interface FormData {
  member_id: string;
  amount_paid: string;
  total_amount: string;
  payment_date: string;
  payment_method: string;
  notes: string;
}

interface FormErrors {
  member_id?: string;
  amount_paid?: string;
  total_amount?: string;
  payment_date?: string;
  payment_method?: string;
}

export default function EditPaymentScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<FormData>({
    member_id: '',
    amount_paid: '',
    total_amount: '',
    payment_date: new Date().toISOString(),
    payment_method: 'cash',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    try {
      const payment = await getPaymentById(id as string);
      setFormData({
        member_id: payment.member_id.toString(),
        amount_paid: payment.amount_paid.toString(),
        total_amount: payment.total_amount.toString(),
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        notes: payment.notes || ''
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load payment details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberSelect = (
    memberId: string | number,
    planAmount?: number,
    discountValue?: number,
    admissionFees?: number,
    planEndDate?: string,
    status?: 'active'|'inactive',
    memberPayments?: Array<any>
  ) => {
    setFormData(prev => ({ ...prev, member_id: memberId?.toString?.() ?? '' }));
    setErrors(prev => ({ ...prev, member_id: '' }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.member_id) {
      newErrors.member_id = 'Please select a member';
    }
    
    if (!formData.amount_paid) {
      newErrors.amount_paid = 'Amount paid is required';
    } else if (isNaN(Number(formData.amount_paid)) || Number(formData.amount_paid) <= 0) {
      newErrors.amount_paid = 'Please enter a valid amount';
    }
    
    if (!formData.total_amount) {
      newErrors.total_amount = 'Total amount is required';
    } else if (isNaN(Number(formData.total_amount)) || Number(formData.total_amount) <= 0) {
      newErrors.total_amount = 'Please enter a valid amount';
    }
    
    if (Number(formData.amount_paid) > Number(formData.total_amount)) {
      newErrors.amount_paid = 'Amount paid cannot be greater than total amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await updatePayment(id as string, {
        member_id: formData.member_id,
        amount_paid: Number(formData.amount_paid),
        total_amount: Number(formData.total_amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        notes: formData.notes
      });
      
      Alert.alert(
        'Success',
        'Payment updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update payment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePayment(id as string);
              Alert.alert(
                'Success',
                'Payment deleted successfully',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete payment');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <Header 
          title="Edit Payment"
          leftIcon={<ArrowLeft size={24} color={COLORS.white} />}
          onLeftPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <Header 
        title="Edit Payment"
        leftIcon={<ArrowLeft size={24} color={COLORS.white} />}
        onLeftPress={() => router.back()}
        rightIcon={<Trash2 size={24} color={COLORS.error} />}
        onRightPress={handleDelete}
      />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Details</Text>
            <MemberSelector
              selectedMemberId={formData.member_id}
              onSelect={handleMemberSelect}
              error={errors.member_id}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            
            <Input
              label="Total Amount"
              value={formData.total_amount}
              onChangeText={(value) => handleInputChange('total_amount', value)}
              keyboardType="numeric"
              error={errors.total_amount}
              placeholder="Enter total amount"
            />
            
            <Input
              label="Amount Paid"
              value={formData.amount_paid}
              onChangeText={(value) => handleInputChange('amount_paid', value)}
              keyboardType="numeric"
              error={errors.amount_paid}
              placeholder="Enter amount paid"
            />
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <DatePicker
                  label="Payment Date"
                  value={formData.payment_date}
                  onChange={(date) => handleInputChange('payment_date', date)}
                />
              </View>
              
              <View style={styles.halfWidth}>
                <Input
                  label="Payment Method"
                  value={formData.payment_method}
                  onChangeText={(value) => handleInputChange('payment_method', value)}
                  placeholder="Cash, Card, etc."
                />
              </View>
            </View>
            
            <Input
              label="Notes"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Add any additional notes"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSubmit}
          disabled={isSaving}
          loading={isSaving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    gap: 24,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    ...SIZES.shadow,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.white,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 