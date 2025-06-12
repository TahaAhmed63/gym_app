    import { useState } from 'react';
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

    interface FormData {
      member_id: string;
      amount_paid: string;
      total_amount: string;
      payment_date: string;
      payment_method: string;
      notes: string;
      memberplaneamount?: number;
    }

    interface FormErrors {
      member_id?: string;
      amount_paid?: string;
      total_amount?: string;
      payment_date?: string;
      payment_method?: string;
    }

    export default function AddPaymentScreen() {
      const [formData, setFormData] = useState<FormData>({
        member_id: '',
        amount_paid: '',
        total_amount: '',
        payment_date: new Date().toISOString(),
        payment_method: 'cash',
        notes: '',
        memberplaneamount: undefined
      });
      const [isLoading, setIsLoading] = useState(false);
      const [errors, setErrors] = useState<FormErrors>({});

      const handleMemberSelect = (memberId: number, planAmount?: number) => {
        setFormData(prev => ({ 
          ...prev, 
          member_id: memberId.toString(),
          total_amount: planAmount?.toString() || '',
          memberplaneamount: planAmount || 0
        }));
        console.log(formData,"paymentdate")
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
        
        setIsLoading(true);
        try {
          await createPayment({
            member_id: String(formData.member_id),
            amount_paid: Number(formData.amount_paid),
            total_amount: Number(formData.total_amount),
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
          <StatusBar style="dark" />
          <Header 
            title="Add Payment"
            leftIcon={<ArrowLeft size={24} color={COLORS.black} />}
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
                  memberplaneamount={formData.memberplaneamount}
                />
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
              title={isLoading ? 'Recording...' : 'Record Payment'}
              onPress={handleSubmit}
              disabled={isLoading}
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
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        zIndex:0,
        ...SIZES.shadow,
      },
      sectionTitle: {
        ...FONTS.h4,
        color: COLORS.black,
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
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
      },
    }); 