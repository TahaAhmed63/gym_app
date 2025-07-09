import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Phone, Calendar } from 'lucide-react-native';

interface MemberCardProps {
  member: {
    id: string; // Changed from number to string
    name: string;
    phone: string;
    email: string;
    status: string;
    plan: string;
    join_date: string;
    photo: string | null; // Changed to explicitly allow null
    plan_end_date: string;
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
        <View style={styles.listPhotoContainer}>
          {member.photo ? (
            <Image source={{ uri: member.photo }} style={styles.listPhoto} />
          ) : (
            <View style={styles.listInitialsPlaceholder}>
              <Text style={styles.listInitialsText}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.listInfo}>
          <Text style={styles.listMemberName}>{member.name}</Text>
          <Text style={styles.listMemberPlan}>{member.plan}</Text>
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

          <View style={styles.listMemberMeta}>
            <View style={styles.metaItem}>
              <Phone size={16} color={COLORS.darkGray} />
              <Text style={styles.metaText}>{member.phone}</Text>
            </View>

            <View style={styles.metaItem}>
              <Calendar size={16} color={COLORS.darkGray} />
              <Text style={styles.metaText}>Expires: {formatDate(member.plan_end_date)}</Text>
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
      <View style={styles.gridStatusDotContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(member.status) }
          ]}
        />
      </View>
      <View style={styles.gridPhotoContainer}>
        {member.photo ? (
          <Image source={{ uri: member.photo }} style={styles.gridPhoto} />
        ) : (
          <View style={styles.gridInitialsPlaceholder}>
            <Text style={styles.gridInitialsText}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.gridMemberName}>{member.name}</Text>
      <Text style={styles.gridMemberPlan}>{member.plan}</Text>

      <View style={styles.gridExpiry}>
        <Calendar size={16} color={COLORS.darkGray} />
        <Text style={styles.gridExpiryText}>
          Expires: {formatDate(member.plan_end_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16, // Slightly more rounded
    padding: 16, // More padding
    marginBottom: 12,
    ...SIZES.shadow, // Keep shadow
    elevation: 3, // Stronger shadow for Android
    shadowOffset: { width: 0, height: 2 }, // Adjust shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listPhotoContainer: {
    marginRight: 16, // More space
    justifyContent: 'center',
    alignItems: 'center',
  },
  listPhoto: {
    width: 60, // Larger photo
    height: 60,
    borderRadius: 30, // Circular
    borderColor: COLORS.lightGray, // Subtle border
    borderWidth: 1,
  },
  listInitialsPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInitialsText: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
  },
  listMemberName: {
    ...FONTS.h4,
    color: COLORS.black,
    marginBottom: 2, // Less space
  },
  listMemberPlan: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4, // More padding
    paddingHorizontal: 10, // More padding
    borderRadius: 20, // More rounded
    alignSelf: 'flex-start', // Align badge to start
    marginBottom: 8,
  },
  statusText: {
    ...FONTS.caption,
    fontFamily: 'Inter-Medium',
  },
  listMemberMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8, // Add some top margin
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20, // More space between items
    marginBottom: 4,
  },
  metaText: {
    ...FONTS.body4, // Slightly larger text
    color: COLORS.darkGray,
    marginLeft: 6, // More space after icon
  },

  // Grid View Styles
  gridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16, // Consistent with list card
    padding: 16, // Consistent with list card
    marginBottom: 12,
    width: '48%',
    marginHorizontal: '1%',
    alignItems: 'center', // Center items for grid view
    ...SIZES.shadow,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridStatusDotContainer: {
    position: 'absolute', // Position status dot
    top: 10,
    right: 10,
    zIndex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gridPhotoContainer: {
    marginBottom: 16, // More space below photo
  },
  gridInitialsPlaceholder: {
    width: 100, // Larger
    height: 100,
    borderRadius: 50, // Circular
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.lightGray, // Subtle border
    borderWidth: 1,
  },
  gridInitialsText: {
    ...FONTS.h1, // Larger text for initials
    color: COLORS.primary,
  },
  gridPhoto: {
    width: 100, // Larger
    height: 100,
    borderRadius: 50, // Circular
    borderColor: COLORS.lightGray, // Subtle border
    borderWidth: 1,
  },
  gridMemberName: {
    ...FONTS.h3, // Larger name font
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'center',
  },
  gridMemberPlan: {
    ...FONTS.body3, // Larger plan font
    color: COLORS.darkGray,
    marginBottom: 12, // More space
    textAlign: 'center',
  },
  gridExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom if card height varies
  },
  gridExpiryText: {
    ...FONTS.body4, // Consistent with metaText
    color: COLORS.darkGray,
    marginLeft: 6,
  },
});