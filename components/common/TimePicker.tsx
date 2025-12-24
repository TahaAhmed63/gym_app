import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '@/constants/theme';
import { Clock } from 'lucide-react-native';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function TimePicker({ value, onChange, label, error, disabled }: TimePickerProps) {
  const [show, setShow] = useState(false);
  const [time, setTime] = useState(value ? new Date(`2000-01-01T${value}`) : new Date());

  const handleChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputError,
          disabled && styles.inputDisabled
        ]}
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
      >
        <Clock size={20} color={COLORS.lightGray} />
        <Text style={[styles.input, disabled && styles.textDisabled]}>
          {value ? formatTime(value) : 'Select time'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {show && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleChange}
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
    ...FONTS.body3,
    color: COLORS.white,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    ...FONTS.body3,
    color: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.surfaceLight,
    opacity: 0.9,
  },
  textDisabled: {
    color: COLORS.lightGray,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: 4,
  },
}); 