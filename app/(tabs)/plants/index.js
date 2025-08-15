import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Link, useFocusEffect, useRouter, useNavigation } from 'expo-router';
import { getPlants, getAllTasks } from '../../../src/services/api';
import { useAuth } from '../../../src/context/AuthContext';
import Card from '../../../components/ui/Card';

export default function PlantListScreen() {
  const [plants, setPlants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();
  const { session, signOut } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const [plantData, taskData] = await Promise.all([getPlants(), getAllTasks()]);
      setPlants(plantData);
      setTasks(taskData.filter(t => !t.completed));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={signOut} style={{ marginRight: 15 }}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>Sign Out</Text>
        </Pressable>
      ),
    });
  }, [navigation, signOut]);

  const userName = session?.user?.email?.split('@')[0] || 'Gardener';

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  const renderItem = ({ item }) => (
    <Link href={{ pathname: '/(tabs)/plants/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <Card style={styles.plantItem}>
          <View>
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.plantVariety}>{item.variety?.common_name || 'Unknown Variety'}</Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeMessage}>Hello, {userName}!</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>You have {plants.length} active plants.</Text>
          <Text style={styles.summaryText}>Upcoming Tasks: {tasks.length}</Text>
        </View>
      </View>
      <FlatList
        data={plants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No plants yet. Add one!</Text>}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/add')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
    color: 'gray',
  },
  plantItem: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '500',
  },
  plantVariety: {
    fontSize: 14,
    color: 'gray',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
  },
});