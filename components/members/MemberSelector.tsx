import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Platform, KeyboardAvoidingView, FlatList } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { ChevronDown, User } from 'lucide-react-native';
import { api } from '@/data/api';
import MemberCard from './MemberCard'; // Added import for MemberCard

interface Member {
  id: string; // Changed from number to string
  name: string;
  plans?: {
    price: number;
  };
  discount_value?: number;
  admission_fees?: number;
  plan_end_date?: string; // Add plan_end_date
  status?: 'active' | 'inactive'; // Add status
  payments?: Array<{ due_amount: number, notes?: string, payment_date: string }>; // Add payments and payment_date
  photo?: string; // Add photo
  join_date?: string; // Add join_date
  plan?: string; // Add top-level plan string
}

interface MemberSelectorProps {
  selectedMemberId?: string; // Changed from string | number to string
  memberplaneamount?: number;
  onSelect: (memberId: string, planAmount?: number, discountValue?: number, admissionFees?: number, planEndDate?: string, status?: 'active' | 'inactive', memberPayments?: Array<{ due_amount: number, notes?: string }>) => void; // Changed memberId to string
  error?: string;
}

export default function MemberSelector({ selectedMemberId,memberplaneamount, onSelect, error }: MemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    loadMembers(1, false);
  }, []);

  useEffect(() => {
    if (selectedMemberId && members.length > 0) {
      const member = members.find(m => m.id === selectedMemberId);
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [selectedMemberId, members]);

  const loadMembers = async (pageToLoad = 1, append = false) => {
    if (append) setIsFetchingMore(true);
    else setLoading(true);
    try {
      const response = await api.get(`/members?page=${pageToLoad}&limit=10`);
      if (response.data.success) {
        const newMembers = response.data.data.map((m: any) => ({
          id: m.id,
          name: m.name,
          plans: m.plans,
          discount_value: m.discount_value,
          admission_fees: m.admission_fees,
          plan_end_date: m.plan_end_date,
          status: m.status,
          payments: m.payments,
          photo: m.photo,
          join_date: m.join_date,
          plan: m.plans?.name || 'N/A',
        }));
        setTotalPages(response.data.meta.totalPages);
        setPage(pageToLoad);
        setMembers(prev => append ? [...prev, ...newMembers] : newMembers);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      if (append) setIsFetchingMore(false);
      else setLoading(false);
    }
  };

  const handleSelect = (member: Member) => {
    setSelectedMember(member);
    onSelect(member.id, member.plans?.price, member.discount_value, member.admission_fees, member.plan_end_date, member.status, member.payments);
    setIsOpen(false);
  };

  // Filter members by search (client-side)
  const filteredMembers = search.trim().length === 0
    ? (members ?? [])
    : (members ?? []).filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, error && styles.selectorError]}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.selectorContent}>
          <User size={20} color={COLORS.darkGray} />
          <Text style={styles.selectorText}>
            {selectedMember ? selectedMember.name : 'Select a member'}
          </Text>
        </View>
        <ChevronDown size={20} color={COLORS.darkGray} />
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            <View style={styles.modalContent}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search member..."
                placeholderTextColor={COLORS.darkGray}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              <View style={styles.dropdown}>
                {loading && page === 1 ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : filteredMembers.length === 0 ? (
                  <Text style={styles.optionText}>No members found</Text>
                ) : (
                  <FlatList
                    data={filteredMembers}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <MemberCard
                        member={item as any}
                        onPress={() => handleSelect(item)}
                        viewMode="list"
                      />
                    )}
                    onEndReached={() => {
                      if (
                        search.trim().length === 0 &&
                        page < totalPages &&
                        !isFetchingMore &&
                        !loading
                      ) {
                        loadMembers(page + 1, true);
                      }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isFetchingMore ? <ActivityIndicator /> : null}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ...existing code...
 

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  selectorError: {
    borderColor: COLORS.error,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    ...FONTS.body3,
    color: COLORS.black,
    marginLeft: 12,
  },
  error: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SIZES.shadow,
  },
  
  dropdown: {
    maxHeight: 400,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedOption: {
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },
  searchInput: {
    height: 48,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
    color: COLORS.black,
    ...FONTS.body3,
    backgroundColor: COLORS.background || COLORS.white,
  },
}); 