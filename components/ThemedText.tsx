import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import { Theme } from '../constants/Theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Theme.Fonts.sizes.medium,
    lineHeight: 24,
    fontWeight: Theme.Fonts.weights.regular,
  },
  defaultSemiBold: {
    fontSize: Theme.Fonts.sizes.medium,
    lineHeight: 24,
    fontWeight: Theme.Fonts.weights.medium,
  },
  title: {
    fontSize: Theme.Fonts.sizes.xlarge,
    fontWeight: Theme.Fonts.weights.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: Theme.Fonts.sizes.large,
    fontWeight: Theme.Fonts.weights.bold,
  },
  link: {
    lineHeight: 30,
    fontSize: Theme.Fonts.sizes.medium,
    color: '#0a7ea4',
  },
});
