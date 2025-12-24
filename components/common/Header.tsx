import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

interface HeaderProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export default function Header({ 
  title, 
  leftIcon, 
  rightIcon, 
  onLeftPress, 
  onRightPress 
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {leftIcon && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onLeftPress}
          >
            {leftIcon}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightSection}>
        {rightIcon && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onRightPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  leftSection: {
    width: 40,
  },
  rightSection: {
    width: 40,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
});