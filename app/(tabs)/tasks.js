import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getAllTasks, updateTask } from '../../src/services/api';
import { RRule } from 'rrule';

export default function AllTasksScreen() {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadTasks = async () => {
        try {
          setLoading(true);
          const data = await getAllTasks();
          setTasks(data);
        } catch (error) {
          console.error("Failed to fetch all tasks:", error);
          Alert.alert("Error", "Could not load tasks.");
        } finally {
          setLoading(false);
        }
      };
      loadTasks();
    }, [])
  );

  const handleToggleTask = async (task) => {
    if (task.recurring_rule) {
      try {
        const rule = RRule.fromString(`DTSTART=${task.due_date}\n${task.recurring_rule}`);
        const next = rule.after(new Date());
        if (next) {
          const updatedTask = await updateTask(task.id, { due_date: next.toISOString() });
          setTasks(currentTasks => currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
        } else {
          await updateTask(task.id, { completed: true });
          setTasks(currentTasks => currentTasks.filter(t => t.id !== task.id));
        }
      } catch (error) {
        Alert.alert("Error", "Could not update recurring task.");
      }
    } else {
      try {
        await updateTask(task.id, { completed: true });
        setTasks(currentTasks => currentTasks.filter(t => t.id !== task.id));
      } catch (error) {
        Alert.alert("Error", "Could not update the task.");
      }
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <Pressable onPress={() => handleToggleTask(item)} style={styles.taskCheckbox}>
        {/* This will now render the inner checkmark when a recurring task is completed */}
      </Pressable>
      <View style={styles.taskTextContainer}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskPlantName}>{item.plant?.name || 'General Task'}</Text>
        <Text style={styles.taskDueDate}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Upcoming Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No upcoming tasks!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, paddingTop: 40 },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
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
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxInner: {
    width: 14,
    height: 14,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  taskTextContainer: { flex: 1 },
  taskTitle: { fontSize: 18, fontWeight: '500' },
  taskPlantName: { fontSize: 14, color: 'gray', marginVertical: 2 },
  taskDueDate: { fontSize: 12, color: 'gray' },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
});