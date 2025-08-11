// File: mobile/app/(app)/_layout.js
import { Stack, Link } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "My Plants",
          headerRight: () => (
            <Link href="/(app)/add" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="add-circle"
                    size={30}
                    color="#007AFF"
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Plant Details",
        }}
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: "Add New Plant", 
          presentation: 'modal' 
        }} 
      />
      <Stack.Screen
        name="edit-plant/[id]"
        options={{
          title: "Edit Plant",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-journal/[plantId]"
        options={{
          title: "New Journal Entry",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-photo-entry/[plantId]"
        options={{
          title: "New Photo Entry",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-photo-entry/[plantId]"
        options={{
          title: "New Photo Entry",
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}