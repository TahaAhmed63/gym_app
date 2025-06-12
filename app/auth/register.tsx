import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import Button from '@/components/common/Button';
import { ArrowLeft, Lock, Mail, Phone, User, Building, Globe } from 'lucide-react-native';
import { initiateRegistration, verifyAndCompleteRegistration } from '@/data/authService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gymName, setGymName] = useState('');
  const [country, setCountry] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const handleInitiateRegistration = async () => {
    if (!name || !email || !phone || !password || !confirmPassword || !gymName || !country) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await initiateRegistration(
        name,
        email,
        phone,
        password,
        gymName,
        country
      );
      
      if (success) {
        setShowOtpInput(true);
        Alert.alert(
          'OTP Sent', 
          'Please check your email for the verification code.',
        );
      } else {
        Alert.alert('Error', 'Failed to initiate registration. Please try again.');
      }
    } catch (error:any) {
console.log(error)
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setIsLoading(true);

    try {
      const success = await verifyAndCompleteRegistration(email, otp);
      
      if (success) {
        Alert.alert(
          'Success', 
          'Account created successfully!',
          [{ text: 'Login', onPress: () => router.replace('/auth/login') }]
        );
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace('/auth/login')}
          >
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.formContainer}>
          {!showOtpInput ? (
            <>
              <View style={styles.inputContainer}>
                <User size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Mail size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Phone size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Building size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Gym Name"
                  value={gymName}
                  onChangeText={setGymName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Globe size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Country"
                  value={country}
                  onChangeText={setCountry}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Lock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Lock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
              
              <Button 
                title="Continue" 
                onPress={handleInitiateRegistration} 
                loading={isLoading}
                style={styles.button}
              />
            </>
          ) : (
            <>
              <Text style={styles.otpText}>
                Please enter the 6-digit verification code sent to your email
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              
              <Button 
                title="Verify & Complete" 
                onPress={handleVerifyAndComplete} 
                loading={isLoading}
                style={styles.button}
              />
              
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleInitiateRegistration}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  formContainer: {
    flex: 1,
    padding: 24,
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
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 24,
  },
  button: {
    height: 56,
    borderRadius: 12,
    marginTop: 16,
  },
  otpText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  loginLink: {
    ...FONTS.body4,
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },
});