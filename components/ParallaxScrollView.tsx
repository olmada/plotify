import { PropsWithChildren } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Colors } from '../constants/Colors';
import { TabBarBackground } from './ui/TabBarBackground';

export function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: PropsWithChildren & { headerImage: React.ReactNode; headerBackgroundColor: { light: string; dark: string } }) {
  const colorScheme = useColorScheme() ?? 'light';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      height: 250,
      backgroundColor: headerBackgroundColor[colorScheme],
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      padding: 32,
      gap: 16,
      overflow: 'hidden',
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView>
        <View style={styles.header}>{headerImage}</View>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
      <TabBarBackground />
    </View>
  );
}