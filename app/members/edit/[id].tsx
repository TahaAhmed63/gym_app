import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MemberForm from '@/components/members/MemberForm';

interface MemberData {
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
  discount_value?: number; // Add discount_value
  admission_fees?: number;  // Add admission_fees
}

export default function EditMemberScreen() {
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);

  useEffect(() => {
    const loadMember = async () => {
      if (!id) return;

      try {
        const access_token = await AsyncStorage.getItem('access_token');
        const response = await fetch(`https://gymbackend-eight.vercel.app/api/members/${id}`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setMemberData(data.data);
        } else {
          Alert.alert('Error', 'Failed to load member details');
        }
      } catch (error) {
        console.error('Error loading member:', error);
        Alert.alert('Error', 'Failed to load member details');
      } finally {
        setIsLoading(false);
      }
    };

    loadMember();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    setIsSaving(true);
    console.log('Attempting to save member with ID:', id, 'and data:', formData);
    try {
      const access_token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`https://gymbackend-eight.vercel.app/api/members/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert(
          'Success',
          'Member updated successfully',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to update member');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      Alert.alert('Error', 'Failed to update member');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Edit Member</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {memberData && (
          <MemberForm
            initialData={memberData}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  }
});