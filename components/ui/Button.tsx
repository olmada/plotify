import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: '',
        link: 'text-primary underline-offset-4',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef<
  TouchableOpacity,
  React.ComponentPropsWithoutRef<typeof TouchableOpacity> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const Comp = asChild ? Slot : TouchableOpacity;

  const styles = StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6, // rounded-md
    },
    default: {
      height: 40,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    sm: {
      height: 36,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    lg: {
      height: 44,
      paddingHorizontal: 32,
      borderRadius: 6,
    },
    icon: {
      height: 40,
      width: 40,
    },
    text: {
      fontSize: 14,
      fontWeight: '500',
    },
    text_default: {
      color: colors.primaryForeground,
    },
    text_destructive: {
      color: colors.destructiveForeground,
    },
    text_outline: {
      color: colors.text,
    },
    text_secondary: {
      color: colors.secondaryForeground,
    },
    text_ghost: {
      color: colors.text,
    },
    text_link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    button_default: {
      backgroundColor: colors.primary,
    },
    button_destructive: {
      backgroundColor: colors.destructive,
    },
    button_outline: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    button_secondary: {
      backgroundColor: colors.secondary,
    },
    button_ghost: {
      backgroundColor: 'transparent',
    },
    button_link: {
      backgroundColor: 'transparent',
    },
  });

  const buttonStyle = [styles.base, styles[size], styles[`button_${variant}`]];

  const textStyle = [styles.text, styles[`text_${variant}`]];

  return (
    <Comp
      data-slot="button"
      style={buttonStyle}
      {...props}
      ref={ref}
    >
      {typeof props.children === 'string' ? (
        <Text style={textStyle}>{props.children}</Text>
      ) : (
        props.children
      )}
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };