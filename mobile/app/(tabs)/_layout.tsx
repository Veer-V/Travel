import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
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
