import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS } from '@/constants/theme';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import MemberForm from '@/components/members/MemberForm';
import { createMember } from '@/data/membersService';
import { useState } from 'react';
import { Alert } from 'react-native';

export default function AddMemberScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (memberData: any) => {
    try {
      setIsLoading(true);
      await createMember(memberData);
      Alert.alert('Success', 'Member added successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/members')
        }
      ]);
    } catch (error) {
      console.error('Error creating member:', error);
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setIsLoading(false);
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
        <Text style={styles.headerTitle}>Add New Member</Text>
        <View style={{ width: 40 }} />
      </View>

      <MemberForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
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
}); 