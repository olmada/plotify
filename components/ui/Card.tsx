import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';

const Card = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View>
>(({ style, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View
      ref={ref}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadowColor,
        },
        style,
      ]}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View>
>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.cardHeader, style]}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  Text,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ style, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <Text
      ref={ref}
      style={[styles.cardTitle, { color: colors.text }, style]}
      {...props}
    />
  );
});
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  Text,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ style, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <Text
      ref={ref}
      style={[styles.cardDescription, { color: colors.mutedForeground }, style]}
      {...props}
    />
  );
});
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View>
>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.cardContent, style]}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View>
>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.cardFooter, style]}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Theme.Spacing.large,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    paddingBottom: Theme.Spacing.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
  },
  cardContent: {
    paddingTop: Theme.Spacing.medium,
  },
  cardFooter: {
    paddingTop: Theme.Spacing.large,
  },
});

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};