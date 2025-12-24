import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, (style as any)]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          props.multiline && styles.multilineInput
        ]}
        placeholderTextColor={COLORS.darkGray}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...FONTS.body4,
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 12,
    ...FONTS.body3,
    color: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: 4,
  },
}); 