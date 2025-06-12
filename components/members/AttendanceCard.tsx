import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { Clock, LogIn, LogOut } from 'lucide-react-native';

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string | null;
}

interface AttendanceCardProps {
  record: AttendanceRecord;
}

export default function AttendanceCard({ record }: AttendanceCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Clock size={16} color={COLORS.darkGray} />
        <Text style={styles.date}>{formatDate(record.date)}</Text>
      </View>
      
      <View style={styles.timesContainer}>
        <View style={styles.timeBlock}>
          <View style={styles.timeIcon}>
            <LogIn size={14} color={COLORS.success} />
          </View>
          <View>
            <Text style={styles.timeLabel}>Check In</Text>
            <Text style={styles.timeValue}>{formatTime(record.checkIn)}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.timeBlock}>
          <View style={styles.timeIcon}>
            <LogOut size={14} color={record.checkOut ? COLORS.error : COLORS.gray} />
          </View>
          <View>
            <Text style={styles.timeLabel}>Check Out</Text>
            <Text 
              style={[
                styles.timeValue, 
                !record.checkOut && styles.pendingTime
              ]}
            >
              {formatTime(record.checkOut)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeLabel: {
    ...FONTS.caption,
    color: COLORS.darkGray,
  },
  timeValue: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  pendingTime: {
    color: COLORS.gray,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
});