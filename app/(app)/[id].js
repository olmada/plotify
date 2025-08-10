import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, Image, FlatList } from 'react-native';
import { getPlantById, uploadPhoto, getPhotosForPlant } from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
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

  useEffect(() => {
    fetchPlantData();
  }, [fetchPlantData]);

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
    <View style={styles.container}>
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
    </View>
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
  }
});