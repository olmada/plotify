import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getPlants, getAllTasks } from '../../../src/services/api';
import { useAuth } from '../../../src/context/AuthContext';
import HomeScreenHeader from '../../../components/HomeScreenHeader';
import PlantList from '../../../components/PlantList';

export default function PlantListScreen() {
  const [plants, setPlants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { session } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const [plantData, taskData] = await Promise.all([getPlants(), getAllTasks()]);
      setPlants(plantData);
      setTasks(taskData.filter(t => !t.completed));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const userName = session?.user?.email?.split('@')[0] || 'Gardener';

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  return (
    <View style={styles.container}>
      <HomeScreenHeader
        userName={userName}
        plantsCount={plants.length}
        tasksCount={tasks.length}
      />
      <PlantList plants={plants} />
      <Pressable style={styles.fab} onPress={() => router.push('/add')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
  },
});