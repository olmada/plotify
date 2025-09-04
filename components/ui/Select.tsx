
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

const Select = React.forwardRef<
  typeof Picker,
  React.ComponentPropsWithoutRef<typeof Picker> & { options: { label: string; value: any }[] }
>(({ style, options, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: 6,
      borderColor: colors.border,
      backgroundColor: colors.input,
    },
    picker: {
      height: 40,
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Picker
        ref={ref}
        style={[styles.picker, style]}
        {...props}
      >
        {options.map((option) => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </View>
  );
});

Select.displayName = 'Select';

export { Select };
