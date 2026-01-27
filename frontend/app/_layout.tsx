import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#F9FAFB' }
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="trip/[id]" 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="expense/create" 
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen 
            name="expense/[id]" 
            options={{ headerShown: false }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
