import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (session && !inTabsGroup) {
      // User is logged in, but not in the tabs group, redirect to tabs
      router.replace('/(tabs)');
    } else if (!session && inTabsGroup) {
      // User is not logged in, but in the tabs group, redirect to auth
      router.replace('/(auth)');
    }
    SplashScreen.hideAsync();
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="add-garden-bed" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="add-entry/[plantId]" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="add-task" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="edit-plant/[id]" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}