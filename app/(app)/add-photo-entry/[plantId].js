import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Image, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createJournal, uploadPhoto } from '../../../src/services/api';

export default function AddPhotoEntryScreen() {
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
    if (!imageUri) {
      Alert.alert("Required", "Please select a photo to save.");
      return;
    }

    setIsSaving(true);
    try {
      let journalId = null;
      // If there's a comment, create a journal entry first.
      if (comment.trim()) {
        const newJournal = await createJournal(plantId, comment.trim());
        journalId = newJournal.id;
      }
      
      // Upload the photo, linking it to the new journal if one was created.
      await uploadPhoto(imageUri, plantId, journalId);
      
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
      <Button title="Pick a photo from camera roll" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      
      <TextInput
        style={styles.input}
        placeholder="Add a comment (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      
      <Button title={isSaving ? "Saving..." : "Save Entry"} onPress={handleSave} disabled={isSaving || !imageUri} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  image: { width: '100%', height: 200, resizeMode: 'contain', marginVertical: 20, borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginTop: 20, borderRadius: 5, width: '100%', height: 100, textAlignVertical: 'top' },
});