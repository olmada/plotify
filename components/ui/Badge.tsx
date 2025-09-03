import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

export function Badge({ children, style, variant }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const badgeStyles = [
    styles.badge,
    {
      backgroundColor: variant === 'outline' ? 'transparent' : colors.accent,
      borderColor: colors.border,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: variant === 'outline' ? colors.mutedForeground : colors.accentForeground,
    },
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
