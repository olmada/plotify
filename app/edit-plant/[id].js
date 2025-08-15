import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text, ScrollView, Switch, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlantById, updatePlant, getGardenBeds, getPlants } from '../../src/services/api';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

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

export default function EditPlantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [plantedFromSeed, setPlantedFromSeed] = useState(false);
  const [seedPurchasedFrom, setSeedPurchasedFrom] = useState('');
  const [purchasedFrom, setPurchasedFrom] = useState('');
  const [family, setFamily] = useState(null);
  const [daysToHarvest, setDaysToHarvest] = useState('');
  const [plantedDate, setPlantedDate] = useState(new Date());
  const [transplantedDate, setTransplantedDate] = useState(new Date());
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [showPlantedDatePicker, setShowPlantedDatePicker] = useState(false);
  const [showTransplantedDatePicker, setShowTransplantedDatePicker] = useState(false);

  const [gardenBeds, setGardenBeds] = useState([]);
  const [seedSources, setSeedSources] = useState([]);
  const [showNewSeedSourceInput, setShowNewSeedSourceInput] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [plant, beds, allPlants] = await Promise.all([
          getPlantById(id),
          getGardenBeds(),
          getPlants(),
        ]);

        if (plant) {
          setName(plant.name);
          setNotes(plant.notes || '');
          setSelectedBed(plant.bed_id);
          setPlantedFromSeed(plant.planted_from_seed || false);
          setSeedPurchasedFrom(plant.seed_purchased_from || '');
          setPurchasedFrom(plant.purchased_from || '');
          setFamily(plant.family || '');
          setDaysToHarvest(plant.days_to_harvest ? String(plant.days_to_harvest) : '');
          setPlantedDate(plant.planted_date ? new Date(plant.planted_date) : new Date());
          setTransplantedDate(plant.transplanted_date ? new Date(plant.transplanted_date) : new Date());
          setExpectedHarvestDate(plant.expected_harvest_date || '');
        }
        setGardenBeds(beds);
        const sources = [...new Set(allPlants.map(p => p.seed_purchased_from).filter(Boolean))];
        setSeedSources(sources);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (transplantedDate && daysToHarvest) {
      const transplant = new Date(transplantedDate);
      if (!isNaN(transplant.getTime())) {
        const harvestDays = parseInt(daysToHarvest);
        if (!isNaN(harvestDays)) {
          const expectedHarvest = new Date(transplant);
          expectedHarvest.setDate(transplant.getDate() + harvestDays);
          setExpectedHarvestDate(expectedHarvest.toISOString().split('T')[0]);
        }
      }
    }
  }, [transplantedDate, daysToHarvest]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the plant.");
      return;
    }

    try {
      const plantData = {
        name,
        notes,
        bed_id: selectedBed,
        planted_from_seed: plantedFromSeed,
        seed_purchased_from: plantedFromSeed ? seedPurchasedFrom : null,
        purchased_from: !plantedFromSeed ? purchasedFrom : null,
        family,
        days_to_harvest: daysToHarvest ? parseInt(daysToHarvest) : null,
        planted_date: plantedFromSeed ? plantedDate.toISOString() : null,
        transplanted_date: transplantedDate.toISOString(),
        expected_harvest_date: expectedHarvestDate || null,
      };
      await updatePlant(id, plantData);
      Alert.alert("Success", "Plant updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not update plant.");
      console.error(error);
    }
  };

  const onPlantedDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || plantedDate;
    setShowPlantedDatePicker(Platform.OS === 'ios');
    setPlantedDate(currentDate);
  };

  const onTransplantedDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || transplantedDate;
    setShowTransplantedDatePicker(Platform.OS === 'ios');
    setTransplantedDate(currentDate);
  };

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TextInput style={styles.input} placeholder="Plant Name" value={name} onChangeText={setName} />

      <View style={styles.row}>
        <Text style={styles.label}>Planted from Seed:</Text>
        <Switch onValueChange={setPlantedFromSeed} value={plantedFromSeed} />
      </View>

      {plantedFromSeed ? (
        <>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={seedPurchasedFrom}
              onValueChange={(itemValue) => {
                if (itemValue === 'create_new') {
                  setShowNewSeedSourceInput(true);
                  setSeedPurchasedFrom('');
                } else {
                  setShowNewSeedSourceInput(false);
                  setSeedPurchasedFrom(itemValue);
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select a source..." value={null} />
              {seedSources.map((source, index) => (
                <Picker.Item key={index} label={source} value={source} />
              ))}
              <Picker.Item label="Create New Source" value="create_new" />
            </Picker>
          </View>
          {showNewSeedSourceInput && (
            <TextInput
              style={styles.input}
              placeholder="New Seed Source"
              value={seedPurchasedFrom}
              onChangeText={setSeedPurchasedFrom}
            />
          )}
          <Pressable onPress={() => setShowPlantedDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Seed Planted Date: {plantedDate.toLocaleDateString()}</Text>
          </Pressable>
          {showPlantedDatePicker && (
            <DateTimePicker
              value={plantedDate}
              mode="date"
              display="default"
              onChange={onPlantedDateChange}
            />
          )}
        </>
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Purchased From"
          value={purchasedFrom}
          onChangeText={setPurchasedFrom}
        />
      )}

      <View style={styles.pickerContainer}>
        <Picker selectedValue={family} onValueChange={setFamily} style={styles.picker}>
          {PLANT_FAMILIES.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>

      <TextInput style={styles.input} placeholder="Days to Harvest (e.g., 90)" value={daysToHarvest} onChangeText={setDaysToHarvest} keyboardType="numeric" />
      
      <Pressable onPress={() => setShowTransplantedDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Transplanted Date: {transplantedDate.toLocaleDateString()}</Text>
      </Pressable>
      {showTransplantedDatePicker && (
        <DateTimePicker
          value={transplantedDate}
          mode="date"
          display="default"
          onChange={onTransplantedDateChange}
        />
      )}

      <TextInput style={styles.input} placeholder="Expected Harvest Date" value={expectedHarvestDate} editable={false} />
      
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedBed} onValueChange={setSelectedBed} style={styles.picker}>
          <Picker.Item label="Select a Garden Bed..." value={null} />
          {gardenBeds.map((bed) => (
            <Picker.Item key={bed.id} label={bed.name} value={bed.id} />
          ))}
        </Picker>
      </View>

      <TextInput style={[styles.input, styles.textArea]} placeholder="Notes" value={notes} onChangeText={setNotes} multiline />
      <Button title="Save Changes" onPress={handleUpdate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 20 },
  picker: { height: 50, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
  label: { fontSize: 16, marginRight: 10 },
  dateButton: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5, alignItems: 'center' },
  dateButtonText: { fontSize: 16 },
});