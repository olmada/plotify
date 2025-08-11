import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTask } from '../../src/services/api';

export default function AddTaskScreen() {
  const { plantId } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrence, setRecurrence] = useState('none'); // 'none', 'daily', 'weekly'
  const [isSaving, setIsSaving] = useState(false);

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

    let recurring_rule = null;
    if (recurrence === 'daily') {
      recurring_rule = 'FREQ=DAILY';
    } else if (recurrence === 'weekly') {
      recurring_rule = 'FREQ=WEEKLY'
    } else if (recurrence === 'monthly') {
      recurring_rule = 'FREQ=MONTHLY';
    }

    setIsSaving(true);
    try {
      await createTask(plantId, {
        title: title.trim(),
        notes: notes.trim(),
        due_date: date.toISOString(),
        recurring_rule: recurring_rule,
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
        {Platform.OS === 'android' && (
          <Button onPress={() => setShowDatePicker(true)} title="Select Date" />
        )}
        {showDatePicker || Platform.OS === 'ios' ? (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        ) : null}
      </View>
      <Button title={isSaving ? "Saving..." : "Save Task"} onPress={handleSave} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
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