import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { getPlants } from '../../../src/services/api';

export default function PlantListScreen() {
  const [plants, setPlants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadPlants = async () => {
        try {
          setLoading(true);
          const data = await getPlants();
          setPlants(data);
        } catch (error) {
          console.error("Failed to fetch plants:", error);
        } finally {
          setLoading(false);
        }
      };
      loadPlants();
    }, [])
  );

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  const renderItem = ({ item }) => (
    <Link href={{ pathname: '/(tabs)/plants/[id]', params: { id: item.id } }} asChild>
      <Pressable style={styles.plantItem}>
        <View>
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantVariety}>{item.variety?.common_name || 'Unknown Variety'}</Text>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No plants yet. Add one!</Text>}
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
    backgroundColor: '#fff',
  },
  plantItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
