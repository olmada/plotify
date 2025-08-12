import { Stack } from 'expo-router';

export default function TasksStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Tasks' }} />
      {/* Add other screens for the tasks stack here if needed */}
    </Stack>
  );
}