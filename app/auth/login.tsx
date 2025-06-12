import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
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
import { Lock, Mail } from 'lucide-react-native';
import { loginUser } from '@/data/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await loginUser(email, password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
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
        <View style={styles.logoWrapper}>
          <Image 
            source={require('@/assets/images/LOGO.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.formCard}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          <View style={styles.inputContainer}>
            <Mail size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.gray}
            />
          </View>
          <View style={styles.inputContainer}>
            <Lock size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={COLORS.gray}
            />
          </View>
          <Link href="/auth/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>
          <Button 
            title="Sign In" 
            onPress={handleLogin} 
            loading={isLoading}
            style={styles.button}
          />
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Sign Up</Text>
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
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.background,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 200,
    height: 70,
    marginBottom: 8,
  },
  formCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    ...SIZES.shadow,
    alignSelf: 'center',
    marginTop: 8,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginBottom: 28,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    ...FONTS.body3,
    marginLeft: 12,
    color: COLORS.black,
  },
  forgotPassword: {
    ...FONTS.body4,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: 24,
    marginTop: -8,
  },
  button: {
    height: 52,
    borderRadius: 12,
    marginTop: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  registerLink: {
    ...FONTS.body4,
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },
});