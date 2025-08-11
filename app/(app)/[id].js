import { useLocalSearchParams, useNavigation, Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, Image, FlatList } from 'react-native';
import { getPlantById, deletePlant, getPlantTimeline } from '../../src/services/api';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  // Use `useNavigation` to get access to the navigation object for setting screen options.
  const navigation = useNavigation();
  const router = useRouter();

  const [plant, setPlant] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlantData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch plant details and the new unified timeline concurrently
      const [plantData, timelineData] = await Promise.all([
        getPlantById(id),
        getPlantTimeline(id),
      ]);
      setPlant(plantData);
      setTimeline(timelineData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch plant details.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // useFocusEffect runs every time the screen comes into focus.
  // It must be wrapped in a useCallback as per the hook's API.
  useFocusEffect(
    useCallback(() => {
      fetchPlantData();
    }, [fetchPlantData])
  );

  // Set header options dynamically after the plant data (and id) is available.
  useEffect(() => {
    if (plant) {
      navigation.setOptions({
        headerRight: () => (
          <Link href={`/edit-plant/${id}`} asChild>
            <Button title="Edit" />
          </Link>
        ),
      });
    }
  }, [navigation, plant, id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Plant",
      "Are you sure you want to permanently delete this plant and all its data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePlant(id);
              Alert.alert("Success", "Plant deleted.");
              router.replace('/(app)'); // Go back to the list and remove this page from history
            } catch (error) {
              Alert.alert("Error", "Could not delete the plant.");
              console.error("Deletion error:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Plant not found.</Text>
      </View>
    );
  }

  const renderTimelineItem = ({ item }) => {
    switch (item.type) {
      case 'photo':
        return <Image source={{ uri: item.data.url }} style={styles.timelinePhoto} />;
      case 'journal':
        return (
          <View style={styles.journalEntry}>
            {/* If the journal entry has a photo, display it */}
            {item.data.photo_url && (
              <Image source={{ uri: item.data.photo_url }} style={styles.timelinePhoto} />
            )}
            <Text style={styles.journalDate}>{new Date(item.timestamp).toLocaleString()}</Text>
            {/* Only render the text if it exists */}
            {item.data.text && <Text style={styles.journalText}>{item.data.text}</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <FlatList
      style={styles.container}
      data={timeline}
      keyExtractor={(item) => item.id}
      renderItem={renderTimelineItem}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{plant.name}</Text>
          <Text style={styles.subtitle}>{plant.variety?.common_name}</Text>
          <Text style={styles.notes}>{plant.notes}</Text>

          <View style={styles.buttonContainer}>
            {/* This button now navigates to the screen for adding a photo with an optional comment */}
            <Link href={`/(app)/add-photo-entry/${id}`} asChild>
              <Button title="New Photo Entry" />
            </Link>
            <Link href={`/(app)/add-journal/${id}`} asChild>
              <Button title="New Journal Entry" />
            </Link>
          </View>

          <Text style={styles.sectionTitle}>Timeline</Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No photos or journal entries yet. Add one!</Text>
      }
      ListFooterComponent={
        <View style={styles.dangerZone}>
          <Button
            title="Delete Plant"
            onPress={handleDelete}
            color="#ff3b30"
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 16,
  },
  notes: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  timelinePhoto: {
    width: '100%',
    aspectRatio: 4 / 3, // Maintain aspect ratio
    borderRadius: 8,
    marginBottom: 12, // Add margin bottom to separate from text if both exist
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray'
  },
  journalEntry: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  journalDate: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
  },
  journalText: { fontSize: 16, lineHeight: 22 },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#eee'
  },
});