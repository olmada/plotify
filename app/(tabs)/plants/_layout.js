import { Stack } from 'expo-router';

export default function PlantsStackLayout() {
  return (
    <Stack
      screenOptions={{
        // The header is shown by default in a stack navigator
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Plants' }} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}