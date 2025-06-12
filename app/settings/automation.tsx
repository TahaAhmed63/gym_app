import { View, Text, StyleSheet, Switch, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, Settings } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import { getAutomationSettings, saveAutomationSettings, AutomationSettings } from '@/data/automationService';

export default function AutomationScreen() {
  const [settings, setSettings] = useState<AutomationSettings>({
    autoInactiveMembers: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getAutomationSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading automation settings:', error);
      Alert.alert('Error', 'Failed to load automation settings');
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await saveAutomationSettings(settings);
      Alert.alert('Success', 'Automation settings saved successfully');
    } catch (error) {
      console.error('Error saving automation settings:', error);
      Alert.alert('Error', 'Failed to save automation settings');
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
        <Text style={styles.headerTitle}>Automation Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Status Automation</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto-mark Inactive Members</Text>
              <Text style={styles.settingDescription}>
                Automatically mark members as inactive when their plan expires and dues are unpaid
              </Text>
            </View>
            <Switch
              value={settings.autoInactiveMembers}
              onValueChange={(value) => setSettings(prev => ({ ...prev, autoInactiveMembers: value }))}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primaryLight }}
              thumbColor={settings.autoInactiveMembers ? COLORS.primary : COLORS.gray}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isLoading ? 'Saving...' : 'Save Settings'}
          onPress={handleSave}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: 4,
  },
  settingDescription: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
}); 