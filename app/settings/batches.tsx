import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/components/common/Button';
import { router } from 'expo-router';

interface Batch {
  id: string;
  name: string;
  schedule_time: string;
}

export default function BatchesScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const access_token = await AsyncStorage.getItem('access_token');
      const response = await fetch('https://gymbackend-nfa0.onrender.com/api/batches', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setBatches(data.data);
        console.log(batches)
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      Alert.alert('Error', 'Failed to fetch batches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Batch',
      'Are you sure you want to delete this batch?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const access_token = await AsyncStorage.getItem('access_token');
              const response = await fetch(`https://gymbackend-nfa0.onrender.com/api/batches/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${access_token}`,
                  'Content-Type': 'application/json'
                }
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert('Success', 'Batch deleted successfully');
                fetchBatches();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete batch');
              }
            } catch (error) {
              console.error('Error deleting batch:', error);
              Alert.alert('Error', 'Failed to delete batch');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batches</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/settings/batches/create' as any)}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {batches.map((batch) => (
          <View key={batch.id} style={styles.batchCard}>
            <View style={styles.batchInfo}>
              <Text style={styles.batchName}>{batch.name}</Text>
              <Text style={styles.batchTime}>{batch.schedule_time}</Text>
            </View>
            <View style={styles.batchActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/settings/batches/edit/${batch.id}` as any)}
              >
                <Pencil size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(batch.id)}
              >
                <Trash2 size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  batchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SIZES.shadow,
  },
  batchInfo: {
    flex: 1,
  },
  batchName: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 4,
  },
  batchTime: {
    ...FONTS.body4,
    color: COLORS.darkGray,
  },
  batchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.errorLight,
  },
}); 