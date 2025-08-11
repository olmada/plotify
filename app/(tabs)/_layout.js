import { Tabs, Link } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // The header is now managed by the root stack layout,
        // so we can add the "Add" button to the plant list here.
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Plants',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" size={size} color={color} />,
          headerRight: () => (
            <Link href="/add" asChild>
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
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <Ionicons name="checkbox-outline" size={size} color={color} />,
        }}
      />
      {/* This hides the plant detail screen from the tab bar */}
      <Tabs.Screen name="[id]" options={{ href: null }} />
    </Tabs>
  );
}

