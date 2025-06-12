import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useAuth } from '@/contexts/AuthContext';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface DashboardChartProps {
  data: Array<{ month: string; revenue: number }>;
  isLoading: boolean;
}

// Map country names to country codes
export const COUNTRY_TO_CODE: Record<string, string> = {
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

  const width = Dimensions.get('window').width - 40;
  const height = 200;
  const padding = 20;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Calculate the maximum value to determine the chart height ratio
  const maxValue = Math.max(...data.map(item => item.revenue), 0);
  const minValue = Math.min(...data.map(item => item.revenue), 0);
  
  const getY = (value: number) => {
    const range = maxValue - minValue;
    if (range === 0) return chartHeight;
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  const getX = (index: number) => {
    return (index / (data.length - 1)) * chartWidth;
  };

  // Generate path for the line
  const path = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item.revenue);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate points for the circles
  const points = data.map((item, index) => ({
    x: getX(index),
    y: getY(item.revenue),
    value: item.revenue
  }));

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <G x={padding} y={padding}>
          {/* Grid lines */}
          <Path
            d={`M 0 ${chartHeight} H ${chartWidth}`}
            stroke={COLORS.lightGray}
            strokeWidth="1"
          />
          
          {/* Line chart */}
          <Path
            d={path}
            stroke={COLORS.primary}
            strokeWidth="2"
            fill="none"
          />
          
          {/* Points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={point.value >= (points[index - 1]?.value || 0) ? COLORS.success : COLORS.error}
            />
          ))}
        </G>
      </Svg>

      {/* Labels */}
      <View style={styles.labelsContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.labelColumn}>
            <Text style={styles.valueLabel}>
              {formatCurrency(item.revenue, countryCode, { 
                showSymbol: true,
                maximumFractionDigits: 0
              })}
            </Text>
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
  labelsContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    gap:0,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  labelColumn: {
    alignItems: 'center',
    width: (Dimensions.get('window').width - 70) / 12,
  },
  valueLabel: {
    fontSize:6,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  monthLabel: {
    fontSize:6,
    color: COLORS.darkGray,
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