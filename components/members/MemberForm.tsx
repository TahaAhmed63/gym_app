import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Mail, Phone, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // Import FileSystem
import Button from '@/components/common/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBatches } from '@/data/BatchService';
import { formatCurrency } from '@/utils/currency';
import { COUNTRY_TO_CODE } from '../dashboard/DashboardChart';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall, handleApiError } from '@/utils/api';
import { useLoading } from '@/contexts/LoadingContext';

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
    status?: 'active' | 'inactive';
    photo?: string;
    emergency?: {
      name: string;
      phone: string;
      relationship: string;
    };
    joinDate?: string;
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
  status: 'active' | 'inactive';
  photo: string | null;
  emergency: {
    name: string;
    phone: string;
    relationship: string;
  };
  joinDate: string;
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
    status: initialData?.status || 'active',
    photo: initialData?.photo || null,
    emergency: {
      name: initialData?.emergency?.name || '',
      phone: initialData?.emergency?.phone || '',
      relationship: initialData?.emergency?.relationship || '',
    },
    joinDate: initialData?.joinDate
      ? new Date(initialData.joinDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  });
  const { user } = useAuth();

  const [displayDate, setDisplayDate] = useState(
    initialData?.dob ? new Date(initialData.dob).toLocaleDateString() : new Date().toLocaleDateString()
  );
  const [displayJoinDate, setDisplayJoinDate] = useState(
    initialData?.joinDate ? new Date(initialData.joinDate).toLocaleDateString() : new Date().toLocaleDateString()
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showJoinDatePicker, setShowJoinDatePicker] = useState(false);

  const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);
  const [batches, setBatches] = useState<Array<{ id: string; name: string; schedule_time: string }>>([]);
  const [errorBatches, setErrorBatches] = useState<string | null>(null);

  const { showLoading, hideLoading } = useLoading();

  const fetchData = async () => {
    showLoading();
    setLoadingPlans(true);
    setErrorPlans(null);
    setErrorBatches(null);

    try {
      // Fetch plans
      const access_token = await AsyncStorage.getItem('access_token');
      const response = await fetch('https://gymbackend-eight.vercel.app/api/plans', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch plans');
      }

      // Fetch batches
      try {
        const batchesData = await fetchBatches();
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setErrorBatches('Failed to load batches');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setErrorPlans('Failed to load plans');
    } finally {
      setLoadingPlans(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const countryCode = user?.country ? COUNTRY_TO_CODE[user.country] || 'US' : 'US';

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

  const handleJoinDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowJoinDatePicker(false);
    if (selectedDate) {
      // Format date to YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setDisplayJoinDate(selectedDate.toLocaleDateString());
      setFormData({ ...formData, joinDate: formattedDate });
    }
  };

  // Helper to get file info for FormData
  const getImageFileInfo = (uri: string) => {
    // Try to extract filename and type from uri
    let filename = uri.split('/').pop() || 'photo.jpg';
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    return { uri, name: filename, type };
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email || !formData.plan ) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Find the selected plan by id
      const selectedPlan = plans.find(p => p.id === formData.plan);
      if (!selectedPlan) {
        Alert.alert('Error', 'Please select a valid plan');
        return;
      }

      // Find the selected batch by id
      const selectedBatch = batches.find(b => b?.id === formData.batch);
      // // if (!selectedBatch) {
      // //   Alert.alert('Error', 'Please select a valid batch');
      // //   return;
      // }

      const memberData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address || "test",
        batch_id: selectedBatch?.id,
        plan_id: selectedPlan.id,
        status: formData.status,
        joinDate: formData.joinDate,
        photo: formData.photo,
      };

      onSubmit(memberData);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', error?.message || 'Failed to submit form');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true, // Request base64 data
    });

    if (!result.canceled) {
      const base64Image = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
      setFormData({ ...formData, photo: base64Image });
    }
  };

  return (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
          {formData.photo ? (
            <Image source={{ uri: formData.photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
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

        {/* Join Date Picker */}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowJoinDatePicker(true)}
        >
          <Calendar size={20} color={COLORS.darkGray} />
          <Text style={[styles.input, { marginLeft: 12 }]}>
            {displayJoinDate}
          </Text>
          <Text style={{ marginLeft: 8, color: COLORS.darkGray, ...FONTS.body4 }}>
            (Join Date)
          </Text>
        </TouchableOpacity>

        {showJoinDatePicker && (
          <DateTimePicker
            value={new Date(formData.joinDate)}
            mode="date"
            display="default"
            onChange={handleJoinDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Member Status</Text>
          <View style={styles.statusToggle}>
            <Text style={[
              styles.statusText,
              formData.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
            ]}>
              {formData.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
            <Switch
              value={formData.status === 'active'}
              onValueChange={(value) => setFormData({
                ...formData,
                status: value ? 'active' : 'inactive'
              })}
              trackColor={{ false: COLORS.errorLight, true: COLORS.successLight }}
              thumbColor={formData.status === 'active' ? COLORS.success : COLORS.error}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Details</Text>

        <View style={styles.row}>
          <View style={styles.pickerContainer}>
            {loadingPlans ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : errorPlans ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorPlans}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setLoadingPlans(true);
                    setErrorPlans(null);
                    fetchData();
                  }}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Picker
                selectedValue={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
                style={styles.picker}
                dropdownIconColor={COLORS.primary}
                mode="dropdown"
              >
                <Picker.Item
                  label="Select a plan"
                  value=""
                  color={COLORS.darkGray}
                />
                {plans.map((plan) => (
                  <Picker.Item
                    key={plan.id}
                    label={`${plan.name} - ${formatCurrency(plan.price || 0, countryCode)}/month`}
                    value={plan.id}
                    color={COLORS.black}
                  />
                ))}
              </Picker>
            )}
          </View>
        </View>

        <View style={styles.row}>
          {errorBatches ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorBatches}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setErrorBatches(null);
                  fetchBatches().then(setBatches).catch(() => setErrorBatches('Failed to load batches'));
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            batches.map((batch) => (
              <TouchableOpacity
                key={batch.id}
                style={[
                  styles.batchButton,
                  formData.batch === batch.id && styles.selectedBatch
                ]}
                onPress={() => setFormData({ ...formData, batch: batch.id })}
              >
                <Text
                  style={[
                    styles.batchText,
                    formData.batch === batch.id && styles.selectedBatchText
                  ]}
                >
                  {batch.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      <Button
        title="Save Member"
        onPress={handleSubmit}
        loading={isLoading}
        style={{ marginTop: 24, marginBottom: 24 }}
        disabled={loadingPlans || !!errorPlans || !!errorBatches}
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  statusLabel: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...FONTS.body4,
    marginRight: 8,
  },
  activeStatusText: {
    color: COLORS.success,
  },
  inactiveStatusText: {
    color: COLORS.error,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 16,
  },
  picker: {
    width: '100%',
    height: 56,
    color: COLORS.black,
  },
  loadingContainer: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  loadingText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    ...FONTS.body4,
    color: COLORS.error,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
  },
  retryText: {
    ...FONTS.body4,
    color: COLORS.white,
  },
});