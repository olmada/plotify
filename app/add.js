import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView, Switch, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { createPlant, getGardenBeds } from '../src/services/api';
import { Picker } from '@react-native-picker/picker';

const PLANT_FAMILIES = [
  { label: "Select Plant Family...", value: null },
  { label: "Solanaceae (Tomatoes, Eggplants, Peppers, Potatoes)", value: "Solanaceae" },
  { label: "Cucurbitaceae (Cucumbers, Squashes, Melons)", value: "Cucurbitaceae" },
  { label: "Brassicaceae (Broccoli, Cabbage, Kale, Radishes)", value: "Brassicaceae" },
  { label: "Fabaceae (Beans, Peas, Lentils)", value: "Fabaceae" },
  { label: "Apiaceae (Carrots, Celery, Parsley)", value: "Apiaceae" },
  { label: "Asteraceae (Lettuce, Sunflowers, Artichokes)", value: "Asteraceae" },
  { label: "Liliaceae (Onions, Garlic, Leeks)", value: "Liliaceae" },
  { label: "Poaceae (Corn, Wheat, Rice)", value: "Poaceae" },
  { label: "Rosaceae (Apples, Pears, Strawberries, Roses)", value: "Rosaceae" },
  { label: "Other", value: "Other" },
];

export default function AddPlantScreen() {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [plantedFromSeed, setPlantedFromSeed] = useState(false); // true for seed, false for seedling
  const [seedPurchasedFrom, setSeedPurchasedFrom] = useState('');
  const [family, setFamily] = useState(null); // Changed to null for Picker
  const [daysToHarvest, setDaysToHarvest] = useState('');
  const [plantedDate, setPlantedDate] = useState(''); // This is "Seed Planted Date"
  const [transplantedDate, setTransplantedDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');

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

  // Effect for calculating Expected Harvest Date
  useEffect(() => {
    if (transplantedDate && daysToHarvest) {
      const transplant = new Date(transplantedDate);
      if (!isNaN(transplant.getTime())) {
        const harvestDays = parseInt(daysToHarvest);
        if (!isNaN(harvestDays)) {
          const expectedHarvest = new Date(transplant);
          expectedHarvest.setDate(transplant.getDate() + harvestDays);
          setExpectedHarvestDate(expectedHarvest.toISOString().split('T')[0]); // Format YYYY-MM-DD
        } else {
          setExpectedHarvestDate('');
        }
      } else {
        setExpectedHarvestDate('');
      }
    } else {
      setExpectedHarvestDate('');
    }
  }, [transplantedDate, daysToHarvest]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the plant.");
      return;
    }

    setIsSaving(true);
    try {
      const plantData = {
        name,
        notes,
        bed_id: selectedBed,
        planted_from_seed: plantedFromSeed,
        seed_purchased_from: plantedFromSeed ? seedPurchasedFrom : null, // Only save if planted from seed
        family,
        days_to_harvest: daysToHarvest ? parseInt(daysToHarvest) : null,
        planted_date: plantedFromSeed ? plantedDate || null : null, // Only save if planted from seed
        transplanted_date: transplantedDate || null,
        expected_harvest_date: expectedHarvestDate || null,
      };
      await createPlant(plantData);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TextInput
        style={styles.input}
        placeholder="Plant Name (e.g., Cherry Tomato)"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Planted from Seed:</Text>
        <Switch
          onValueChange={setPlantedFromSeed}
          value={plantedFromSeed}
        />
      </View>

      {plantedFromSeed && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Seed Purchased From"
            value={seedPurchasedFrom}
            onChangeText={setSeedPurchasedFrom}
          />
          <TextInput
            style={styles.input}
            placeholder="Seed Planted Date (YYYY-MM-DD)"
            value={plantedDate}
            onChangeText={setPlantedDate}
          />
        </>
      )}

      <Picker
        selectedValue={family}
        onValueChange={(itemValue) => setFamily(itemValue)}
        style={styles.picker}
      >
        {PLANT_FAMILIES.map((item, index) => (
          <Picker.Item key={index} label={item.label} value={item.value} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Days to Harvest (e.g., 90)"
        value={daysToHarvest}
        onChangeText={setDaysToHarvest}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Transplanted Date (YYYY-MM-DD)"
        value={transplantedDate}
        onChangeText={setTransplantedDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Expected Harvest Date (YYYY-MM-DD)"
        value={expectedHarvestDate}
        editable={false} // This field is calculated
        onChangeText={setExpectedHarvestDate} // Still need onChangeText for consistency, but it won't be user-editable
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
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Button title={isSaving ? "Saving..." : "Save Plant"} onPress={handleSave} disabled={isSaving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20, paddingBottom: 40 }, // Added paddingBottom
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderColor: '#ccc', marginBottom: 20, borderRadius: 5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between', // To push label and switch to ends
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
});