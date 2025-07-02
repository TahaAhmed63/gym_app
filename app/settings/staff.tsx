import { useState, useEffect, useContext } from 'react';
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
import {
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffPermissions,
} from '@/data/staffService';
import { AuthContext } from '@/contexts/AuthContext';
import { StaffMember } from '@/data/authService';

export default function StaffScreen() {
  const { user } = useContext(AuthContext) as { user: { id: string; gym_id: string }; loading: boolean };
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState<StaffMember & { password?: string }>({
    id: '',
    user_id: user?.id || '',
    name: '',
    role: '',
    email: '',
    phone: '',
    permissions: [],
    gym_id: user?.gym_id || '',
    created_at: '',
    updated_at: '',
    password: '',
  });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchStaff().then((res: { data: { staff: StaffMember[] } }) => {
      setStaff(res.data.staff);
      setLoading(false);
    });
  }, []);

  // Permissions options (customize as needed)
  const PERMISSIONS = [
    'view_reports',
    'edit_members',
    'manage_payments',
    'manage_batches',
    'manage_staff',
  ];

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.role || !newStaff.email || !newStaff.phone || !newStaff.password) {
      Alert.alert('Error', 'Please fill in all fields, including password');
      return;
    }

    try {
      const response = await createStaff({
        ...newStaff,
        user_id: user?.id || '',
        gym_id: user?.gym_id || '',
        password: newStaff.password,
      });
      setStaff([
        ...staff,
        response,
      ]);
      setNewStaff({
        id: '',
        user_id: user?.id || '',
        name: '',
        role: '',
        email: '',
        phone: '',
        permissions: [],
        gym_id: user?.gym_id || '',
        created_at: '',
        updated_at: '',
        password: '',
      });
      setShowAddForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add staff');
    }
  };

  const handleRemoveStaff = async (id: string) => {
    Alert.alert(
      'Remove Staff',
      'Are you sure you want to remove this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStaff(id);
              setStaff(staff.filter((member: StaffMember) => member.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove staff');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStaff = async (id: string, data: Partial<StaffMember>) => {
    await updateStaff(id, data);
    // refresh list
  };

  const handleDeleteStaff = async (id: string) => {
    await deleteStaff(id);
    // refresh list
  };

  const handleUpdatePermissions = async (id: string, permissions: string[]) => {
    await updateStaffPermissions(id, permissions);
    // refresh list
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

            <View style={styles.inputContainer}>
              <Text style={{marginLeft: 4, marginRight: 8, color: COLORS.darkGray}}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={newStaff.password}
                onChangeText={(text) => setNewStaff({ ...newStaff, password: text })}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Permissions selection */}
            <Text style={{ marginBottom: 8, color: COLORS.darkGray }}>Permissions</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {PERMISSIONS.map((perm) => (
                <TouchableOpacity
                  key={perm}
                  style={{
                    backgroundColor: newStaff.permissions.includes(perm) ? COLORS.primary : COLORS.lightGray,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => {
                    setNewStaff({
                      ...newStaff,
                      permissions: newStaff.permissions.includes(perm)
                        ? newStaff.permissions.filter((p) => p !== perm)
                        : [...newStaff.permissions, perm],
                    });
                  }}
                >
                  <Text style={{ color: newStaff.permissions.includes(perm) ? COLORS.white : COLORS.darkGray }}>{perm.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={StyleSheet.flatten([styles.formButton, { marginRight: 8 }])}
              />
              <Button
                title="Add Staff"
                onPress={handleAddStaff}
                style={StyleSheet.flatten([styles.formButton, { marginLeft: 8 }])}
              />
            </View>
          </View>
        )}

        {staff.map((member: StaffMember) => (
          <View key={member.id} style={styles.staffCard}>
            <View style={styles.staffHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
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