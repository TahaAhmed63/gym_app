import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Cake, Calendar, ChevronRight, Clock, Phone, User } from 'lucide-react-native';
import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';

interface ReportCardProps {
  item: {
    id: string;
    name: string;
    phone: string;
    email: string;
    dob?: string;
    plan_end_date?: string;
    status: 'active' | 'inactive';
    photo?: string; // Corrected to photo
    plans?: {
      name: string;
      price: number;
    };
    days_remaining?: number;
    days_until_birthday?: number;
  };
  type: 'expiry' | 'birthday';
}

export default function ReportCard({ item, type }: ReportCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleCall = () => {
    if (!item.phone) return;
    
    const phoneNumber = Platform.OS === 'android' ? `tel:${item.phone}` : `telprompt:${item.phone}`;
    Linking.openURL(phoneNumber);
  };
  
  const handleWhatsApp = () => {
    if (!item.phone) return;
    
    Linking.openURL(`https://wa.me/${item.phone}`);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.memberInfo}>
        <View style={styles.avatarContainer}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {item.name.split(' ').map(n => n[0]).join('')}
            </Text>
          )}
        </View>
        
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          
          {type === 'expiry' && item.plan_end_date && (
            <View style={styles.infoRow}>
              <Clock size={14} color={COLORS.darkGray} />
              <Text style={styles.infoText}>
                Expires on {formatDate(item.plan_end_date)}
              </Text>
            </View>
          )}
          
          {type === 'expiry' && item.days_remaining !== undefined && (
            <View 
              style={[
                styles.daysLeftBadge,
                item.days_remaining <= 3 
                  ? styles.urgentBadge 
                  : item.days_remaining <= 7 
                    ? styles.warningBadge 
                    : styles.infoBadge
              ]}
            >
              <Text 
                style={[
                  styles.daysLeftText,
                  item.days_remaining <= 3 
                    ? styles.urgentText 
                    : item.days_remaining <= 7 
                      ? styles.warningText 
                      : styles.infoText
                ]}
              >
                {item.days_remaining} {item.days_remaining === 1 ? 'day' : 'days'} left
              </Text>
            </View>
          )}
          
          {type === 'birthday' && item.dob && (
            <View style={styles.infoRow}>
              <Cake size={14} color={COLORS.darkGray} />
              <Text style={styles.infoText}>
                {formatDate(item.dob)}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Phone size={14} color={COLORS.darkGray} />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}      onPress={() => router.push(`/members/${item.id}`)}>
          <ChevronRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCall}
        >
          <Phone size={16} color={COLORS.primary} />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.whatsappButton]}
          onPress={handleWhatsApp}
        >
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SIZES.shadow,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25, // Make sure this matches avatarContainer's borderRadius
  },
  details: {
    flex: 1,
  },
  name: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginLeft: 6,
  },
  daysLeftBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  urgentBadge: {
    backgroundColor: COLORS.errorLight,
  },
  warningBadge: {
    backgroundColor: COLORS.warningLight,
  },
  infoBadge: {
    backgroundColor: COLORS.infoLight,
  },
  daysLeftText: {
    ...FONTS.caption,
    fontFamily: 'Inter-Medium',
  },
  urgentText: {
    color: COLORS.error,
  },
  warningText: {
    color: COLORS.warning,
  },
  moreButton: {
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  callButton: {
    backgroundColor: COLORS.primaryLight,
    marginRight: 8,
  },
  whatsappButton: {
    backgroundColor: COLORS.successLight,
  },
  buttonText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
});