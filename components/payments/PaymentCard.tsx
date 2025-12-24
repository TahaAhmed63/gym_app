import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Calendar, ChevronRight, User } from 'lucide-react-native';
import { formatCurrency } from '@/utils/currency';

interface PaymentCardProps {
  payment: {
    id: number;
    name?: string;
    members?: { name?: string };
    total_amount: number;
    amount_paid: number;
    due_amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    plan: string;
  };

  onPress: () => void;
  coutrycode:string
}

export default function PaymentCard({ payment, onPress,coutrycode }: PaymentCardProps) {
  console.log(payment ,"2025-05-23")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return COLORS.success;
      case 'partial':
        return COLORS.warning;
      case 'pending':
        return COLORS.error;
      default:
        return COLORS.darkGray;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.memberInfo}>
          <User size={16} color={COLORS.lightGray} />
          <Text style={styles.memberName}>{payment?.members?.name}</Text>
        </View>
        
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(payment?.due_amount > 0 ? 'pending' : 'paid') + '22' }
          ]}
        >
          <Text 
            style={[
              styles.statusText, 
              { color: getStatusColor(payment?.due_amount > 0 ? 'pending' : 'paid') }
            ]}
          >
            {payment?.due_amount > 0 ? 'Pending' : 'Paid'}
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View>
          <Text style={styles.amount}>{formatCurrency(payment.amount_paid || 0, coutrycode)}</Text>
          <Text style={styles.plan}>{payment.due_amount}</Text>
          
          <View style={styles.dateContainer}>
            <Calendar size={14} color={COLORS.lightGray} />
              <Text style={styles.date}>{formatDate(payment.payment_date)}</Text>
          </View>
        </View>
        
        <View style={styles.methodContainer}>
          <Text style={styles.methodLabel}>Method</Text>
            <Text style={styles.methodValue}>{payment.payment_method}</Text>
            <ChevronRight size={20} color={COLORS.lightGray} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SIZES.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    ...FONTS.caption,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    ...FONTS.h3,
    color: COLORS.white,
    marginBottom: 4,
  },
  plan: {
    ...FONTS.body4,
    color: COLORS.warning,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    ...FONTS.caption,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  methodContainer: {
    alignItems: 'center',
  },
  methodLabel: {
    ...FONTS.caption,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  methodValue: {
    ...FONTS.body4,
    color: COLORS.white,
    marginBottom: 4,
  },
});