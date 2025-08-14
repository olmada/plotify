import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createPlant, getGardenBeds } from '../src/services/api';
import { Picker } from '@react-native-picker/picker';

export default function AddPlantScreen() {
  const [name, setName] = useState('');
  const [gardenBeds, setGardenBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadGardenBeds = async () => {
      try {
        const data = await getGardenBeds();
        setGardenBeds(data);
      } catch (error) {
        console.error("Failed to fetch garden beds:", error);
      }
    };
    loadGardenBeds();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the plant.");
      return;
    }

    setIsSaving(true);
    try {
      await createPlant({ name, bed_id: selectedBed });
      Alert.alert("Success", "Plant added successfully!");
      router.back(); // Go back to the previous screen (the list)
    } catch (error) {
      Alert.alert("Error", "Could not add plant.");
      console.error(error);
    } finally {
      setIsSaving(false);
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
      <Picker
        selectedValue={selectedBed}
        onValueChange={(itemValue) => setSelectedBed(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a Garden Bed..." value={null} />
        {gardenBeds.map((bed) => (
          <Picker.Item key={bed.id} label={bed.name} value={bed.id} />
        ))}
      </Picker>
      <Button title={isSaving ? "Saving..." : "Save Plant"} onPress={handleSave} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5 },
  picker: { borderWidth: 1, borderColor: '#ccc', marginBottom: 20, borderRadius: 5 },
});