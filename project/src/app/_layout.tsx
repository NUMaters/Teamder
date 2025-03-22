import React from 'react';
import { Stack } from 'expo-router';
import 'react-native-gesture-handler';

export default function RootLayout() {
  useFrameworkReady();
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isTopPage = segments.length === 0;

    if (!session && !inAuthGroup && !isTopPage) {
      // 認証されていない場合、ログインページにリダイレクト
      router.replace('/login');
    } else if (session && (inAuthGroup || isTopPage)) {
      // 認証されている場合、タブページにリダイレクト
      router.replace('/(tabs)');
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
    <Stack screenOptions={{ headerShown: false }} />
  );
}