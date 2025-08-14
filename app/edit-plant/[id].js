import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlantById, updatePlant, getGardenBeds } from '../../src/services/api';
import { Picker } from '@react-native-picker/picker';

export default function EditPlantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [gardenBeds, setGardenBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [plant, beds] = await Promise.all([
          getPlantById(id),
          getGardenBeds()
        ]);

        if (plant) {
          setName(plant.name);
          setNotes(plant.notes || '');
          setSelectedBed(plant.bed_id); // Pre-select the plant's current bed
        }
        setGardenBeds(beds);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the plant.");
      return;
    }

    try {
      await updatePlant(id, { name, notes, bed_id: selectedBed });
      Alert.alert("Success", "Plant updated successfully!");
      router.back(); // Go back to the detail screen
    } catch (error) {
      Alert.alert("Error", "Could not update plant.");
      console.error(error);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Plant Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
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
      <Button title="Save Changes" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderColor: '#ccc', marginBottom: 20, borderRadius: 5 },
});
