import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { getPlants } from '../../../src/services/api';

export default function PlantListScreen() {
  const [plants, setPlants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

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
    <Link href={`/(tabs)/plants/${item.id}`} asChild>
      <Pressable style={styles.plantItem}>
        <View>
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantVariety}>{item.variety?.common_name || 'Unknown Variety'}</Text>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <FlatList
      data={plants}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      ListEmptyComponent={<Text style={styles.emptyText}>No plants yet. Add one!</Text>}
    />
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
});