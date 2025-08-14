import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createGardenBed } from '../src/services/api';

export default function AddGardenBedScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a name for the garden bed.");
      return;
    }

    setIsSaving(true);
    try {
      await createGardenBed({ name: name.trim(), description: description.trim() });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not save the garden bed.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Garden Bed Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Button title={isSaving ? "Saving..." : "Save Garden Bed"} onPress={handleSave} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
});