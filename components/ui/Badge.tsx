import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

const badgeVariants = cva(
  'inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Badge = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & VariantProps<typeof badgeVariants>
>(({ style, variant, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9999,
      paddingHorizontal: 10,
      paddingVertical: 2,
      borderWidth: 1,
    },
    text: {
      fontSize: 10,
      fontWeight: '600',
    },
    badge_default: {
      backgroundColor: colors.primary,
      borderColor: 'transparent',
    },
    text_default: {
      color: colors.primaryForeground,
    },
    badge_secondary: {
      backgroundColor: colors.secondary,
      borderColor: 'transparent',
    },
    text_secondary: {
      color: colors.secondaryForeground,
    },
    badge_destructive: {
      backgroundColor: colors.destructive,
      borderColor: 'transparent',
    },
    text_destructive: {
      color: colors.destructiveForeground,
    },
    badge_outline: {
      borderColor: colors.border,
    },
    text_outline: {
      color: colors.text,
    },
  });

  const badgeStyle = [styles.base, styles[`badge_${variant}`], style];
  const textStyle = [styles.text, styles[`text_${variant}`]];

  return (
    <View ref={ref} style={badgeStyle} {...props}>
      {typeof props.children === 'string' ? (
        <Text style={textStyle}>{props.children}</Text>
      ) : (
        props.children
      )}
    </View>
  );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
