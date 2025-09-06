import { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Text } from 'react-native';

import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

export function Collapsible({ children, title, headerRight }: PropsWithChildren & { title: string, headerRight?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const theme = useColorScheme();
  const colors = Colors[theme];
  const rotation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },
    content: {
      marginTop: 12,
    },
  });

  return (
    <View style={styles.cardContainer}>
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
              color={colors.icon}
            />
          </Animated.View>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        {headerRight}
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}