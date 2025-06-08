import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Phone, User, Building, Globe } from 'lucide-react-native';
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import { profileSchema, loginSchema, registrationSchema } from '@/utils/validation';

export default function ProfileScreen() {
  const { user, loading, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gym_name: user?.gym_name || '',
    country: user?.country || '',
  });
console.log(user,"user")
  const validateForm = () => {
    try {
      profileSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const validationErrors: ValidationErrors = {};
        if ('errors' in error) {
          (error as any).errors.forEach((err: any) => {
            const path = err.path.join('.');
            validationErrors[path] = err.message;
          });
        }
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement profile update API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    field: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    editable: boolean = true
  ) => (
    <View style={styles.inputContainer}>
      {icon}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
        />
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Header 
          title="Profile"
          leftIcon={<ArrowLeft size={24} color={COLORS.black} />}
          onLeftPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Header 
        title="Profile"
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
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {renderInput(
              <User size={20} color={COLORS.darkGray} />,
              'Full Name',
              formData.name,
              (value) => setFormData(prev => ({ ...prev, name: value })),
              'name'
            )}
            
            {renderInput(
              <Mail size={20} color={COLORS.darkGray} />,
              'Email Address',
              formData.email,
              (value) => setFormData(prev => ({ ...prev, email: value })),
              'email',
              'email-address',
              false
            )}
            
            {renderInput(
              <Phone size={20} color={COLORS.darkGray} />,
              'Phone Number',
              formData.phone,
              (value) => setFormData(prev => ({ ...prev, phone: value })),
              'phone',
              'phone-pad'
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gym Information</Text>
            
            {renderInput(
              <Building size={20} color={COLORS.darkGray} />,
              'Gym Name',
              formData.gym_name,
              (value) => setFormData(prev => ({ ...prev, gym_name: value })),
              'gym_name'
            )}
            
            {renderInput(
              <Globe size={20} color={COLORS.darkGray} />,
              'Country',
              formData.country,
              (value) => setFormData(prev => ({ ...prev, country: value })),
              'country'
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={isLoading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  input: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});