import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllTasks, updateTask, createTask } from '../../../src/services/api';
import { RRule } from 'rrule';
import Card from '../../../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

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
                  await updateTask(task.id, { completed: true, owner_id: task.owner_id });
                  const newTaskData = {
                    ...task,
                    bed_id: undefined,
                    garden_bed_id: task.garden_bed_id || task.bed_id,
                    due_date: next.toISOString(),
                    completed: false,
                    id: undefined,
                    created_at: undefined,
                    updated_at: undefined,
                  };
                  const newRecurringTask = await createTask(newTaskData);
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
    <Card style={[styles.taskContainer, item.completed && styles.completedTaskContainer]}>
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
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>
      <View style={styles.filterContainer}>
        <Pressable style={[styles.filterButton, filter === 'incomplete' && styles.activeFilter]} onPress={() => setFilter('incomplete')}> 
          <Text style={styles.filterButtonText}>Incomplete</Text>
        </Pressable>
        <Pressable style={[styles.filterButton, filter === 'completed' && styles.activeFilter]} onPress={() => setFilter('completed')}> 
          <Text style={styles.filterButtonText}>Completed</Text>
        </Pressable>
        <Pressable style={[styles.filterButton, filter === 'all' && styles.activeFilter]} onPress={() => setFilter('all')}> 
          <Text style={styles.filterButtonText}>All</Text>
        </Pressable>
      </View>
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks in this category.</Text>}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/add-task')}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#eee' },
  activeFilter: { backgroundColor: '#007AFF' },
  filterButtonText: { color: '#000', fontWeight: 'bold' },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTaskContainer: { backgroundColor: '#e0e0e0' },
  completedTaskText: { textDecorationLine: 'line-through', color: '#999' },
  taskCheckbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#007AFF', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  taskCheckboxInner: { width: 14, height: 14, backgroundColor: '#007AFF', borderRadius: 2 },
  taskTextContainer: { flex: 1 },
  taskTitle: { fontSize: 18, fontWeight: '500' },
  taskPlantName: { fontSize: 14, color: 'gray', marginVertical: 2 },
  taskDueDate: { fontSize: 12, color: 'gray' },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});