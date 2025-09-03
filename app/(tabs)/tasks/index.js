import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllTasks, updateTask, createTask } from '../../../src/services/api';
import { RRule } from 'rrule';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '../../../constants/Colors';
import { Check, Circle, Settings, Calendar, Clock } from 'lucide-react-native';

export default function AllTasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('incomplete'); // incomplete, completed, all
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

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

  const handleRecurringTask = async (task) => {
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
  };

  const handleNonRecurringTask = async (task) => {
    try {
      const updatedTask = await updateTask(task.id, { completed: !task.completed });
      setTasks(currentTasks => currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (error) {
      Alert.alert("Error", "Could not update the task.");
    }
  };

  const handleToggleTask = (task) => {
    if (task.completed) {
      // Optionally, ask for confirmation to un-complete
      handleNonRecurringTask(task);
      return;
    }
    Alert.alert(
      "Confirm Task",
      `Are you sure you want to mark "${task.title}" as complete?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            if (task.recurring_rule) {
              handleRecurringTask(task);
            } else {
              handleNonRecurringTask(task);
            }
          },
        },
      ]
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  const renderTask = (task) => (
    <Card key={task.id} style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Button variant="ghost" size="icon" onPress={() => handleToggleTask(task)}>
          {task.completed ? <Check color={colors.primary} /> : <Circle color={colors.mutedForeground} />}
        </Button>
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontWeight: '500', textDecorationLine: task.completed ? 'line-through' : 'none', color: task.completed ? colors.mutedForeground : colors.foreground }}>
            {task.title}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: colors.mutedForeground }}>
            {task.plant?.name || task.bed?.name || 'General Task'}
          </ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Badge variant={new Date(task.due_date) < new Date() && !task.completed ? "destructive" : "outline"}>
            <Calendar size={12} color={colors.mutedForeground} />
            <ThemedText style={{ marginLeft: 4 }}>{new Date(task.due_date).toLocaleDateString()}</ThemedText>
          </Badge>
        </View>
      </View>
    </Card>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <ThemedView style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <ThemedText style={styles.headerTitle}>Tasks</ThemedText>
          <ThemedText style={{ color: colors.mutedForeground }}>What needs to be done</ThemedText>
        </View>
        <Button variant="ghost" size="sm" style={{ width: 40, height: 40, borderRadius: 20 }} onPress={() => router.push('/add-task')}>
          <Settings color={colors.mutedForeground} size={20} />
        </Button>
      </ThemedView>

      <View style={styles.filterContainer}>
        <Button variant={filter === 'incomplete' ? 'default' : 'outline'} size="sm" onPress={() => setFilter('incomplete')}>
          Incomplete
        </Button>
        <Button variant={filter === 'completed' ? 'default' : 'outline'} size="sm" onPress={() => setFilter('completed')}>
          Completed
        </Button>
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onPress={() => setFilter('all')}>
          All
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />
      ) : (
        <View style={styles.taskList}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderTask)
          ) : (
            <ThemedText style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 40 }}>
              No tasks in this category.
            </ThemedText>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  taskList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});
