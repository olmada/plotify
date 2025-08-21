import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, SafeAreaView } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { getGardenBeds } from '../../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/ui/Card';

export default function GardenBedListScreen() {
  const [gardenBeds, setGardenBeds] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadGardenBeds = async () => {
        try {
          setLoading(true);
          const data = await getGardenBeds();
          setGardenBeds(data);
        } catch (error) {
          console.error("Failed to fetch garden beds:", error);
        } finally {
          setLoading(false);
        }
      };
      loadGardenBeds();
    }, [])
  );

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  const renderItem = ({ item }) => (
    <Link href={{ pathname: '/(tabs)/garden-beds/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <Card style={styles.gardenBedItem}>
          <Text style={styles.gardenBedName}>{item.name}</Text>
        </Card>
      </Pressable>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <FlatList
        data={gardenBeds}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No garden beds yet. Add one!</Text>}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/add-garden-bed')}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  
  gardenBedItem: {
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
  gardenBedName: {
    fontSize: 18,
    fontWeight: '500',
  },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});