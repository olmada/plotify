import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlantById, updatePlant } from '../../../src/services/api';

export default function EditPlantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPlant = async () => {
      try {
        setLoading(true);
        const plant = await getPlantById(id);
        if (plant) {
          setName(plant.name);
          setNotes(plant.notes || '');
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch plant data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the plant.");
      return;
    }

    try {
      await updatePlant(id, { name, notes });
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
      <Button title="Save Changes" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
});
