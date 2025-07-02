import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, CircleHelp as HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react-native';
import { getAllStaff, createStaff, updateStaff, deleteStaff, updateStaffPermissions } from '@/data/staffService';

export default function HelpScreen() {
  const faqs = [
    {
      question: 'How do I add a new member?',
      answer: 'Go to the Members tab and click the + button in the bottom right corner to add a new member.',
    },
    {
      question: 'How do I record a payment?',
      answer: 'Navigate to the Payments tab and use the + button to record a new payment.',
    },
    {
      question: 'How do I generate reports?',
      answer: 'Visit the Reports tab where you can view and generate various reports about members and payments.',
    },
    {
      question: 'How do I manage membership plans?',
      answer: 'Go to Settings > Membership Plans to add, edit, or remove membership plans.',
    },
  ];

  const handleContact = (type: 'phone' | 'email' | 'chat') => {
    switch (type) {
      case 'phone':
        Linking.openURL('tel:+1234567890');
        break;
      case 'email':
        Linking.openURL('mailto:support@fitpro.com');
        break;
      case 'chat':
        // In a real app, this would open a chat interface
        break;
    }
  };

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <TouchableOpacity 
            style={styles.contactOption}
            onPress={() => handleContact('phone')}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Phone size={24} color={COLORS.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Call Us</Text>
              <Text style={styles.optionDescription}>Speak with our support team</Text>
            </View>
            <ChevronRight size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactOption}
            onPress={() => handleContact('email')}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.successLight }]}>
              <Mail size={24} color={COLORS.success} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Email Support</Text>
              <Text style={styles.optionDescription}>Get help via email</Text>
            </View>
            <ChevronRight size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactOption}
            onPress={() => handleContact('chat')}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.infoLight }]}>
              <MessageSquare size={24} color={COLORS.info} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Live Chat</Text>
              <Text style={styles.optionDescription}>Chat with support team</Text>
            </View>
            <ChevronRight size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.faqItem}
            >
              <View style={styles.faqHeader}>
                <HelpCircle size={20} color={COLORS.primary} />
                <Text style={styles.question}>{faq.question}</Text>
              </View>
              <Text style={styles.answer}>{faq.answer}</Text>
            </TouchableOpacity>
          ))}
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
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 16,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: 4,
  },
  optionDescription: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  question: {
    ...FONTS.body3,
    color: COLORS.black,
    marginLeft: 12,
    flex: 1,
  },
  answer: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 32,
  },
});