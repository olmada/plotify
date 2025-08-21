import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView, Switch, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { createPlant } from '../src/services/api';
import DatePickerInput from '../components/ui/DatePickerInput';
import CustomDropdown from '../components/ui/CustomDropdown';



const calculateExpectedHarvestDate = (transplantedDate, daysToHarvest) => {
  if (transplantedDate && daysToHarvest) {
    const transplant = new Date(transplantedDate);
    if (!isNaN(transplant.getTime())) {
      const harvestDays = parseInt(daysToHarvest);
      if (!isNaN(harvestDays)) {
        const expectedHarvest = new Date(transplant);
        expectedHarvest.setDate(transplant.getDate() + harvestDays);
        return expectedHarvest.toISOString().split('T')[0]; // Format YYYY-MM-DD
      }
    }
  }
  return '';
};

export default function AddPlantScreen() {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [plantedFromSeed, setPlantedFromSeed] = useState(false); // true for seed, false for seedling
  const [seedPurchasedFrom, setSeedPurchasedFrom] = useState(null);
  const [family, setFamily] = useState(null);
  const [daysToHarvest, setDaysToHarvest] = useState('');
  const [plantedDate, setPlantedDate] = useState(null);
  const [transplantedDate, setTransplantedDate] = useState(null);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');

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
    setExpectedHarvestDate(calculateExpectedHarvestDate(transplantedDate, daysToHarvest));
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
        planted_date: plantedFromSeed ? (plantedDate ? plantedDate.toISOString().split('T')[0] : null) : null, // Format date for Supabase
        transplanted_date: transplantedDate ? transplantedDate.toISOString().split('T')[0] : null, // Format date for Supabase
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
      <Text style={styles.inputLabel}>Plant Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Cherry Tomato"
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
          <Text style={styles.inputLabel}>Seed Company</Text>
          <CustomDropdown
            tableName="seed_companies"
            valueColumn="id"
            labelColumn="name"
            onSelect={setSeedPurchasedFrom}
            selectedValue={seedPurchasedFrom}
            placeholder="Select Seed Company..."
          />
          <Text style={styles.inputLabel}>Seed Planted Date</Text>
          <DatePickerInput
            value={plantedDate}
            onValueChange={setPlantedDate}
            placeholder="Select Date"
          />
        </>
      )}

      <Text style={styles.inputLabel}>Plant Family</Text>
      <CustomDropdown
        tableName="plant_families"
        valueColumn="id"
        labelColumn="name"
        onSelect={setFamily}
        selectedValue={family}
        placeholder="Select Plant Family..."
      />

      <Text style={styles.inputLabel}>Days to Harvest</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 90"
        value={daysToHarvest}
        onChangeText={setDaysToHarvest}
        keyboardType="numeric"
      />
      <Text style={styles.inputLabel}>Transplanted Date</Text>
      <DatePickerInput
        value={transplantedDate}
        onValueChange={setTransplantedDate}
        placeholder="Select Date"
      />
      <Text style={styles.inputLabel}>Expected Harvest Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={expectedHarvestDate}
        editable={false} // This field is calculated
        onChangeText={setExpectedHarvestDate} // Still need onChangeText for consistency, but it won't be user-editable
      />
      <Text style={styles.inputLabel}>Garden Bed</Text>
      <CustomDropdown
        tableName="garden_beds"
        valueColumn="id"
        labelColumn="name"
        onSelect={setSelectedBed}
        selectedValue={selectedBed}
        placeholder="Select a Garden Bed..."
      />
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