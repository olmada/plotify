import { useLocalSearchParams, useNavigation, Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, Image, FlatList, ScrollView } from 'react-native';
import { getPlantById, uploadPhoto, getPhotosForPlant, deletePlant } from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  // Use `useNavigation` to get access to the navigation object for setting screen options.
  const navigation = useNavigation();
  const router = useRouter();

  const [plant, setPlant] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPlantData = useCallback(async () => {
    try {
      setLoading(true);
      const plantData = await getPlantById(id);
      setPlant(plantData);
      const photoData = await getPhotosForPlant(id);
      setPhotos(photoData);
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

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        await uploadPhoto(result.assets[0].uri, id);
        Alert.alert("Success", "Photo uploaded!");
        // Refresh photos after upload
        await fetchPlantData(); 
      } catch (error) {
        Alert.alert("Upload Failed", error.message);
        console.error(error);
      } finally {
        setUploading(false);
      }
    }
  };

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

  return (
    <ScrollView style={styles.container}>
      {/* The Stack.Screen component has been removed from here and is now handled by the useEffect hook above. */}
      <Text style={styles.title}>{plant.name}</Text>
      <Text style={styles.subtitle}>{plant.variety?.common_name}</Text>
      <Text style={styles.notes}>{plant.notes}</Text>
      
      <Button 
        title={uploading ? "Uploading..." : "Upload Photo"} 
        onPress={handleUploadPhoto}
        disabled={uploading}
      />
      
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={3}
        style={styles.photoList}
        renderItem={({ item }) => (
          <Image source={{ uri: item.url }} style={styles.photo} />
        )}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Photos</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No photos yet. Add one!</Text>}
      />

      <View style={styles.dangerZone}>
        <Button
          title="Delete Plant"
          onPress={handleDelete}
          color="#ff3b30"
        />
      </View>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  photoList: {
    flex: 1,
    marginTop: 10,
  },
  photo: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#eee' // Placeholder color
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray'
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#eee'
  },
});