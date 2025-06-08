import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Mail, Phone, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/common/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBatches } from '@/data/BatchService';

interface MemberFormProps {
  initialData?: {
    name: string;
    phone: string;
    email: string;
    dob: string;
    gender: string;
    address: string;
    batch: string;
    plan: string;
    photo?: string;
    emergency?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  batch: string;
  plan: string;
  photo: string | null;
  emergency: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function MemberForm({ initialData, onSubmit, isLoading }: MemberFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    dob: initialData?.dob ? new Date(initialData.dob).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    gender: initialData?.gender || 'male',
    address: initialData?.address || '',
    batch: initialData?.batch || '',
    plan: initialData?.plan || '',
    photo: initialData?.photo || null,
    emergency: {
      name: initialData?.emergency?.name || '',
      phone: initialData?.emergency?.phone || '',
      relationship: initialData?.emergency?.relationship || '',
    },
  });

  const [displayDate, setDisplayDate] = useState(
    initialData?.dob ? new Date(initialData.dob).toLocaleDateString() : new Date().toLocaleDateString()
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
const [batches, setBatches] = useState<Array<{id: string; name: string; schedule_time: string}>>([]);
  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      const access_token = await AsyncStorage.getItem('access_token');
      try {
        const response = await fetch('https://gymbackend-nfa0.onrender.com/api/plans', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setPlans(data.data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        Alert.alert('Error', 'Failed to fetch plans');
      } finally {
        setLoadingPlans(false);
      }
    };
     fetchBatches().then((batches)=>{
      setBatches(batches)
     })
    fetchPlans();
  }, []);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Ensure the date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateNoTime = new Date(selectedDate);
      selectedDateNoTime.setHours(0, 0, 0, 0);

      if (selectedDateNoTime > today) {
        Alert.alert('Error', 'Date of birth cannot be in the future');
        return;
      }
      
      // Format date to YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setDisplayDate(selectedDate.toLocaleDateString());
      setFormData({ ...formData, dob: formattedDate });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email || !formData.plan || !formData.batch) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Find the selected plan
      const selectedPlan = plans.find(p => p.name.toLowerCase() === formData.plan.toLowerCase());
      if (!selectedPlan) {
        Alert.alert('Error', 'Please select a valid plan');
        return;
      }

      const memberData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
        address: "test",
        batch_id: formData.batch,
        plan_id: selectedPlan.id,
        status: 'active'
      };

      onSubmit(memberData);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photo: result.assets[0].uri });
    }
  };

  return (
    <ScrollView 
      style={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
          {formData.photo ? (
            <Image source={{ uri: formData.photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View> */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputContainer}>
          <User size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={COLORS.darkGray} />
          <Text style={[styles.input, { marginLeft: 12 }]}>
            {displayDate}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.dob)}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Details</Text>
        
        <View style={styles.row}>
          {plans.map((plan) => (
            <TouchableOpacity 
              key={plan.id}
              style={[
                styles.planButton,
                formData.plan === plan.name.toLowerCase() && styles.selectedPlan
              ]}
              onPress={() => setFormData({ ...formData, plan: plan.name.toLowerCase() })}
            >
              <Text 
                style={[
                  styles.planText,
                  formData.plan === plan.name.toLowerCase() && styles.selectedPlanText
                ]}
              >
                {plan.name}
              </Text>
              <Text 
                style={[
                  styles.planPrice,
                  formData.plan === plan.name.toLowerCase() && styles.selectedPlanText
                ]}
              >
                ₹{plan.price}/month
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          {batches.map((batch) => (
            <TouchableOpacity 
              key={batch.id}
              style={[
                styles.batchButton,
                formData.batch === batch.name.toLowerCase() && styles.selectedBatch
              ]}
              onPress={() => setFormData({ ...formData, batch: batch.id })}
            >
              <Text 
                style={[
                  styles.batchText,
                  formData.batch === batch.name.toLowerCase() && styles.selectedBatchText
                ]}
              >
                {batch.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button
        title="Add Member"
        onPress={handleSubmit}
        isLoading={isLoading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    photoSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: COLORS.white,
        marginBottom: 16,
        ...SIZES.shadow,
      },
      photoUpload: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
      },
      photoPreview: {
        width: '100%',
        height: '100%',
      },
      photoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
      },
      photoPlaceholderText: {
        ...FONTS.body4,
        color: COLORS.darkGray,
        textAlign: 'center',
      },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.lightGray,
    },
    headerTitle: {
      ...FONTS.h3,
      color: COLORS.black,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
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
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      ...FONTS.body3,
      marginLeft: 12,
      color: COLORS.black,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    planButton: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      alignItems: 'center',
    },
    selectedPlan: {
      backgroundColor: COLORS.primaryLight,
      borderColor: COLORS.primary,
    },
    planText: {
      ...FONTS.body3,
      color: COLORS.black,
      marginBottom: 4,
    },
    planPrice: {
      ...FONTS.body4,
      color: COLORS.darkGray,
    },
    selectedPlanText: {
      color: COLORS.primary,
      fontFamily: 'Inter-SemiBold',
    },
    batchButton: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      alignItems: 'center',
    },
    selectedBatch: {
      backgroundColor: COLORS.primaryLight,
      borderColor: COLORS.primary,
    },
    batchText: {
      ...FONTS.body4,
      color: COLORS.black,
    },
    selectedBatchText: {
      color: COLORS.primary,
      fontFamily: 'Inter-SemiBold',
    },
    submitButton: {
      marginTop: 8,
      marginBottom: 24,
    },
  });