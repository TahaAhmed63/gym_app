import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, Users, User } from 'lucide-react-native';
import Button from '@/components/common/Button';
import Header from '@/components/common/Header';
import TimePicker from '@/components/common/TimePicker';
import { z } from 'zod';
import { formatValidationErrors, ValidationErrors } from '@/utils/validation';
import { createBatch } from '@/data/BatchService';

// Batch validation schema
const batchSchema = z.object({
  name: z.string()
    .min(2, 'Batch name must be at least 2 characters')
    .max(50, 'Batch name must be less than 50 characters'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format'),
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}`);
  const end = new Date(`2000-01-01T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export default function CreateBatchScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
  });

  const validateForm = () => {
    try {
      batchSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatValidationErrors(error));
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }

    setIsLoading(true);
    try {
      // Format the schedule time as required by the API
      const scheduleTime = `${formData.startTime}-${formData.endTime}`;
      
      // Call the createBatch API
      await createBatch({
        name: formData.name,
        schedule_time: scheduleTime,
      });

      Alert.alert('Success', 'Batch created successfully');
      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'Failed to create batch. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Header 
        title="Create Batch"
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
            <Text style={styles.sectionTitle}>Batch Information</Text>
            
            <View style={styles.inputContainer}>
              <Users size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                placeholder="Batch Name"
                value={formData.name}
                onChangeText={(value: string) => setFormData(prev => ({ ...prev, name: value }))}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TimePicker
              label="Start Time"
              value={formData.startTime}
              onChange={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
              error={errors.startTime}
            />

            <TimePicker
              label="End Time"
              value={formData.endTime}
              onChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
              error={errors.endTime}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={isLoading ? 'Creating...' : 'Create Batch'}
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
    ...SIZES.shadow,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    ...FONTS.body3,
    color: COLORS.black,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: -12,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
}); 