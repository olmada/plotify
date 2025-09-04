import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getGardenBeds, getAllTasks } from '../../src/services/api';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Plus, Droplets, Scissors, Sun } from 'lucide-react-native';

export default function HomeScreen() {
  const [beds, setBeds] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          const bedsData = await getGardenBeds();
          setBeds(bedsData);
          const tasksData = await getAllTasks();
          setTasks(tasksData.filter(task => !task.completed).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
        } catch (error) {
          console.error("Failed to fetch data:", error);
          Alert.alert("Error", "Could not load data.");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [])
  );

  const getTaskIcon = (type) => {
    switch (type) {
      case 'watering': return <Droplets size={16} color={colors.text} />;
      case 'pruning': return <Scissors size={16} color={colors.text} />;
      default: return <Sun size={16} color={colors.text} />;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
    },
    section: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    quickActionButton: {
      flex: 1,
      height: 80,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    }
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Good morning</Text>
          <Text style={{ color: colors.mutedForeground }}>Your garden is looking great today!</Text>
        </View>
        <Button size="icon" onPress={() => router.push('/add')}>
          <Plus color={colors.primaryForeground} />
        </Button>
      </View>

      <View style={styles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>Garden Beds</Text>
          <Button variant="ghost" onPress={() => router.push('/(tabs)/beds')}>
            View All
          </Button>
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : (
          beds.slice(0, 3).map(bed => (
            <Card key={bed.id} style={{ marginBottom: 12 }}>
              <CardHeader>
                <CardTitle>{bed.name}</CardTitle>
                <CardDescription>{bed.location}</CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          <Button variant="ghost" onPress={() => router.push('/(tabs)/tasks')}>
            View All
          </Button>
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : (
          tasks.slice(0, 3).map(task => (
            <Card key={task.id} style={{ marginBottom: 12 }}>
              <CardContent>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ padding: 8, backgroundColor: colors.accent, borderRadius: 8 }}>
                    {getTaskIcon(task.type)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '500', color: colors.text }}>{task.title}</Text>
                    <Text style={{ color: colors.mutedForeground }}>{task.plant?.name || task.bed?.name || 'General Task'}</Text>
                  </View>
                  <Text style={{ color: colors.mutedForeground }}>{new Date(task.due_date).toLocaleDateString()}</Text>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <Button variant="outline" style={styles.quickActionButton} onPress={() => router.push('/add')}>
            <Plus color={colors.text} />
            <Text style={{ color: colors.text }}>Add Plant</Text>
          </Button>
          <Button variant="outline" style={styles.quickActionButton} onPress={() => router.push('/add-task')}>
            <Droplets color={colors.text} />
            <Text style={{ color: colors.text }}>Log Task</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
