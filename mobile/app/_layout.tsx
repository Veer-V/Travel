import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppLightTheme, colors } from '../src/theme/theme';
import { useAuthStore } from '../src/store/useAuthStore';
import { useTripStore } from '../src/store/useTripStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const loadSavedTrips = useTripStore((s) => s.loadSavedTrips);

  useEffect(() => {
    initializeAuth();
    loadSavedTrips();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={AppLightTheme}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="destination/[id]"
              options={{ title: 'Destination Details', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="trip/[id]"
              options={{ title: 'Your AI Itinerary', headerBackTitle: 'Trips' }}
            />
            <Stack.Screen
              name="trip/safety"
              options={{ title: 'Destination Safety Dashboard', headerBackTitle: 'Itinerary' }}
            />
            <Stack.Screen
              name="trip/budget"
              options={{ title: 'Trip Budget & Expenses', headerBackTitle: 'Itinerary' }}
            />
            <Stack.Screen
              name="trip/map"
              options={{ title: 'Interactive Route Map', headerBackTitle: 'Itinerary' }}
            />
            <Stack.Screen
              name="auth/login"
              options={{ title: 'Sign In / Guest Mode', presentation: 'modal' }}
            />
            <Stack.Screen
              name="auth/register"
              options={{ title: 'Create Account', presentation: 'modal' }}
            />
          </Stack>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
