import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, Mail, MoveVertical as MoreVertical, Phone, Plus, User } from 'lucide-react-native';
import Button from '@/components/common/Button';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export default function StaffScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState<StaffMember>({
    id: '',
    name: '',
    role: '',
    email: '',
    phone: '',
  });
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Smith',
      role: 'Trainer',
      email: 'john@example.com',
      phone: '1234567890',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Manager',
      email: 'sarah@example.com',
      phone: '0987654321',
    },
  ]);

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.role || !newStaff.email || !newStaff.phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setStaff([
      ...staff,
      {
        ...newStaff,
        id: Date.now().toString(),
      },
    ]);
    setNewStaff({
      id: '',
      name: '',
      role: '',
      email: '',
      phone: '',
    });
    setShowAddForm(false);
  };

  const handleRemoveStaff = (id: string) => {
    Alert.alert(
      'Remove Staff',
      'Are you sure you want to remove this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove',
          style: 'destructive',
          onPress: () => setStaff(staff.filter(member => member.id !== id))
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Staff Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Staff Member</Text>
            
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={newStaff.name}
                onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                placeholder="Role"
                value={newStaff.role}
                onChangeText={(text) => setNewStaff({ ...newStaff, role: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={newStaff.email}
                onChangeText={(text) => setNewStaff({ ...newStaff, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={newStaff.phone}
                onChangeText={(text) => setNewStaff({ ...newStaff, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={[styles.formButton, { marginRight: 8 }]}
              />
              <Button
                title="Add Staff"
                onPress={handleAddStaff}
                style={[styles.formButton, { marginLeft: 8 }]}
              />
            </View>
          </View>
        )}

        {staff.map((member) => (
          <View key={member.id} style={styles.staffCard}>
            <View style={styles.staffHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{member.name}</Text>
                <Text style={styles.staffRole}>{member.role}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => handleRemoveStaff(member.id)}
              >
                <MoreVertical size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.staffDetails}>
              <View style={styles.detailRow}>
                <Mail size={16} color={COLORS.darkGray} />
                <Text style={styles.detailText}>{member.email}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Phone size={16} color={COLORS.darkGray} />
                <Text style={styles.detailText}>{member.phone}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Add New Staff</Text>
        </TouchableOpacity>
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
  addForm: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SIZES.shadow,
  },
  formTitle: {
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
  formButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  formButton: {
    flex: 1,
  },
  staffCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SIZES.shadow,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  staffInfo: {
    flex: 1,
    marginLeft: 12,
  },
  staffName: {
    ...FONTS.body3,
    color: COLORS.black,
    fontFamily: 'Inter-SemiBold',
  },
  staffRole: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  moreButton: {
    padding: 8,
  },
  staffDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...SIZES.shadow,
  },
  addButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 8,
  },
});