import { useState, useContext } from 'react';
    import { 
      View, 
      Text, 
      StyleSheet, 
      ScrollView, 
      Alert
    } from 'react-native';
    import { SafeAreaView } from 'react-native-safe-area-context';
    import { StatusBar } from 'expo-status-bar';
    import { router } from 'expo-router';
    import { COLORS, FONTS, SIZES } from '@/constants/theme';
    import { ArrowLeft } from 'lucide-react-native';
    import Header from '@/components/common/Header';
    import Input from '@/components/common/Input';
    import Button from '@/components/common/Button';
    import MemberSelector from '@/components/members/MemberSelector';
    import DatePicker from '@/components/common/DatePicker';
    import { createPayment } from '@/data/paymentsService';
    import { AuthContext } from '@/contexts/AuthContext';

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

    export default function AddPaymentScreen() {
      const { user } = useContext(AuthContext) as any;
      const hasPermission = (perm: string) => {
        if (user?.role === 'admin') return true;
        if (user?.role === 'staff' && user?.staff?.permissions) {
          return user.staff.permissions.includes(perm);
        }
        return false;
      };
      if (!hasPermission('manage_payments')) return null;

      const [formData, setFormData] = useState<FormData>({
        member_id: '',
        amount_paid: '',
        total_amount: '',
        payment_date: new Date().toISOString(),
        payment_method: 'cash',
        notes: '',
      });
      const [isLoading, setIsLoading] = useState(false);
      const [errors, setErrors] = useState<FormErrors>({});
      const [isPaymentDue, setIsPaymentDue] = useState(false);
      const [noPaymentDueMessage, setNoPaymentDueMessage] = useState('');

      const handleMemberSelect = (
        memberId: string | null | undefined,
        planAmount?: number,
        discountValue?: number,
        admissionFees?: number,
        planEndDate?: string,
        status?: 'active' | 'inactive',
        memberPayments?: Array<{ due_amount: number, notes?: string, payment_date?: string }>
      ) => {
        const calculatedTotal = (planAmount || 0) - (discountValue || 0);
        setFormData(prev => ({
          ...prev,
          member_id: memberId ?? '',
          total_amount: calculatedTotal.toString(),
        }));
        setErrors(prev => ({ ...prev, member_id: '' }));

        if (memberId) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const memberPlanEndDate = planEndDate ? new Date(planEndDate) : null;
          memberPlanEndDate?.setHours(0, 0, 0, 0);

          let duesExist = false;
          if (memberPayments) {
            const planPayments = memberPayments.filter(p => p.notes !== 'Admission Fee');
            const latestPlanPayment = planPayments.sort((a, b) => {
              const at = a.payment_date ? new Date(a.payment_date).getTime() : 0;
              const bt = b.payment_date ? new Date(b.payment_date).getTime() : 0;
              return bt - at;
            })[0];
            if (latestPlanPayment && latestPlanPayment.due_amount > 0) {
              duesExist = true;
            }
          }

          const isExpired = memberPlanEndDate ? memberPlanEndDate < today : true; // Assume expired if no end date
          const isActive = status === 'active';

          if (isExpired || duesExist) {
            setIsPaymentDue(true);
            setNoPaymentDueMessage('');
          } else if (isActive) {
            setIsPaymentDue(false);
            setNoPaymentDueMessage('Member\'s current plan is active and fully paid. No payment is due.');
          } else {
            setIsPaymentDue(false);
            setNoPaymentDueMessage('Member is inactive and has no outstanding dues.');
          }
        } else {
          setIsPaymentDue(false);
          setNoPaymentDueMessage('');
        }
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
        
        setIsLoading(true);
        try {
          await createPayment({
            member_id: formData.member_id || '', // Ensure member_id is an empty string if falsy
            amount_paid: Number(formData.amount_paid),
            total_amount: Number(formData.total_amount),
            due_amount: Number(formData.total_amount) - Number(formData.amount_paid), // Calculate due_amount
            payment_date: new Date(formData.payment_date).toISOString().split('T')[0],
            payment_method: formData.payment_method,
            notes: formData.notes
          });
          
          Alert.alert(
            'Success',
            'Payment recorded successfully',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } catch (error: any) {
        
          Alert.alert('Error', error.message || 'Failed to record payment');
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar style="light" />
            <Header 
              title="Add Payment"
              leftIcon={<ArrowLeft size={24} color={COLORS.white} />}
              onLeftPress={() => router.back()}
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
                  memberplaneamount={undefined}
                />
                {!isPaymentDue && noPaymentDueMessage && (
                  <View style={styles.infoMessageContainer}>
                    <Text style={styles.infoMessageText}>{noPaymentDueMessage}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                
                <Input
                  label="Total Amount"
                  value={formData.total_amount}
                  onChangeText={(value) => handleInputChange('total_amount', value)}
                  keyboardType="numeric"
                  defaultValue={formData.total_amount}
                  error={errors.total_amount}
                  placeholder="Enter total amount"
                  editable={isPaymentDue}
                />
                
                <Input
                  label="Amount Paid"
                  value={formData.amount_paid}
                  onChangeText={(value) => handleInputChange('amount_paid', value)}
                  keyboardType="numeric"
                  error={errors.amount_paid}
                  placeholder="Enter amount paid"
                  editable={isPaymentDue}
                />
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <DatePicker
                      label="Payment Date"
                      value={formData.payment_date}
                      onChange={(date) => handleInputChange('payment_date', date)}
                      disabled={!isPaymentDue}
                    />
                  </View>
                  
                  <View style={styles.halfWidth}>
                    <Input
                      label="Payment Method"
                      value={formData.payment_method}
                      onChangeText={(value) => handleInputChange('payment_method', value)}
                      placeholder="Cash, Card, etc."
                      editable={isPaymentDue}
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
                  editable={isPaymentDue}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title={isLoading ? 'Recording...' : 'Record Payment'}
              onPress={handleSubmit}
              disabled={isLoading || !isPaymentDue} // Disable if not due
              loading={isLoading}
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
        zIndex:0,
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
      infoMessageContainer: {
        backgroundColor: COLORS.infoLight,
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        alignItems: 'center',
      },
      infoMessageText: {
        ...FONTS.body4,
        color: COLORS.info,
        textAlign: 'center',
      },
    });