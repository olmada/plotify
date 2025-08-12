import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // VALIDATION STEP: Log the state on each render.
  console.log(`[Auth State] loading: ${loading}, session: !!${session}, segments: [${segments.join(', ')}]`);

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (!session && inTabsGroup) {
      router.replace('/');
    } else if (session && !inTabsGroup) {
      router.replace('/(tabs)/plants');
    }
  }, [session, loading, segments]);

  // This is the key to preventing the race condition.
  // We prevent the <Stack> from rendering until we know the auth state.
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: 'Add New Plant', presentation: 'modal' }} />
      <Stack.Screen
        name="edit-plant/[id]"
        options={{ title: 'Edit Plant', presentation: 'modal' }}
      />
      <Stack.Screen
        name="add-entry/[plantId]"
        options={{ title: 'New Entry', presentation: 'modal' }}
      />
      <Stack.Screen
        name="add-task/[plantId]"
        options={{ title: 'New Task', presentation: 'modal' }}
      />
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