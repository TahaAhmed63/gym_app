import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, Switch, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Mail, Phone, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
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
    batch?: string | null;
    plan?: string | null;
    status?: 'active' | 'inactive';
    photo?: string;
    emergency?: {
      name: string;
      phone: string;
      relationship: string;
    };
    joinDate?: string;
    join_date?: string;
    discount_value?: number;
    admission_fees?: number;
    amount_paid?: number;
    plan_id?: string;
    batch_id?: string | null;
    plans?: { id: string; name: string; price: number };
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
  discount_value: string;
  admission_fees: string;
  amount_paid: string;
}

export default function MemberForm({ initialData, onSubmit, isLoading }: MemberFormProps) {
  // Determine joinDate and plan for edit mode
  const isUpdate = !!initialData;
  // Use join_date if present, else joinDate, else today
  const initialJoinDateRaw =
    (initialData?.join_date || initialData?.joinDate) ??
    new Date().toISOString().split('T')[0];
  // Always keep joinDate as YYYY-MM-DD
  const initialJoinDate = initialJoinDateRaw
    ? new Date(initialJoinDateRaw).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // For plan, prefer plan_id, else plan, else plans.id, else ''
  let initialPlan = '';
  if (initialData?.plan_id) {
    initialPlan = initialData.plan_id;
  } else if (initialData?.plan) {
    initialPlan = initialData.plan;
  } else if (initialData?.plans?.id) {
    initialPlan = initialData.plans.id;
  }

  // For batch, prefer batch_id, else batch, else ''
  let initialBatch = '';
  if (initialData?.batch_id) {
    initialBatch = initialData.batch_id;
  } else if (initialData?.batch) {
    initialBatch = initialData.batch;
  }

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    dob: initialData?.dob
      ? new Date(initialData.dob).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    gender: initialData?.gender || 'male',
    address: initialData?.address || '',
    batch: initialBatch,
    plan: initialPlan,
    status: initialData?.status || 'active',
    photo: initialData?.photo || null,
    emergency: {
      name: initialData?.emergency?.name || '',
      phone: initialData?.emergency?.phone || '',
      relationship: initialData?.emergency?.relationship || '',
    },
    joinDate: initialJoinDate,
    discount_value: initialData?.discount_value !== undefined && initialData?.discount_value !== null
      ? initialData.discount_value.toString()
      : '',
    admission_fees: initialData?.admission_fees !== undefined && initialData?.admission_fees !== null
      ? initialData.admission_fees.toString()
      : '',
    amount_paid: initialData?.amount_paid !== undefined && initialData?.amount_paid !== null
      ? initialData.amount_paid.toString()
      : '',
  });

  const { user } = useAuth();

  // For displaying the join date in a user-friendly format
  const [displayDate, setDisplayDate] = useState(
    initialData?.dob ? new Date(initialData.dob).toLocaleDateString() : new Date().toLocaleDateString()
  );
  // For join date, use join_date or joinDate from initialData
  const [displayJoinDate, setDisplayJoinDate] = useState(
    (initialData?.join_date || initialData?.joinDate)
      ? new Date(initialData?.join_date || initialData?.joinDate as string).toLocaleDateString()
      : new Date().toLocaleDateString()
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showJoinDatePicker, setShowJoinDatePicker] = useState(false);
  const [showImageSourceOptions, setShowImageSourceOptions] = useState(false);

  const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);
  const [batches, setBatches] = useState<Array<{ id: string; name: string; schedule_time: string }>>([]);
  const [errorBatches, setErrorBatches] = useState<string | null>(null);

  const { showLoading, hideLoading } = useLoading();

  const [plansLoaded, setPlansLoaded] = useState(false);

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
        setPlansLoaded(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When plans are loaded and this is an update, ensure the selected plan is set to the previous one
  useEffect(() => {
    if (plansLoaded && isUpdate) {
      // If the plan in formData is not set or doesn't match any plan, set it to initialData's plan_id/plan/plans.id
      let planIdToSet = '';
      if (initialData?.plan_id) {
        planIdToSet = initialData.plan_id;
      } else if (initialData?.plan) {
        planIdToSet = initialData.plan;
      } else if (initialData?.plans?.id) {
        planIdToSet = initialData.plans.id;
      }
      if (planIdToSet && (!formData.plan || !plans.some(p => p.id === formData.plan))) {
        setFormData(prev => ({
          ...prev,
          plan: planIdToSet
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plansLoaded, isUpdate, initialData, plans]);

  // When batches are loaded and this is an update, ensure the selected batch is set to the previous one
  useEffect(() => {
    if (batches.length > 0 && isUpdate) {
      let batchIdToSet = '';
      if (initialData?.batch_id) {
        batchIdToSet = initialData.batch_id;
      } else if (initialData?.batch) {
        batchIdToSet = initialData.batch;
      }
      if (batchIdToSet && (!formData.batch || !batches.some(b => b.id === formData.batch))) {
        setFormData(prev => ({
          ...prev,
          batch: batchIdToSet
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batches, isUpdate, initialData]);

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

  const getImageFileInfo = (uri: string) => {
    let filename = uri.split('/').pop() || 'photo.jpg';
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    return { uri, name: filename, type };
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.phone  || !formData.plan) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const selectedPlan = plans.find(p => p.id === formData.plan);
      if (!selectedPlan) {
        Alert.alert('Error', 'Please select a valid plan');
        return;
      }

      const selectedBatch = batches.find(b => b?.id === formData.batch);

      const amountPaid = parseFloat(formData.amount_paid) || 0;
      if (amountPaid > calculatedTotalAmount) {
        Alert.alert('Error', 'Amount Paid cannot be greater than the Calculated Total Amount');
        return;
      }

      const memberData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email ? formData.email : null,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address || "test",
        batch_id: selectedBatch?.id,
        plan_id: selectedPlan.id,
        status: formData.status,
        joinDate: formData.joinDate,
        photo: formData.photo,
        discount_value: parseFloat(formData.discount_value) || 0,
        admission_fees: parseFloat(formData.admission_fees) || 0,
        amount_paid: parseFloat(formData.amount_paid) || 0,
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
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
      setFormData({ ...formData, photo: base64Image });
    }
    setShowImageSourceOptions(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
      setFormData({ ...formData, photo: base64Image });
    }
    setShowImageSourceOptions(false);
  };

  const selectedPlan = plans.find(p => p.id === formData.plan);
  const calculatedTotalAmount =
    (selectedPlan?.price || 0) -
    (parseFloat(formData.discount_value || '0') || 0) +
    (parseFloat(formData.admission_fees || '0') || 0);

  return (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoUpload} onPress={() => setShowImageSourceOptions(true)}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Details</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Discount Value (optional)"
            value={formData.discount_value}
            onChangeText={(text) => setFormData({ ...formData, discount_value: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Admission Fees (optional)"
            value={formData.admission_fees}
            onChangeText={(text) => setFormData({ ...formData, admission_fees: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Amount Paid (optional)"
            value={formData.amount_paid}
            onChangeText={(text) => setFormData({ ...formData, amount_paid: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Calculated Total Amount:</Text>
          <Text style={styles.infoValue}>{formatCurrency(calculatedTotalAmount, countryCode)}</Text>
        </View>
      </View>

      <Button
        title="Save Member"
        onPress={handleSubmit}
        loading={isLoading}
        style={{ marginTop: 24, marginBottom: 24 }}
        disabled={loadingPlans || !!errorPlans || !!errorBatches}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageSourceOptions}
        onRequestClose={() => setShowImageSourceOptions(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Choose Image Source</Text>
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Text style={styles.modalButtonText}>Pick from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowImageSourceOptions(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.surfaceLight,
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
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SIZES.shadow,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.white,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    ...FONTS.body3,
    marginLeft: 12,
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    alignItems: 'center',
  },
  selectedPlan: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  planText: {
    ...FONTS.body3,
    color: COLORS.white,
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
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    alignItems: 'center',
  },
  selectedBatch: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  batchText: {
    ...FONTS.body4,
    color: COLORS.white,
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
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statusLabel: {
    ...FONTS.body3,
    color: COLORS.white,
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
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 12,
    marginBottom: 16,
  },
  picker: {
    width: '100%',
    height: 56,
    color: COLORS.white,
  },
  loadingContainer: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  infoValue: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  modalButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.errorLight,
  },
  cancelButtonText: {
    ...FONTS.body3,
    color: COLORS.error,
  },
});