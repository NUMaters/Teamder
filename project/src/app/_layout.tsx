import React, { useEffect } from 'react';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';
import { View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  useFrameworkReady();
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isTopPage = segments[0] === undefined;

    if (!session && !inAuthGroup && !isTopPage) {
      // トップページ以外の未認証ページにアクセスした場合のみログインページにリダイレクト
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // 認証済みユーザーが認証グループのページにアクセスした場合
      router.replace('/');
    }
  }, [session, initialized, segments]);

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