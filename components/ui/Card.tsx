import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

import { Theme } from '../../constants/Theme';

export function Card({ children, style }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadowColor,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16, // Updated to 16 as per instruction
    padding: Theme.Spacing.large, // Updated to Theme.Spacing.large
    shadowOffset: { width: 0, height: 1 }, // More subtle shadow
    shadowOpacity: 0.05, // More subtle shadow
    shadowRadius: 4, // More subtle shadow
    elevation: 2, // More subtle shadow
  },
});
