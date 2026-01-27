import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';

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
