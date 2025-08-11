import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for the session to load
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    // If the user is signed in and the initial segment is not the tabs group,
    // redirect them to the main app.
    if (session && !inTabsGroup) {
      router.replace('/(tabs)');
    } 
    // If the user is not signed in and the initial segment is in the tabs group,
    // redirect them to the login page.
    else if (!session && inTabsGroup) {
      router.replace('/');
    }
  }, [session, loading, segments]);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add New Plant',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit-plant/[id]"
        options={{
          title: 'Edit Plant',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-entry/[plantId]"
        options={{
          title: 'New Entry',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-task/[plantId]"
        options={{
          title: 'New Task',
          presentation: 'modal',
        }}
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