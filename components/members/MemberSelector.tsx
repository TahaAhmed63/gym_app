import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { ChevronDown, User } from 'lucide-react-native';
import { api } from '@/data/api';

interface Member {
  id: number;
  name: string;
  plans?: {
    price: number;
  };
}

interface MemberSelectorProps {
  selectedMemberId?: string | number;
  memberplaneamount?: number;
  onSelect: (memberId: number, planAmount?: number) => void;
  error?: string;
}

export default function MemberSelector({ selectedMemberId,memberplaneamount, onSelect, error }: MemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);
//
  useEffect(() => {
    if (selectedMemberId && members.length > 0) {
      const member = members.find(m => m.id === selectedMemberId);
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [selectedMemberId, members]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/members');
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (member: Member) => {
    setSelectedMember(member);
    onSelect(member.id, member.plans?.price);
    setIsOpen(false);
  };

  // Filter members by search
  const filteredMembers = search.trim().length === 0
    ? members
    : members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
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
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : filteredMembers.length === 0 ? (
                  <Text style={styles.optionText}>No members found</Text>
                ) : (
                  filteredMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.option,
                        selectedMember?.id === member.id && styles.selectedOption
                      ]}
                      onPress={() => handleSelect(member)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedMember?.id === member.id && styles.selectedOptionText
                      ]}>
                        {member.name}
                      </Text>
                    </TouchableOpacity>
                  ))
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