import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text, ScrollView, Switch, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlantById, updatePlant, getPlants } from '../../src/services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

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

  const [selectedBed, setSelectedBed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [plant, allPlants] = await Promise.all([
          getPlantById(id),
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
      <View style={styles.formField}>
        <Text style={styles.label}>Plant Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Planted from Seed:</Text>
        <Switch onValueChange={setPlantedFromSeed} value={plantedFromSeed} />
      </View>

      {plantedFromSeed ? (
        <>
          <View style={styles.formField}>
            <Text style={styles.label}>Seed Purchased From</Text>
            <TextInput
              style={styles.input}
              value={seedPurchasedFrom}
              onChangeText={setSeedPurchasedFrom}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Seed Planted Date</Text>
            <Pressable onPress={() => setShowPlantedDatePicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{plantedDate.toLocaleDateString()}</Text>
            </Pressable>
          </View>
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
        <View style={styles.formField}>
          <Text style={styles.label}>Purchased From</Text>
          <TextInput
            style={styles.input}
            value={purchasedFrom}
            onChangeText={setPurchasedFrom}
          />
        </View>
      )}

      <View style={styles.formField}>
        <Text style={styles.label}>Plant Family</Text>
        <TextInput
          style={styles.input}
          value={family}
          onChangeText={setFamily}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.label}>Days to Harvest</Text>
        <TextInput style={styles.input} value={daysToHarvest} onChangeText={setDaysToHarvest} keyboardType="numeric" />
      </View>
      
      <View style={styles.formField}>
        <Text style={styles.label}>Transplanted Date</Text>
        <Pressable onPress={() => setShowTransplantedDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>{transplantedDate.toLocaleDateString()}</Text>
        </Pressable>
      </View>
      {showTransplantedDatePicker && (
        <DateTimePicker
          value={transplantedDate}
          mode="date"
          display="default"
          onChange={onTransplantedDateChange}
        />
      )}

      <View style={styles.formField}>
        <Text style={styles.label}>Expected Harvest Date</Text>
        <TextInput style={styles.input} value={expectedHarvestDate} editable={false} />
      </View>
      
      <View style={styles.formField}>
        <Text style={styles.label}>Garden Bed</Text>
        <TextInput
          style={styles.input}
          value={selectedBed}
          onChangeText={setSelectedBed}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline />
      </View>
      <Button title="Save Changes" onPress={handleUpdate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  formField: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
  label: { fontSize: 16, marginRight: 10, marginBottom: 5 },
  dateButton: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, alignItems: 'center' },
  dateButtonText: { fontSize: 16 },
});