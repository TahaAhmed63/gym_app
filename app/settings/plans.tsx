import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import Button from '@/components/common/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Plan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
}

export default function PlansScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Fetch plans when component mounts
  useEffect(() => {
    fetchPlans();
  }, []);
console.log(plans)
  const fetchPlans = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://gymbackend-nfa0.onrender.com/api/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      if (data.success) {
        // Transform the data to match our frontend format
        const transformedPlans = data.data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price.toString(),
          duration: plan.duration_in_months.toString(),
          features: plan.description ? plan.description.split(', ') : ['']
        }));
        setPlans(transformedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to fetch plans');
    }
  };

  const handleAddPlan = () => {
    const newPlan: Plan = {
      id: '',
      name: '',
      price: '',
      duration: '1',
      features: [''],
    };
    setPlans([...plans, newPlan]);
  };

  const handleRemovePlan = async (id: string) => {
    Alert.alert(
      "Delete Plan",
      "Are you sure you want to delete this plan?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              if (!token) {
                throw new Error('No authentication token found');
              }

              const response = await fetch(`https://gymbackend-nfa0.onrender.com/api/plans/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete plan: ${response.status}`);
              }

              setPlans(plans.filter(plan => plan.id !== id));
              Alert.alert('Success', 'Plan removed successfully');
            } catch (error) {
              console.error('Error removing plan:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove plan');
            }
          }
        }
      ]
    );
  };

  const handleUpdatePlan = (id: string, field: keyof Plan, value: string | string[]) => {
    setPlans(plans.map(plan => 
      plan.id === id ? { ...plan, [field]: value } : plan
    ));
  };

  const handleAddFeature = (planId: string) => {
    setPlans(plans.map(plan => 
      plan.id === planId 
        ? { ...plan, features: [...plan.features, ''] }
        : plan
    ));
  };

  const handleUpdateFeature = (planId: string, index: number, value: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const features = [...plan.features];
        features[index] = value;
        return { ...plan, features };
      }
      return plan;
    }));
  };

  const handleRemoveFeature = (planId: string, index: number) => {
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        const features = plan.features.filter((_, i) => i !== index);
        return { ...plan, features };
      }
      return plan;
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Map the plans to match the backend format
      const plansToSave = plans.map(plan => ({
        name: plan.name,
        duration_in_months: parseInt(plan.duration),
        price: parseFloat(plan.price),
        description: plan.features.join(', ')
      }));

      // Process each plan - create new ones or update existing ones
      const responses = await Promise.all(
        plansToSave.map(async (plan, index) => {
          const existingPlan = plans[index];
          const url = existingPlan.id 
            ? `https://gymbackend-nfa0.onrender.com/api/plans/${existingPlan.id}`
            : 'https://gymbackend-nfa0.onrender.com/api/plans';
          
          return fetch(url, {
            method: existingPlan.id ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(plan),
          });
        })
      );

      // Check if any request failed
      const hasError = responses.some(response => !response.ok);
      if (hasError) {
        throw new Error('Failed to save some plans');
      }

      // Refresh the plans list
      await fetchPlans();
      Alert.alert('Success', 'Plans saved successfully');
    } catch (error) {
      console.error('Error saving plans:', error);
      Alert.alert('Error', 'Failed to save plans. Please try again.');
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
          onPress={() => router.push('/settings')}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {plans.map((plan, index) => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Plan {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePlan(plan.id)}
              >
                <Trash2 size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Plan Name"
                value={plan.name}
                onChangeText={(text) => handleUpdatePlan(plan.id, 'name', text)}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={plan.price}
                  onChangeText={(text) => handleUpdatePlan(plan.id, 'price', text)}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Duration (months)"
                  value={plan.duration}
                  onChangeText={(text) => handleUpdatePlan(plan.id, 'duration', text)}
                  keyboardType="numeric"
                />
                <Text style={styles.durationText}>months</Text>
              </View>
            </View>

            <Text style={styles.featuresTitle}>Features</Text>
            {plan.features.map((feature, featureIndex) => (
              <View key={featureIndex} style={styles.featureRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Feature"
                    value={feature}
                    onChangeText={(text) => handleUpdateFeature(plan.id, featureIndex, text)}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.removeFeatureButton}
                  onPress={() => handleRemoveFeature(plan.id, featureIndex)}
                >
                  <Trash2 size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addFeatureButton}
              onPress={() => handleAddFeature(plan.id)}
            >
              <Plus size={16} color={COLORS.primary} />
              <Text style={styles.addFeatureText}>Add Feature</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addPlanButton}
          onPress={handleAddPlan}
        >
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addPlanText}>Add New Plan</Text>
        </TouchableOpacity>

        <Button
          title="Save Changes"
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.saveButton}
        />
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
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SIZES.shadow,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitle: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  removeButton: {
    padding: 8,
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
    color: COLORS.black,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  currencySymbol: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  durationText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  featuresTitle: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeFeatureButton: {
    padding: 8,
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    marginTop: 8,
  },
  addFeatureText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginLeft: 8,
  },
  addPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SIZES.shadow,
  },
  addPlanText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 8,
  },
  saveButton: {
    marginBottom: 24,
  },
});