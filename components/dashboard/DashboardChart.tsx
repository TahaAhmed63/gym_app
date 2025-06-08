import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardChartProps {
  data: Array<{ month: string; revenue: number }>;
  isLoading: boolean;
}

// Map country names to country codes
const COUNTRY_TO_CODE: Record<string, string> = {
  'Pakistan': 'PK',
  'India': 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'Singapore': 'SG',
  'Australia': 'AU',
  'Canada': 'CA',
  'European Union': 'EU',
};

export default function DashboardChart({ data, isLoading }: DashboardChartProps) {
  const { user } = useAuth();
  const countryCode = user?.country ? COUNTRY_TO_CODE[user.country] || 'US' : 'US';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chart data...</Text>
      </View>
    );
  }

  // Calculate the maximum value to determine the chart height ratio
  const maxValue = Math.max(...data.map(item => item.revenue), 0);
  
  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 0;
    // Calculate percentage and convert to height (max height is 150)
    return (value / maxValue) * 150;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barValue}>
                {formatCurrency(item.revenue, countryCode, { 
                  showSymbol: true,
                  maximumFractionDigits: 0
                })}
              </Text>
            </View>
            
            <View
              style={[
                styles.bar,
                {
                  height: getBarHeight(item.revenue),
                  backgroundColor: COLORS.primary,
                }
              ]}
            />
            
            <Text style={styles.monthLabel}>{item.month}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 24,
  },
  barColumn: {
    alignItems: 'center',
    width: (Dimensions.get('window').width - 80) / 6,
  },
  barLabelContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
  },
  barValue: {
    ...FONTS.caption,
    color: COLORS.darkGray,
  },
  bar: {
    width: (Dimensions.get('window').width - 80) / 6 - 8,
    minHeight: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  monthLabel: {
    ...FONTS.caption,
    color: COLORS.darkGray,
    marginTop: 8,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
});