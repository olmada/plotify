import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

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
    borderRadius: 12, // Corresponds to --radius: .75rem; with 16px base -> 12px
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
