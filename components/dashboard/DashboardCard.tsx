import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  backgroundColor: string;
  isLoading?: boolean;
}

export default function DashboardCard({
  title,
  value,
  icon,
  backgroundColor,
  isLoading = false
}: DashboardCardProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SIZES.shadow,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.body4,
    color: COLORS.white,
    marginBottom: 4,
  },
  value: {
    ...FONTS.h2,
    color: COLORS.white,
  },
});