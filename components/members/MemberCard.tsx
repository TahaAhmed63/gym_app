import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, ImageBackground } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Phone, Calendar, MoreHorizontal } from 'lucide-react-native';

interface MemberCardProps {
  member: {
    id: string; // Changed from number to string
    name: string;
    phone: string;
    email: string;
    status: string;
    plan: string;
    join_date?: string;
    photo?: string | null;
    plan_end_date?: string;
  };
  onPress: () => void;
  viewMode: 'grid' | 'list';
}

export default function MemberCard({ member, onPress, viewMode }: MemberCardProps) {
  const formatDate = (dateString: string = '') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatShortDate = (dateString: string = '') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
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
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${member.status} member`}
    >
      {/* image as full card background */}
      { (member.photo && member.photo.length > 0) ? (
        <ImageBackground source={{ uri: member.photo }} style={styles.imageBg} imageStyle={styles.imageStyle}>
          <View style={styles.overlay} />

          <View style={styles.dateBadge}>
            <Calendar size={12} color={COLORS.white} />
            <Text style={styles.dateBadgeText}>{formatShortDate(member.join_date || member.plan_end_date || '')}</Text>
          </View>

          <View style={styles.bottomInfo}>
            <View style={styles.topRow}>
              <View style={styles.textBlock}>
                <Text style={styles.gridMemberNameSmall} numberOfLines={1} ellipsizeMode="tail">{member.name}</Text>
                <Text style={styles.gridMemberPlan} numberOfLines={1} ellipsizeMode="tail">{member.plan}</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{member.status === 'active' ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <ImageBackground source={{ uri: 'https://i.pravatar.cc/400?img=65' }} style={[styles.imageBg, styles.noImageBg]} imageStyle={styles.imageStyle}>
          <View style={styles.overlay} />

          <View style={styles.dateBadge}>
            <Calendar size={12} color={COLORS.white} />
            <Text style={styles.dateBadgeText}>{formatShortDate(member.join_date || member.plan_end_date || '')}</Text>
          </View>
          <View style={styles.bottomInfo}>
            <View style={styles.topRow}>
              <View style={styles.textBlock}>
                <Text style={styles.gridMemberNameSmall} numberOfLines={1} ellipsizeMode="tail">{member.name}</Text>
                <Text style={styles.gridMemberPlan} numberOfLines={1} ellipsizeMode="tail">{member.plan}</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{member.status === 'active' ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
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
    color: COLORS.white,
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 0,
    marginBottom: 12,
  // let FlatList column wrapper control spacing, make card flexible
  flex: 1,
  minWidth: 0,
  marginHorizontal: 6,
  alignItems: 'flex-start',
    ...SIZES.shadow,
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    overflow: Platform.OS === 'android' ? 'hidden' : undefined,
  },
  imageBg: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: COLORS.surfaceLight,
    position: 'relative',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  noImageBg: {
    backgroundColor: COLORS.surfaceLight,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6,4,10,0.38)'
  },
  imageWrap: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surfaceLight,
  },
  gridInitialsPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  gridInitialsText: {
    ...FONTS.h1,
    color: COLORS.primary,
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBody: {
    padding: 12,
    width: '100%',
  },
  gridMemberName: {
    ...FONTS.body4,
    color: COLORS.white,
    marginBottom: 2,
  },
  gridMemberPlan: {
    ...FONTS.body4,
    color: COLORS.lightGray,
    marginBottom: 8,
  },
  gridExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridExpiryText: {
    ...FONTS.body4,
    color: COLORS.lightGray,
    marginLeft: 6,
  },

  bottomInfo: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  textBlock: {
    flex: 1,
  },
  statusColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  gridMemberNameSmall: {
    ...FONTS.caption,
    color: COLORS.white,
    marginBottom: 4,
    maxWidth: 140,
    textAlign: 'left',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    width: '100%',
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rowRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  expiryText: {
    ...FONTS.caption,
    color: COLORS.lightGray,
    marginLeft: 6,
  },

  statusPillAbsolute: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 5,
  },

  // Overlays / badges
  statBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155,92,255,0.18)'
  },
  statBadgeText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontFamily: 'Inter-SemiBold',
  },
  statusPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    ...SIZES.shadow,
  },
  statusPillText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontFamily: 'Inter-Medium',
  },
  moreButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(20,19,26,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dateBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(155,92,255,0.12)',
    zIndex: 5,
  },
  dateBadgeText: {
    ...FONTS.caption,
    color: COLORS.white,
    marginLeft: 6,
  },
  portraitWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  portrait: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  portraitPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  percentText: {
    ...FONTS.h4,
    color: COLORS.lightGray,
  },
  planPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  planPillText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontFamily: 'Inter-Medium',
  },
});