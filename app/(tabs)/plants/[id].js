import { useLocalSearchParams, useNavigation, Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, Image, FlatList, Pressable } from 'react-native';
import { getPlantById, deletePlant, getPlantTimeline, getTasksForPlant, updateTask, deleteTask } from '../../../src/services/api';
import { RRule } from 'rrule';
import { Ionicons } from '@expo/vector-icons';

// By defining the TaskList component outside of PlantDetailScreen,
// we prevent it from being re-created on every render, which is more performant.
const TaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return <Text style={styles.emptyText}>No tasks yet. Add one!</Text>;
  }

  return tasks.map((task) => (
    <View key={task.id} style={styles.taskContainer}>
      <Pressable onPress={() => onToggleTask(task)} style={styles.taskCheckbox}>
        {task.completed && <View style={styles.taskCheckboxInner} />}
      </Pressable>
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
        <Text style={styles.taskDueDate}>Due: {new Date(task.due_date).toLocaleDateString()}</Text>
      </View>
      <Pressable onPress={() => onDeleteTask(task.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={22} color="#ff3b30" />
      </Pressable>
    </View>
  ));
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  // Use `useNavigation` to get access to the navigation object for setting screen options.
  const navigation = useNavigation();
  const router = useRouter();

  const [plant, setPlant] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlantData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch plant details and the new unified timeline concurrently
      const [plantData, timelineData, tasksData] = await Promise.all([
        getPlantById(id),
        getPlantTimeline(id),
        getTasksForPlant(id),
      ]);
      setPlant(plantData);
      setTimeline(timelineData);
      setTasks(tasksData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch plant details.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // useFocusEffect runs every time the screen comes into focus.
  // It must be wrapped in a useCallback as per the hook's API.
  useFocusEffect(
    useCallback(() => {
      fetchPlantData();
    }, [fetchPlantData])
  );

  // Set header options dynamically after the plant data (and id) is available.
  useEffect(() => {
    if (plant) {
      navigation.setOptions({
        headerRight: () => (
          <Link href={{ pathname: '/edit-plant/[id]', params: { id: id } }} asChild>
            <Button title="Edit" />
          </Link>
        ),
      });
    }
  }, [navigation, plant, id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Plant",
      "Are you sure you want to permanently delete this plant and all its data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePlant(id);
              Alert.alert("Success", "Plant deleted.");
              router.replace('/(tabs)/plants/'); // Go back to the list and remove this page from history
            } catch (error) {
              Alert.alert("Error", "Could not delete the plant.");
              console.error("Deletion error:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleToggleTask = async (task) => {
    // If the task is recurring, calculate the next due date
    if (task.recurring_rule) {
      try {
        // The start date for recurrence is the current due date
        const rule = RRule.fromString(`DTSTART=${task.due_date}\n${task.recurring_rule}`);
        const next = rule.after(new Date());

        // If there is a next date, update the task. Otherwise, this will be null.
        const updatedTask = next ? await updateTask(task.id, { due_date: next.toISOString() }) : null;

        // If the task was updated, replace it in the list. Otherwise, filter it out (mark as complete).
        setTasks(currentTasks => 
          updatedTask 
            ? currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            : currentTasks.filter(t => t.id !== task.id)
        );
      } catch (error) {
        Alert.alert("Error", "Could not update recurring task.");
        console.error("Recurring task update error:", error);
      }
    } else {
      // This block handles non-recurring tasks.
      try {
        await updateTask(task.id, { completed: true });
        setTasks(currentTasks => currentTasks.filter(t => t.id !== task.id));
      } catch (error) {
        Alert.alert("Error", "Could not update the task.");
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
    } catch (error) {
      Alert.alert("Error", "Could not delete the task.");
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Plant not found.</Text>
      </View>
    );
  }

  const renderTimelineItem = ({ item }) => {
    switch (item.type) {
      case 'photo':
        return <Image source={{ uri: item.data.url }} style={styles.timelinePhoto} />;
      case 'journal':
        return (
          <View style={styles.journalEntry}>
            {/* If the journal entry has a photo, display it */}
            {item.data.photo_url && (
              <Image source={{ uri: item.data.photo_url }} style={styles.timelinePhoto} />
            )}
            <Text style={styles.journalDate}>{new Date(item.timestamp).toLocaleString()}</Text>
            {/* Only render the text if it exists */}
            {item.data.text && <Text style={styles.journalText}>{item.data.text}</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <FlatList
      style={styles.container}
      data={timeline}
      keyExtractor={(item) => item.id}
      renderItem={renderTimelineItem}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{plant.name}</Text>
          <Text style={styles.subtitle}>{plant.variety?.common_name}</Text>
          <Text style={styles.notes}>{plant.notes}</Text>

          <View style={styles.buttonContainer}>
            {/* This button now navigates to a unified entry screen */}
            <Link href={{ pathname: '/add-entry/[plantId]', params: { plantId: id } }} asChild>
              <Button title="New Entry" />
            </Link>
            <Link href={{ pathname: '/add-task', params: { plantId: id } }} asChild>
              <Button title="New Task" />
            </Link>
          </View>

          <Text style={styles.sectionTitle}>Timeline</Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No photos or journal entries yet. Add one!</Text>
      }
      ListFooterComponent={
        <>
          <Text style={styles.sectionTitle}>Tasks</Text>
          {/* Use the new TaskList sub-component */}
          <TaskList tasks={tasks} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} />

          <View style={styles.dangerZone}>
            <Button title="Delete Plant" onPress={handleDelete} color="#ff3b30" />
          </View>
        </>
      }
    />
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
  subtitle: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 16,
  },
  notes: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  timelinePhoto: {
    width: '100%',
    aspectRatio: 4 / 3, // Maintain aspect ratio
    borderRadius: 8,
    marginBottom: 12, // Add margin bottom to separate from text if both exist
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray'
  },
  journalEntry: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  journalDate: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
  },
  journalText: { fontSize: 16, lineHeight: 22 },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
 alignItems: 'center',
  },
  taskCheckboxInner: {
    width: 14,
    height: 14,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  taskDueDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
});
