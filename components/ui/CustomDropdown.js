import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AddNewModal from './AddNewModal';
import { supabase } from '../../src/services/supabase';
import { getUserId } from '../../src/services/api'; // Assuming getUserId is exported from api.js

const CustomDropdown = ({
  tableName,
  valueColumn,
  labelColumn,
  onSelect,
  placeholder,
  selectedValue,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
        Alert.alert("Error", "Could not retrieve user information.");
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOptions();
    }
  }, [userId, tableName]); // Re-fetch when userId or tableName changes

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(`${valueColumn}, ${labelColumn}`)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOptions(data || []);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      Alert.alert("Error", `Could not load ${tableName} options.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async (newValue) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([{ [labelColumn]: newValue, owner_id: userId }])
        .select()
        .single();

      if (error) throw error;

      // After successful insert, re-fetch options and select the new one
      await fetchOptions();
      onSelect(data[valueColumn]); // Select the newly created item
      setIsModalVisible(false);
    } catch (error) {
      console.error(`Error adding new ${tableName} entry:`, error);
      Alert.alert("Error", `Could not add new ${tableName} entry.`);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.picker} size="small" color="#0000ff" />;
  }

  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue) => {
          if (itemValue === "__ADD_NEW__") {
            setIsModalVisible(true);
          } else {
            onSelect(itemValue);
          }
        }}
        style={styles.picker}
      >
        <Picker.Item label={placeholder} value={null} />
        {options.map((item) => (
          <Picker.Item
            key={item[valueColumn]}
            label={item[labelColumn]}
            value={item[valueColumn]}
          />
        ))}
        <Picker.Item label="+ Create New..." value="__ADD_NEW__" />
      </Picker>

      <AddNewModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddNew}
        title={`Add New ${tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        placeholder={`Enter new ${tableName.replace(/_/g, ' ').slice(0, -1)} name`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  picker: {
    height: 50, // Adjust as needed
    width: '100%',
  },
});

export default CustomDropdown;
