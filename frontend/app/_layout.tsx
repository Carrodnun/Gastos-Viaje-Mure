import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';

// Define a simple theme to avoid navigation errors
const lightTheme = {
  dark: false,
  colors: {
    primary: '#4F46E5',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    border: '#E5E7EB',
    notification: '#EF4444',
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#F9FAFB' }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/[id]" />
        <Stack.Screen name="expense/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="expense/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
