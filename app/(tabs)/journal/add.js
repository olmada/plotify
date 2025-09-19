import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createJournal, uploadPhoto } from '../../../src/services/api';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function AddJournalEntryScreen() {
  const { plantId } = useLocalSearchParams();
  const router = useRouter();

  const [comment, setComment] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!imageUri && !comment.trim()) {
      Alert.alert("Required", "Please add a photo or write a comment to create an entry.");
      return;
    }

    setIsSaving(true);
    try {
      // Every entry is a journal entry. A photo is attached to it if it exists.
      const newJournal = await createJournal(plantId, comment.trim());
      
      if (imageUri) {
        await uploadPhoto(imageUri, plantId, newJournal.id);
      }
      
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not save your entry.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="What's new with your plant today?"
        value={comment}
        onChangeText={setComment}
        multiline
        style={{ height: 150, textAlignVertical: 'top' }}
      />
      
      <View style={styles.imagePickerContainer}>
        <Button variant="secondary" onPress={pickImage}>Add a Photo</Button>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      </View>
      
      <Button onPress={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Entry"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  imagePickerContainer: { alignItems: 'center', marginVertical: 20 },
  image: { width: 200, height: 200, resizeMode: 'contain', marginTop: 20, borderRadius: 8 },
});
