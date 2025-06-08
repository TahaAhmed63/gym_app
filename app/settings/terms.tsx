import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: March 15, 2024</Text>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.termsText}>
              By accessing and using the FitPro Gym Management System, you accept and agree to be bound by the terms and provision of this agreement.
            </Text>
          </View>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.termsText}>
              FitPro provides a gym management system that includes member management, payment processing, attendance tracking, and reporting features.
            </Text>
          </View>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>3. Privacy Policy</Text>
            <Text style={styles.termsText}>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information.
            </Text>
          </View>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>4. User Obligations</Text>
            <Text style={styles.termsText}>
              You agree to use the service in compliance with all applicable laws and regulations. You are responsible for maintaining the confidentiality of your account information.
            </Text>
          </View>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>5. Payment Terms</Text>
            <Text style={styles.termsText}>
              All payments processed through the system are subject to our payment processing terms. Refunds are handled according to our refund policy.
            </Text>
          </View>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <Text style={styles.termsText}>
              FitPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </Text>
          </View>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
            <Text style={styles.termsText}>
              We reserve the right to modify these terms at any time. Continued use of the service after such modifications constitutes acceptance of the new terms.
            </Text>
          </View>
          
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>8. Contact Information</Text>
            <Text style={styles.termsText}>
              If you have any questions about these Terms, please contact us at support@fitpro.com.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  lastUpdated: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginBottom: 24,
  },
  termsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 12,
  },
  termsText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
});