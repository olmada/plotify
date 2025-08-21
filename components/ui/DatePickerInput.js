import React, { useState } from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePickerInput = ({ value, onValueChange, placeholder }) => {
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || value;
    setShow(Platform.OS === 'ios'); // On iOS, the picker is a modal, so we hide it after selection
    onValueChange(currentDate);
  };

  const showMode = () => {
    setShow(true);
  };

  const formattedDate = value ? new Date(value).toISOString().split('T')[0] : '';

  return (
    <View>
      <TouchableOpacity onPress={showMode} style={styles.input}>
        <Text style={value ? styles.dateText : styles.placeholderText}>
          {formattedDate || placeholder}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value || new Date()} // Use current date if no value is set
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 20,
    borderRadius: 5,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#000',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
});

export default DatePickerInput;
