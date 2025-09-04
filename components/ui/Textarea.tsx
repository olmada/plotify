
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

const Textarea = React.forwardRef<
  TextInput,
  React.ComponentPropsWithoutRef<typeof TextInput>
>(({ style, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    input: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.input,
      borderColor: colors.border,
      color: colors.text,
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });

  return (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      placeholderTextColor={colors.mutedForeground}
      multiline
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
