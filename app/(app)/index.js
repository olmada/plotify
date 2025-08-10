// File: mobile/app/(app)/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { getPlants } from '../../src/services/api';

export default function PlantListScreen() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const data = await getPlants();
      setPlants(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/(app)/${item.id}`} asChild>
            <Pressable>
              <View style={styles.plantItem}>
                <Text style={styles.plantName}>{item.name || 'Unnamed Plant'}</Text>
                <Text style={styles.plantDate}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </Pressable>
          </Link>
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>My Plants</Text>
            <Button title="Refresh" onPress={fetchPlants} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>You haven't added any plants yet.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#fff' }, // Added top padding and background color
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  plantItem: {
    backgroundColor: '#fff', // Changed background for better contrast
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Lighter border
  },
  plantName: { fontSize: 18 },
  plantDate: { color: 'gray', marginTop: 4 },
  errorText: { color: 'red' },
});