import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, Platform, Pressable, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTask, getGardenBeds } from '../../src/services/api';
import { Picker } from '@react-native-picker/picker';

export default function AddTaskScreen() {
  const { plantId } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrence, setRecurrence] = useState('none'); // 'none', 'daily', 'weekly'
  const [isSaving, setIsSaving] = useState(false);
  const [gardenBeds, setGardenBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [applyToPlants, setApplyToPlants] = useState(false);

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

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // On iOS, the picker is a modal
    setDate(currentDate);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title for the task.");
      return;
    }

    const recurrenceMap = {
      daily: 'FREQ=DAILY',
      weekly: 'FREQ=WEEKLY',
      monthly: 'FREQ=MONTHLY',
    };
    const recurring_rule = recurrenceMap[recurrence] || null;

    setIsSaving(true);
    try {
      await createTask({
        title: title.trim(),
        plant_id: plantId,
        notes: notes.trim(),
        due_date: date.toISOString(),
        recurring_rule: recurring_rule,
        garden_bed_id: selectedBed,
        apply_to_plants: applyToPlants,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not save the task.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Task Title (e.g., Water, Fertilize)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Notes (optional)"
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
      {selectedBed && (
        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Apply to all plants in this bed?</Text>
          <Switch value={applyToPlants} onValueChange={setApplyToPlants} />
        </View>
      )}
      <View style={styles.recurrenceContainer}>
        <Text style={styles.dateLabel}>Repeat:</Text>
        <View style={styles.recurrenceOptions}>
          {['none', 'daily', 'weekly', 'monthly'].map((option) => (
            <Pressable
              key={option}
              style={[styles.recurrenceButton, recurrence === option && styles.recurrenceButtonSelected]}
              onPress={() => setRecurrence(option)}
            >
              <Text style={[styles.recurrenceButtonText, recurrence === option && styles.recurrenceButtonTextSelected]}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Due Date:</Text>
        {/* On Android, the picker is a modal, so we show a button to open it. */}
        {/* On iOS, the picker can be displayed inline permanently. */}
        {Platform.OS === 'android' && <Button onPress={() => setShowDatePicker(true)} title="Select Date" />}
        {(showDatePicker || Platform.OS === 'ios') && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>
      <Button title={isSaving ? "Saving..." : "Save Task"} onPress={handleSave} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderColor: '#ccc', marginBottom: 20, borderRadius: 5 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  checkboxLabel: { fontSize: 16 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  recurrenceContainer: { marginBottom: 20 },
  recurrenceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  recurrenceButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  recurrenceButtonSelected: {
    backgroundColor: '#007AFF',
  },
  recurrenceButtonText: {
    color: '#007AFF',
  },
  recurrenceButtonTextSelected: {
    color: '#fff',
  },
  dateLabel: { fontSize: 16 },
});