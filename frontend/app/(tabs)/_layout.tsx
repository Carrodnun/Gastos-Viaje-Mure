import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/constants/colors';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabItem = {
  name: string;
  label: string;
  iconFocused: string;
  iconOutline: string;
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const isApproverOrAdmin = user?.role === 'approver' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const tabConfig: Record<string, { label: string; iconFocused: string; iconOutline: string; visible: boolean }> = {
    home: { label: 'Inicio', iconFocused: 'home', iconOutline: 'home-outline', visible: true },
    trips: { label: 'Viajes', iconFocused: 'airplane', iconOutline: 'airplane-outline', visible: true },
    'create-trip': { label: 'Nuevo', iconFocused: 'add-circle', iconOutline: 'add-circle-outline', visible: true },
    approvals: { label: 'Aprobar', iconFocused: 'checkmark-circle', iconOutline: 'checkmark-circle-outline', visible: isApproverOrAdmin },
    admin: { label: 'Admin', iconFocused: 'settings', iconOutline: 'settings-outline', visible: isAdmin },
    profile: { label: 'Perfil', iconFocused: 'person', iconOutline: 'person-outline', visible: true },
  };

  return (
    <View style={[tabBarStyles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route: any, index: number) => {
        const config = tabConfig[route.name];
        if (!config || !config.visible) return null;

        const isFocused = state.index === index;
        const color = isFocused ? COLORS.primary : COLORS.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={tabBarStyles.tab}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(isFocused ? config.iconFocused : config.iconOutline) as any}
              size={22}
              color={color}
            />
            <Text style={[tabBarStyles.label, { color }]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(60, 60, 67, 0.12)',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="create-trip" />
      <Tabs.Screen name="approvals" />
      <Tabs.Screen name="admin" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
