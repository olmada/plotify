import { Tabs } from 'expo-router';
import NewTabBar from '../../components/ui/NewTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <NewTabBar {...props} />}
    >
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: 'Plants',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
        }}
      />
      <Tabs.Screen
        name="beds"
        options={{
          title: 'Beds',
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
            title: 'Tasks',
        }}
      />
    </Tabs>
  );
}
