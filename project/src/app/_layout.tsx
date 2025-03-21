import { useEffect, useState } from 'react';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';
import { View } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state before any navigation
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const inAuthGroup = segments[0] === '(auth)';

        if (!initialized) {
          setInitialized(true);
          
          if (session && inAuthGroup) {
            // Logged in, trying to access auth page -> redirect to home
            router.replace('/(tabs)');
          } else if (!session && !inAuthGroup) {
            // Not logged in, trying to access protected page -> redirect to login
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setInitialized(true); // Still set initialized to prevent infinite loading
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!initialized) return; // Don't handle navigation until initialized

      const inAuthGroup = segments[0] === '(auth)';

      if (event === 'SIGNED_IN' && inAuthGroup) {
        router.replace('/(tabs)');
      } else if (event === 'SIGNED_OUT' && !inAuthGroup) {
        router.replace('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [segments, initialized]);

  // Show a loading state while initializing
  if (!initialized) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Slot />
      </View>
    );
  }

  // Render the stack navigator only after initialization
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}