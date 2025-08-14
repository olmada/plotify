import { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Collapsible({ children, title, headerRight }: PropsWithChildren & { title: string, headerRight?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const theme = useColorScheme() ?? 'light';
  const rotation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <ThemedView style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <View style={styles.headingLeft}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <IconSymbol
              name="chevron.right"
              size={18}
              weight="medium"
              color={Colors.light.icon}
            />
          </Animated.View>
          <ThemedText type="defaultSemiBold" style={styles.titleText}>{title}</ThemedText>
        </View>
        {headerRight}
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF', // White background for the collapsible card
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333', // Dark text for the title
  },
  content: {
    marginTop: 12,
  },
});