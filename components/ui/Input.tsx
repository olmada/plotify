
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

const Input = React.forwardRef<
  TextInput,
  React.ComponentPropsWithoutRef<typeof TextInput>
>(({ style, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    input: {
      height: 40,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.input,
      borderColor: colors.border,
      color: colors.text,
    },
  });

  return (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      placeholderTextColor={colors.mutedForeground}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
