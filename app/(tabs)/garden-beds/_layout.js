import { Stack } from 'expo-router';

export default function GardenBedsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Garden Beds' }} />
    </Stack>
  );
}