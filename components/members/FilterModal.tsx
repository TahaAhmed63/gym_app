import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback 
} from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { X } from 'lucide-react-native';
import Button from '@/components/common/Button';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (status: string) => void;
  currentFilter: string;
}

export default function FilterModal({ 
  visible, 
  onClose, 
  onApply, 
  currentFilter 
}: FilterModalProps) {
  
  const filters = [
    { label: 'All Members', value: 'all' },
    { label: 'Active Members', value: 'active' },
    { label: 'Inactive Members', value: 'inactive' },
  ];
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Filter Members</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <X size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.content}>
                <Text style={styles.sectionTitle}>Member Status</Text>
                
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.value}
                    style={[
                      styles.filterOption,
                      currentFilter === filter.value && styles.selectedOption
                    ]}
                    onPress={() => onApply(filter.value)}
                  >
                    <View 
                      style={[
                        styles.radioButton,
                        currentFilter === filter.value && styles.radioButtonSelected
                      ]}
                    >
                      {currentFilter === filter.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.filterText}>{filter.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.footer}>
                <Button
                  title="Apply Filters"
                  onPress={() => onApply(currentFilter)}
                  style={styles.applyButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedOption: {
    backgroundColor: COLORS.primaryLight,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...FONTS.body3,
    color: COLORS.black,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  applyButton: {
    borderRadius: 12,
  },
});