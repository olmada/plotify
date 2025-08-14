import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert, Button } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllTasks, updateTask, createTask } from '../../../src/services/api';
import { RRule } from 'rrule';

export default function AllTasksScreen() {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('incomplete'); // incomplete, completed, all
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadTasks = async () => {
        try {
          setLoading(true);
          const data = await getAllTasks();
          setTasks(data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
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
    Alert.alert(
      "Confirm Task",
      `Are you sure you want to mark "${task.title}" as complete?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            if (task.recurring_rule) {
              try {
                const rule = RRule.fromString(`DTSTART=${new Date(task.due_date).toISOString().replace(/[-:]|\.\d{3}/g, '')}\n${task.recurring_rule}`);
                const next = rule.after(new Date());
                if (next) {
                  // Mark current task as completed
                  await updateTask(task.id, { completed: true, owner_id: task.owner_id });

                  // Create a new task for the next recurrence
                  const newTaskData = {
                    ...task,
                    bed_id: undefined, // Explicitly remove bed_id
                    garden_bed_id: task.garden_bed_id || task.bed_id, // Ensure garden_bed_id is set
                    due_date: next.toISOString(),
                    completed: false, // New task is incomplete
                    id: undefined, // Supabase will generate a new ID
                    created_at: undefined, // Supabase will set new created_at
                    updated_at: undefined, // Supabase will set new updated_at
                  };
                  const newRecurringTask = await createTask(newTaskData);

                  // Update the state to reflect both changes
                  setTasks(currentTasks => {
                    const updated = currentTasks.map(t => t.id === task.id ? { ...t, completed: true } : t);
                    return [...updated, newRecurringTask].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
                  });

                } else {
                  const updatedTask = await updateTask(task.id, { completed: true });
                  setTasks(currentTasks => currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                }
              } catch (error) {
                console.error("Error updating recurring task:", error);
                Alert.alert("Error", "Could not update recurring task.");
              }
            } else {
              try {
                const updatedTask = await updateTask(task.id, { completed: !task.completed });
                setTasks(currentTasks => currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
              } catch (error) {
                Alert.alert("Error", "Could not update the task.");
              }
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  const renderTask = ({ item }) => (
    <View style={[styles.taskContainer, item.completed && styles.completedTaskContainer]}>
      <Pressable onPress={() => handleToggleTask(item)} style={styles.taskCheckbox}>
        {item.completed && <View style={styles.taskCheckboxInner} />}
      </Pressable>
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskTitle, item.completed && styles.completedTaskText]}>{item.title}</Text>
        <Text style={styles.taskPlantName}>
          {item.plant?.name || item.bed?.name || 'General Task'}
        </Text>
        <Text style={styles.taskDueDate}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonGroup}>
        <Button title="New Task" onPress={() => router.push('/add-task')} />
        <Button title="Incomplete" onPress={() => setFilter('incomplete')} disabled={filter === 'incomplete'} />
        <Button title="Completed" onPress={() => setFilter('completed')} disabled={filter === 'completed'} />
        <Button title="All" onPress={() => setFilter('all')} disabled={filter === 'all'} />
      </View>
      <Text style={styles.header}>All Upcoming Tasks</Text>
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks in this category.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, paddingTop: 40 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
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
  completedTaskContainer: {
    backgroundColor: '#e0e0e0',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
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