import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { User, LogOut, ChevronRight, Shield, Bell, Briefcase, CreditCard, CircleHelp as HelpCircle, FileText, Smartphone, Users, Settings } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { logout } from '@/data/authService';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const {user}=useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Header title="Settings" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/settings/profile')}
          >
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/profile')}
          >
            <User size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>My Profile</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/security')}
          >
            <Shield size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>Security</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <Bell size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.gray}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Smartphone size={20} color={COLORS.primary} />
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
              thumbColor={darkModeEnabled ? COLORS.primary : COLORS.gray}
            />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Business Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/gym-info')}
          >
            <Briefcase size={20} color={COLORS.success} />
            <Text style={styles.settingText}>Gym Information</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/plans')}
          >
            <CreditCard size={20} color={COLORS.success} />
            <Text style={styles.settingText}>Membership Plans</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/staff')}
          >
            <Users size={20} color={COLORS.success} />
            <Text style={styles.settingText}>Staff Management</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/batches')}
          >
            <Users size={20} color={COLORS.success} />
            <Text style={styles.settingText}>Batches</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/automation')}
          >
            <Settings size={20} color={COLORS.success} />
            <Text style={styles.settingText}>Automation</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>More</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/help')}
          >
            <HelpCircle size={20} color={COLORS.info} />
            <Text style={styles.settingText}>Help & Support</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/terms')}
          >
            <FileText size={20} color={COLORS.info} />
            <Text style={styles.settingText}>Terms & Conditions</Text>
            <ChevronRight size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleLogout}
          >
            <LogOut size={20} color={COLORS.error} />
            <Text style={[styles.settingText, { color: COLORS.error }]}>Logout</Text>
            <View style={{ width: 20 }} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    ...SIZES.shadow,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  profileEmail: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  editProfileText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  settingsSection: {
    backgroundColor: COLORS.white,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    ...SIZES.shadow,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingText: {
    ...FONTS.body3,
    color: COLORS.black,
    flex: 1,
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
});