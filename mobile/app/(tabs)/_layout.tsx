import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors } from '../../src/theme/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'web' ? 70 : 64,
          paddingBottom: Platform.OS === 'web' ? 14 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'SmartVoyage AI',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan Trip',
          headerTitle: 'Create AI Travel Plan',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          headerTitle: 'Explore Destinations',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'My Trips',
          headerTitle: 'Saved Itineraries',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Settings & Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
