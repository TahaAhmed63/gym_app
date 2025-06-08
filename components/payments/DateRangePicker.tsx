import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { Calendar } from 'lucide-react-native';
import Button from '@/components/common/Button';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  onSelect: (range: DateRange) => void;
  initialRange?: DateRange;
}

export default function DateRangePicker({ 
  onSelect, 
  initialRange = { startDate: null, endDate: null } 
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialRange.startDate);
  const [endDate, setEndDate] = useState<Date | null>(initialRange.endDate);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');
  
  // Mock current date for display purposes
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleStartDateSelect = () => {
    setSelectionMode('start');
    // In a real app, this would show a date picker
    // For this mock, we'll set it to 1 month ago
    setStartDate(lastMonth);
  };
  
  const handleEndDateSelect = () => {
    setSelectionMode('end');
    // In a real app, this would show a date picker
    // For this mock, we'll set it to today
    setEndDate(today);
  };
  
  const handleApply = () => {
    onSelect({ startDate, endDate });
  };
  
  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onSelect({ startDate: null, endDate: null });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date Range</Text>
      
      <View style={styles.dateSelectors}>
        <TouchableOpacity 
          style={[
            styles.dateSelector, 
            selectionMode === 'start' && styles.activeDateSelector
          ]}
          onPress={handleStartDateSelect}
        >
          <Text style={styles.dateSelectorLabel}>Start Date</Text>
          <View style={styles.dateValueContainer}>
            <Calendar size={16} color={COLORS.darkGray} />
            <Text 
              style={[
                styles.dateValue,
                !startDate && styles.placeholderText
              ]}
            >
              {formatDate(startDate)}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.dateSelector, 
            selectionMode === 'end' && styles.activeDateSelector
          ]}
          onPress={handleEndDateSelect}
        >
          <Text style={styles.dateSelectorLabel}>End Date</Text>
          <View style={styles.dateValueContainer}>
            <Calendar size={16} color={COLORS.darkGray} />
            <Text 
              style={[
                styles.dateValue,
                !endDate && styles.placeholderText
              ]}
            >
              {formatDate(endDate)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
        
        <Button
          title="Apply"
          onPress={handleApply}
          style={styles.applyButton}
          disabled={!startDate || !endDate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  title: {
    ...FONTS.body3,
    color: COLORS.black,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateSelector: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
  },
  activeDateSelector: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  dateSelectorLabel: {
    ...FONTS.caption,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  dateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValue: {
    ...FONTS.body4,
    color: COLORS.black,
    marginLeft: 8,
  },
  placeholderText: {
    color: COLORS.darkGray,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    padding: 12,
  },
  clearButtonText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  applyButton: {
    width: '40%',
  },
});