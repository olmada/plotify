import { useLocalSearchParams, Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView, Pressable, SafeAreaView, ImageBackground } from 'react-native';
import { getPlantById, deletePlant, getPlantTimeline, getTasksForPlant, updateTask, deleteTask } from '../../../src/services/api';
import { RRule } from 'rrule';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../../constants/Theme';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '../../../constants/Colors';

// --- Helper Components ---

const StatItem = ({ icon, label, value }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const TaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  if (tasks.length === 0) {
    return <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tasks here. Well done!</Text>;
  }

  return tasks.map((task) => {
    const isOverdue = new Date(task.due_date) < new Date() && !task.completed;
    return (
      <Card key={task.id} style={styles.taskCard}>
        <View style={styles.taskContainer}>
            <Pressable onPress={() => onToggleTask(task)} style={[styles.taskCheckbox, { borderColor: colors.primary, backgroundColor: task.completed ? colors.primary : 'transparent' }]}>
              {task.completed && <Ionicons name="checkmark" size={18} color={colors.primaryForeground} />}
            </Pressable>
            <View style={styles.taskTextContainer}>
              <Text style={[styles.taskTitle, task.completed && { textDecorationLine: 'line-through', color: colors.mutedForeground }, { color: colors.text }]}>{task.title}</Text>
              <Text style={[styles.taskDueDate, isOverdue && { color: colors.destructive }, { color: colors.mutedForeground }]}>
                Due: {new Date(task.due_date).toLocaleDateString()}
              </Text>
            </View>
            <Button variant="ghost" size="icon" onPress={() => onDeleteTask(task.id)}>
              <Ionicons name="trash-outline" size={22} color={colors.mutedForeground} />
            </Button>
        </View>
      </Card>
    );
  });
};

const TimelineItem = ({ item }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const hasText = item.data.text && item.data.text.trim().length > 0;
  const hasPhoto = item.data.photo_url || item.data.url;

  return (
    <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
      {hasPhoto && (
        <Image source={{ uri: item.data.photo_url || item.data.url }} style={styles.timelinePhoto} />
      )}
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>{new Date(item.timestamp).toLocaleString()}</Text>
        {hasText && <Text style={[styles.timelineText, { color: colors.text }]}>{item.data.text}</Text>}
      </View>
    </Card>
  );
};

const PlantDetailSkeleton = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.heroImage, styles.skeleton, { backgroundColor: colors.muted }]} />
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.skeletonStat, { backgroundColor: colors.border }]} />
            <View style={[styles.skeletonStat, { backgroundColor: colors.border }]} />
            <View style={[styles.skeletonStat, { backgroundColor: colors.border }]} />
        </View>
        <Card style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
            <View style={[styles.skeletonText, { backgroundColor: colors.border }]} />
            <View style={[styles.skeletonText, { backgroundColor: colors.border }]} />
        </Card>
        <Card style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
            <View style={[styles.skeletonText, { backgroundColor: colors.border }]} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};


// --- Main Screen Component ---

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [plant, setPlant] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsExpanded, setStatsExpanded] = useState(false);

  const fetchPlantData = useCallback(async () => {
    try {
      setLoading(true);
      const [plantData, timelineData, tasksData] = await Promise.all([
        getPlantById(id),
        getPlantTimeline(id),
        getTasksForPlant(id),
      ]);
      setPlant(plantData);
      setTimeline(timelineData.filter(item => item.type === 'journal' || item.type === 'photo'));
      setTasks(tasksData);
    } catch (_error) {
      Alert.alert("Error", "Failed to fetch plant details.");
      console.error(_error);
    }
 finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => {
    fetchPlantData();
  }, [fetchPlantData]));

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
            } catch (_error) {
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
    return <View style={styles.container}><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Plant not found.</Text></View>;
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        scrollEventThrottle={16}
      >
        <ImageBackground
          source={{ uri: plant.profile_image_url || (timeline[0] && timeline[0].data.photo_url) }}
          style={styles.heroContainer}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.headerButtons}>
            <Button variant="ghost" size="icon" onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Button>
            <Link href={{ pathname: '/edit-plant/[id]', params: { id: id } }} asChild>
              <Button variant="ghost" onPress={() => {}}>
                <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                <Text style={styles.headerEditButtonText}>Edit</Text>
              </Button>
            </Link>
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradient}
          />
          <Text style={styles.heroTitle}>{plant.name}</Text>
        </ImageBackground>

        <View style={[styles.statsContainer, statsExpanded && styles.statsContainerExpanded, { backgroundColor: colors.card }]}>
          {displayedStats.map(stat => <StatItem key={stat.label} {...stat} />)}
        </View>
        {allStats.length > 3 && (
            <Button variant="ghost" onPress={() => setStatsExpanded(!statsExpanded)}>
                <Text style={[styles.showMoreButtonText, { color: colors.primary }]}>{statsExpanded ? 'Show Less' : 'Show More'}</Text>
            </Button>
        )}

        <Card 
          style={{ marginTop: 12 }}
        >
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <Link href={{ pathname: '/add-entry/[plantId]', params: { plantId: id } }} asChild>
              <Button>
                <Ionicons name="add" size={16} color={colors.primaryForeground} />
                <Text style={{ color: colors.primaryForeground }}>New Entry</Text>
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No entries yet.</Text>
                <Link href={{ pathname: '/add-entry/[plantId]', params: { plantId: id } }} asChild>
                  <Button>
                    <Text style={[styles.emptyStateButtonText, { color: colors.primaryForeground }]}>Add Your First Entry</Text>
                  </Button>
                </Link>
              </View>
            ) : (
              timeline.map((item) => <TimelineItem key={item.id} item={item} />)
            )}
          </CardContent>
        </Card>

        <Card 
          style={{ marginTop: 12 }}
        >
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <Link href={{ pathname: '/add-task', params: { plantId: id } }} asChild>
              <Button>
                <Ionicons name="checkbox-outline" size={16} color={colors.primaryForeground} />
                <Text style={{ color: colors.primaryForeground }}>New Task</Text>
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <TaskList tasks={tasks} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} />
          </CardContent>
        </Card>

        <View style={[styles.dangerZone, { borderColor: colors.border }]}>
          <Button variant="destructive" onPress={handleDelete}>
            <Text style={styles.deletePlantButtonText}>Delete Plant</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 300,
    justifyContent: 'space-between',
    padding: 16,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '30%',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  headerEditButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    padding: Theme.Spacing.medium,
    marginTop: 24,
    marginHorizontal: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainerExpanded: {
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  showMoreButtonText: {
      fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
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
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 16,
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
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
  },
  taskDueDate: {
    fontSize: 12,
    marginTop: 4,
  },
  deletePlantButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  skeleton: {
    borderRadius: 12,
  },
  skeletonCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  skeletonText: {
    height: 20,
    marginBottom: 10,
    borderRadius: 4,
  },
  skeletonStat: {
    height: 40,
    width: 80,
    borderRadius: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
});
