import { useLocalSearchParams, useNavigation, Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { getPlantById, deletePlant, getPlantTimeline, getTasksForPlant, updateTask, deleteTask } from '../../../src/services/api';
import { RRule } from 'rrule';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Collapsible } from '../../../components/Collapsible';

// --- Helper Components ---

const InfoAttribute = ({ icon, label, value }) => (
  <View style={styles.attributeContainer}>
    <MaterialCommunityIcons name={icon} size={24} color="#006400" style={styles.attributeIcon} />
    <View>
      <Text style={styles.attributeLabel}>{label}</Text>
      <Text style={styles.attributeValue}>{value}</Text>
    </View>
  </View>
);

const TaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return <Text style={styles.emptyText}>No tasks here. Well done!</Text>;
  }

  return tasks.map((task) => {
    const isOverdue = new Date(task.due_date) < new Date() && !task.completed;
    return (
      <View key={task.id} style={styles.taskContainer}>
        <Pressable onPress={() => onToggleTask(task)} style={styles.taskCheckbox}>
          {task.completed && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
        </Pressable>
        <View style={styles.taskTextContainer}>
          <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
          <Text style={[styles.taskDueDate, isOverdue && styles.taskDueDateOverdue]}>
            Due: {new Date(task.due_date).toLocaleDateString()}
          </Text>
        </View>
        <Pressable onPress={() => onDeleteTask(task.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#888" />
        </Pressable>
      </View>
    );
  });
};

const TimelineItem = ({ item }) => {
  if (item.type === 'journal' || item.type === 'photo') {
    const hasText = item.data.text && item.data.text.trim().length > 0;
    const hasPhoto = item.data.photo_url || item.data.url;

    return (
      <View style={styles.timelineItem}>
        {hasPhoto && (
          <Image source={{ uri: item.data.photo_url || item.data.url }} style={styles.timelinePhoto} />
        )}
        <View style={styles.timelineContent}>
          <Text style={styles.timelineDate}>{new Date(item.timestamp).toLocaleString()}</Text>
          {hasText && <Text style={styles.timelineText}>{item.data.text}</Text>}
        </View>
      </View>
    );
  }
  return null;
};


// --- Main Screen Component ---

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const [plant, setPlant] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlantData = useCallback(async () => {
    try {
      setLoading(true);
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

  useFocusEffect(useCallback(() => {
    fetchPlantData();
  }, [fetchPlantData]));

  useEffect(() => {
    if (plant) {
      navigation.setOptions({
        headerTitle: plant.name,
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#333',
        },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginLeft: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#006400" />
          </Pressable>
        ),
        headerRight: () => (
          <Link href={{ pathname: '/edit-plant/[id]', params: { id: id } }} asChild>
            <Pressable>
              <Text style={styles.headerButton}>Edit</Text>
            </Pressable>
          </Link>
        ),
        headerStyle: { backgroundColor: '#FFFFFF' }, // Light header background
        headerTintColor: '#000000', // Dark header text
      });
    }
  }, [navigation, plant, id, router]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Plant",
      "Are you sure you want to permanently delete this plant and all its data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePlant(id);
              router.replace('/(tabs)/plants/');
            } catch (error) {
              Alert.alert("Error", "Could not delete the plant.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleToggleTask = async (task) => {
    if (task.recurring_rule) {
        const rule = RRule.fromString(`DTSTART=${task.due_date}\n${task.recurring_rule}`);
        const next = rule.after(new Date());
        const updatedTask = next ? await updateTask(task.id, { due_date: next.toISOString() }) : null;
        setTasks(currentTasks => 
          updatedTask 
            ? currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            : currentTasks.filter(t => t.id !== task.id)
        );
    } else {
      await updateTask(task.id, { completed: true });
      setTasks(currentTasks => currentTasks.filter(t => t.id !== task.id));
    }
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#006400" /></View>;
  }

  if (!plant) {
    return <View style={styles.container}><Text style={styles.emptyText}>Plant not found.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Collapsible title="Information">
          <View style={styles.attributesGrid}>
            <InfoAttribute icon="seed" label="Planted From" value={plant.planted_from_seed ? 'Seed' : 'Seedling'} />
            {plant.planted_date && <InfoAttribute icon="calendar-check" label="Planted Date" value={new Date(plant.planted_date).toLocaleDateString()} />}
            {plant.transplanted_date && <InfoAttribute icon="arrow-up-bold-box-outline" label="Transplanted Date" value={new Date(plant.transplanted_date).toLocaleDateString()} />}
            {plant.expected_harvest_date && <InfoAttribute icon="calendar-star" label="Expected Harvest" value={new Date(plant.expected_harvest_date).toLocaleDateString()} />}
            {plant.family && <InfoAttribute icon="leaf" label="Family" value={plant.family} />}
            {plant.purchase_date && <InfoAttribute icon="cart" label="Purchase Date" value={new Date(plant.purchase_date).toLocaleDateString()} />}
            {plant.garden_bed && <InfoAttribute icon="bed-empty" label="Garden Bed" value={plant.garden_bed.name} />}
          </View>
          {plant.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{plant.notes}</Text>
            </View>
          )}
        </Collapsible>

        <Collapsible title="Timeline">
          <Link href={{ pathname: '/add-entry/[plantId]', params: { plantId: id } }} asChild>
            <Pressable style={styles.actionButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>New Entry</Text>
            </Pressable>
          </Link>
          {timeline.length === 0 ? (
            <Text style={styles.emptyText}>No timeline entries yet.</Text>
          ) : (
            timeline.map((item) => <TimelineItem key={item.id} item={item} />)
          )}
        </Collapsible>

        <Collapsible title="Tasks">
          <Link href={{ pathname: '/add-task', params: { plantId: id } }} asChild>
            <Pressable style={styles.actionButton}>
              <Ionicons name="checkbox-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>New Task</Text>
            </Pressable>
          </Link>
          <TaskList tasks={tasks} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} />
        </Collapsible>

        <View style={styles.dangerZone}>
          <Pressable onPress={handleDelete} style={styles.deletePlantButton}>
            <Text style={styles.deletePlantButtonText}>Delete Plant</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light background
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Light background
  },
  headerButton: {
    color: '#006400',
    fontSize: 16,
    marginRight: 8,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attributeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 20,
  },
  attributeIcon: {
    marginRight: 12,
  },
  attributeLabel: {
    fontSize: 14,
    color: '#666666', // Medium dark text
    marginBottom: 2,
  },
  attributeValue: {
    fontSize: 16,
    color: '#333333', // Dark text
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#FFFFFF', // White background for notes card
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  notesTitle: {
    fontSize: 14,
    color: '#666666', // Medium dark text
    marginBottom: 4,
  },
  notesText: {
    fontSize: 16,
    color: '#333333', // Dark text
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006400', // Dark green accent
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF', // White text on dark green button
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#888',
    fontSize: 16,
  },
  timelineItem: {
    backgroundColor: '#FFFFFF', // White background for timeline item
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  timelinePhoto: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  timelineContent: {
    padding: 16,
  },
  timelineDate: {
    fontSize: 12,
    color: '#666666', // Medium dark text
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 16,
    color: '#333333', // Dark text
    lineHeight: 22,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background for task item
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#006400', // Dark green border
    backgroundColor: '#006400', // Dark green background when checked
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333333', // Dark text
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#666666', // Medium dark text
    marginTop: 4,
  },
  taskDueDateOverdue: {
    color: '#E57373',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  deletePlantButton: {
    borderWidth: 1,
    borderColor: '#E57373',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deletePlantButtonText: {
    color: '#E57373',
    fontSize: 16,
    fontWeight: 'bold',
  },
});