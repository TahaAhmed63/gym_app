import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SettingsLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="profile" />
        <Stack.Screen name="security" />
        <Stack.Screen name="gym-info" />
        <Stack.Screen name="plans" />
        <Stack.Screen name="batches" />
        <Stack.Screen name="staff" />
        <Stack.Screen name="automation" />
        <Stack.Screen name="help" />
        <Stack.Screen name="terms" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}