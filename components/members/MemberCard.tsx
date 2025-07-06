import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Phone, Calendar } from 'lucide-react-native';

interface MemberCardProps {
  member: {
    id: number;
    name: string;
    phone: string;
    email: string;
    status: string;
    plan: string;
    join_date: string;
  };
  onPress: () => void;
  viewMode: 'grid' | 'list';
}

export default function MemberCard({ member, onPress, viewMode }: MemberCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  console.log(member,"member")
  const getStatusColor = (status: string) => {
    return status === 'active' ? COLORS.success : COLORS.error;
  };
  
  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.memberInitials}>
          <Text style={styles.initialsText}>
            {member.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={styles.memberDetails}>
            <Text style={styles.memberPlan}>{member.plan}</Text>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(member.status) + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.statusText, 
                  { color: getStatusColor(member.status) }
                ]}
              >
                {member.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          <View style={styles.memberMeta}>
            <View style={styles.metaItem}>
              <Phone size={14} color={COLORS.darkGray} />
              <Text style={styles.metaText}>{member.phone}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Calendar size={14} color={COLORS.darkGray} />
              <Text style={styles.metaText}>Expires: {formatDate(member.created_at)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.gridCardTop}>
        <View 
          style={[
            styles.statusDot, 
            { backgroundColor: getStatusColor(member.status) }
          ]}
        />
        <View style={styles.gridInitials}>
          <Text style={styles.gridInitialsText}>
            {member.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.gridName}>{member.name}</Text>
      <Text style={styles.gridPlan}>{member.plan}</Text>
      
      <View style={styles.gridExpiry}>
        <Calendar size={14} color={COLORS.darkGray} />
        <Text style={styles.gridExpiryText}>
          {formatDate(member.join_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...SIZES.shadow,
  },
  memberInitials: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 4,
  },
  memberDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberPlan: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    ...FONTS.caption,
    fontFamily: 'Inter-Medium',
  },
  memberMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    ...FONTS.caption,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  
  // Grid View Styles
  gridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '48%',
    marginHorizontal: '1%',
    ...SIZES.shadow,
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gridInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridInitialsText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  gridName: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: 4,
  },
  gridPlan: {
    ...FONTS.caption,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  gridExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridExpiryText: {
    ...FONTS.caption,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
});