import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

export function Button({ children, style, variant = 'default', size = 'default', onPress }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const buttonStyles = [
    styles.button,
    styles[size],
    {
      backgroundColor: variant === 'default' ? colors.primary : 'transparent',
      borderColor: colors.border,
      borderWidth: variant === 'outline' ? 1 : 0,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    {
      color: variant === 'default' ? colors.primaryForeground : colors.text,
    },
  ];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  default: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text_default: {
    fontSize: 16,
  },
  text_sm: {
    fontSize: 12,
  },
});
