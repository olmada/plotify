import { useLocalSearchParams, Link } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { getGardenBedById, getPlantsByBedId, getTasksByBedId } from '../../../src/services/api';
import { useFocusEffect } from 'expo-router';

export default function GardenBedDetailScreen() {
  const { id } = useLocalSearchParams();
  const [gardenBed, setGardenBed] = useState(null);
  const [plants, setPlants] = useState([]);
  const [tasks, setTasks] = useState([]); // New state for tasks
  const [loading, setLoading] = useState(true);

  const fetchGardenBedData = useCallback(async () => {
    try {
      setLoading(true);
      const [bedData, plantsData, tasksData] = await Promise.all([
        getGardenBedById(id),
        getPlantsByBedId(id),
        getTasksByBedId(id), // Fetch tasks for this bed
      ]);
      setGardenBed(bedData);
      setPlants(plantsData);
      setTasks(tasksData); // Set tasks state
    } catch (error) {
      console.error("Failed to fetch garden bed details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchGardenBedData();
    }, [fetchGardenBedData])
  );

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  if (!gardenBed) {
    return (
      <View style={styles.container}>
        <Text>Garden bed not found.</Text>
      </View>
    );
  }

  const renderPlantItem = ({ item }) => (
    <Link href={{ pathname: '/(tabs)/plants/[id]', params: { id: item.id } }} asChild>
      <Pressable style={styles.plantItem}>
        <Text style={styles.plantName}>{item.name}</Text>
      </Pressable>
    </Link>
  );

  const renderTaskItem = ({ item }) => (
    <Pressable style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      {item.plant && <Text style={styles.taskPlantName}>For: {item.plant.name}</Text>}
      <Text style={styles.taskDueDate}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{gardenBed.name}</Text>
      <Text style={styles.description}>{gardenBed.description}</Text>

      <Text style={styles.sectionTitle}>Plants in this Bed</Text>
      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No plants in this bed yet.</Text>}
      />

      <Text style={styles.sectionTitle}>Tasks for this Bed</Text>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks for this bed yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  plantItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  plantName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#007AFF', // Link color
    textDecorationLine: 'underline', // Underline text
  },
  taskItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  taskPlantName: {
    fontSize: 16,
    color: 'gray',
  },
  taskDueDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
});