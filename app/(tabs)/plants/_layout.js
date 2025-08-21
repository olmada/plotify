import { Stack } from 'expo-router';

export default function PlantsStackLayout() {
  return (
    <Stack
      screenOptions={{
        // The header is shown by default in a stack navigator
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}