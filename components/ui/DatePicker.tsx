import React, { useState } from 'react';
import { Platform, Text, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';
import { Button } from './Button';

const DatePicker = ({ value, onValueChange, placeholder }) => {
  const [show, setShow] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || value;
    setShow(Platform.OS === 'ios');
    onValueChange(currentDate);
  };

  const showMode = () => {
    setShow(true);
  };

  const formattedDate = value ? new Date(value).toISOString().split('T')[0] : '';

  const styles = StyleSheet.create({
    dateText: {
      fontSize: 14,
      color: colors.text,
    },
    placeholderText: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
  });

  return (
    <View>
      <Button variant="outline" onPress={showMode}>
        <Text style={value ? styles.dateText : styles.placeholderText}>
          {formattedDate || placeholder}
        </Text>
      </Button>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
        />
      )}
    </View>
  );
};

export { DatePicker };