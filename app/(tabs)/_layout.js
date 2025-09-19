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
          title: 'JOURNAL',
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
          title: 'ADD',
        }}
      />
      <Tabs.Screen
        name="beds"
        options={{
          title: 'BEDS',
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