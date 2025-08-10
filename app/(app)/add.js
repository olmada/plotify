// File: mobile/app/(app)/add.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createPlant } from '../../src/services/api';

export default function AddPlantScreen() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the plant.");
      return;
    }

    try {
      await createPlant({ name });
      Alert.alert("Success", "Plant added successfully!");
      router.back(); // Go back to the previous screen (the list)
    } catch (error) {
      Alert.alert("Error", "Could not add plant.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Plant Name (e.g., Cherry Tomato)"
        value={name}
        onChangeText={setName}
      />
      <Button title="Save Plant" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5 }
});