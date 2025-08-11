import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createJournal } from '../../../src/services/api';

export default function AddJournalScreen() {
  const { plantId } = useLocalSearchParams();
  const router = useRouter();
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert("Required", "Please enter some text for your journal entry.");
      return;
    }

    setIsSaving(true);
    try {
      await createJournal(plantId, text);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not save journal entry.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's new with your plant today? (e.g., noticed first flower, repotted, etc.)"
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
      />
      <Button title={isSaving ? "Saving..." : "Save Entry"} onPress={handleSave} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 20, borderRadius: 5, height: 200, textAlignVertical: 'top' },
});