import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Button } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { getGardenBeds } from '../../../src/services/api';

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
      <Pressable style={styles.gardenBedItem}>
        <Text style={styles.gardenBedName}>{item.name}</Text>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      <Button title="New Garden Bed" onPress={() => router.push('/add-garden-bed')} />
      <FlatList
        data={gardenBeds}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No garden beds yet. Add one!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gardenBedItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  gardenBedName: {
    fontSize: 18,
    fontWeight: '500',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
});