import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '@/constants/theme';
import { Calendar } from 'lucide-react-native';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
  disabled?: boolean; // Add disabled prop
}

export default function DatePicker({ label, value, onChange, error, disabled }: DatePickerProps) {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate.toISOString());
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShow(true)}
        disabled={disabled} // Apply disabled prop to TouchableOpacity
      >
        <View style={styles.dateContainer}>
          <Calendar size={16} color={COLORS.lightGray} />
          <Text style={styles.dateText}>
            {value ? formatDate(value) : 'Select date'}
          </Text>
        </View>
      </TouchableOpacity>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...FONTS.body4,
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 12,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: 8,
  },
  error: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: 4,
  },
}); 