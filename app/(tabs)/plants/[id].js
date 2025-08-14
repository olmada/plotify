import { useLocalSearchParams, useNavigation, Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { getPlantById, deletePlant, getPlantTimeline, getTasksForPlant, updateTask, deleteTask } from '../../../src/services/api';
import { RRule } from 'rrule';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Collapsible } from '../../../components/Collapsible';
import Card from '../../../components/ui/Card';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate } from 'react-native-reanimated';
import DynamicHeader from '../../../components/DynamicHeader';

// --- Helper Components ---

const StatItem = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <MaterialCommunityIcons name={icon} size={24} color="#006400" />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const TaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return <Text style={styles.emptyText}>No tasks here. Well done!</Text>;
  }

  return tasks.map((task) => {
    const isOverdue = new Date(task.due_date) < new Date() && !task.completed;
    return (
      <Card key={task.id} style={styles.taskCard}>
        <View style={styles.taskContainer}>
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
      </Card>
    );
  });
};

const TimelineItem = ({ item }) => {
  if (item.type === 'journal' || item.type === 'photo') {
    const hasText = item.data.text && item.data.text.trim().length > 0;
    const hasPhoto = item.data.photo_url || item.data.url;

    return (
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {hasPhoto && (
          <Image source={{ uri: item.data.photo_url || item.data.url }} style={styles.timelinePhoto} />
        )}
        <View style={styles.timelineContent}>
          <Text style={styles.timelineDate}>{new Date(item.timestamp).toLocaleString()}</Text>
          {hasText && <Text style={styles.timelineText}>{item.data.text}</Text>}
        </View>
      </Card>
    );
  }
  return null;
};

const PlantDetailSkeleton = () => (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.heroImage, styles.skeleton]} />
        <View style={styles.statsContainer}>
            <View style={styles.skeletonStat} />
            <View style={styles.skeletonStat} />
            <View style={styles.skeletonStat} />
        </View>
        <Card style={styles.skeletonCard}>
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />
        </Card>
        <Card style={styles.skeletonCard}>
            <View style={styles.skeletonText} />
        </Card>
      </Animated.ScrollView>
    </SafeAreaView>
);


// --- Main Screen Component ---

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const [plant, setPlant] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsExpanded, setStatsExpanded] = useState(false);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

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
        header: (props) => <DynamicHeader {...props} scrollY={scrollY} plantName={plant.name} plantId={id} />,
      });
    }
  }, [navigation, plant, id, scrollY]);

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
    return <PlantDetailSkeleton />;
  }

  if (!plant) {
    return <View style={styles.container}><Text style={styles.emptyText}>Plant not found.</Text></View>;
  }

  const allStats = [
    { icon: 'seed', label: 'Planted From', value: plant.planted_from_seed ? 'Seed' : 'Seedling' },
    plant.garden_bed && { icon: 'bed-empty', label: 'Garden Bed', value: plant.garden_bed.name },
    plant.planted_date && { icon: 'calendar-check', label: 'Planted Date', value: new Date(plant.planted_date).toLocaleDateString() },
    plant.transplanted_date && { icon: 'arrow-up-bold-box-outline', label: 'Transplanted Date', value: new Date(plant.transplanted_date).toLocaleDateString() },
    plant.expected_harvest_date && { icon: 'calendar-star', label: 'Expected Harvest', value: new Date(plant.expected_harvest_date).toLocaleDateString() },
    plant.family && { icon: 'leaf', label: 'Family', value: plant.family },
    plant.purchase_date && { icon: 'cart', label: 'Purchase Date', value: new Date(plant.purchase_date).toLocaleDateString() },
  ].filter(Boolean);

  const displayedStats = statsExpanded ? allStats : allStats.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* New Hero Image */}
        <Image 
          source={{ uri: plant.profile_image_url || (timeline[0] && timeline[0].data.photo_url) }} 
          style={styles.heroImage} 
        />

        <View style={[styles.statsContainer, statsExpanded && styles.statsContainerExpanded]}>
          {displayedStats.map(stat => <StatItem key={stat.label} {...stat} />)}
        </View>
        {allStats.length > 3 && (
            <Pressable onPress={() => setStatsExpanded(!statsExpanded)} style={styles.showMoreButton}>
                <Text style={styles.showMoreButtonText}>{statsExpanded ? 'Show Less' : 'Show More'}</Text>
            </Pressable>
        )}

        <Collapsible 
          title="Timeline"
          headerRight={
            <Link href={{ pathname: '/add-entry/[plantId]', params: { plantId: id } }} asChild>
              <Pressable style={styles.headerActionButton}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.headerActionButtonText}>New Entry</Text>
              </Pressable>
            </Link>
          }
        >
          {timeline.length === 0 ? (
            <Text style={styles.emptyText}>No timeline entries yet.</Text>
          ) : (
            timeline.map((item) => <TimelineItem key={item.id} item={item} />)
          )}
        </Collapsible>

        <Collapsible 
          title="Tasks"
          headerRight={
            <Link href={{ pathname: '/add-task', params: { plantId: id } }} asChild>
              <Pressable style={styles.headerActionButton}>
                <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" />
                <Text style={styles.headerActionButtonText}>New Task</Text>
              </Pressable>
            </Link>
          }
        >
          <TaskList tasks={tasks} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} />
        </Collapsible>

        <View style={styles.dangerZone}>
          <Pressable onPress={handleDelete} style={styles.deletePlantButton}>
            <Text style={styles.deletePlantButtonText}>Delete Plant</Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 250,
    marginBottom: 24,
    backgroundColor: '#E0E0E0',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light background
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 120, // Add padding for custom header
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Light background
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statsContainerExpanded: {
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
  },
  statItem: {
    alignItems: 'center',
    width: '30%', // For expanded view
    marginBottom: 12, // For expanded view
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  showMoreButton: {
      alignItems: 'center',
      padding: 8,
      marginBottom: 12,
  },
  showMoreButtonText: {
      color: '#006400',
      fontWeight: 'bold',
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006400',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerActionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#888',
    fontSize: 16,
  },
  timelinePhoto: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  skeleton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  skeletonCard: {
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
    borderRadius: 12,
  },
  skeletonText: {
    backgroundColor: '#C0C0C0',
    height: 20,
    marginBottom: 10,
    borderRadius: 4,
  },
  skeletonStat: {
    backgroundColor: '#C0C0C0',
    height: 40,
    width: 80,
    borderRadius: 8,
  }
})