import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { Link, useRouter } from 'expo-router';

const DynamicHeader = ({ scrollY, plantName, plantId }) => {
  const router = useRouter();

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, 100], [120, 90], 'clamp');
    const backgroundColor = scrollY.value > 50 ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0)';
    return {
      height,
      backgroundColor,
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, 100], [28, 18], 'clamp');
    const top = interpolate(scrollY.value, [0, 100], [70, 50], 'clamp');
    return {
      fontSize,
      top,
    };
  });

  return (
    <Animated.View style={[styles.header, animatedHeaderStyle]}>
      <View style={styles.headerContent}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#006400" />
        </Pressable>
        <Animated.Text style={[styles.title, animatedTitleStyle]}>{plantName}</Animated.Text>
        <Link href={{ pathname: '/edit-plant/[id]', params: { id: plantId } }} asChild>
          <Pressable style={styles.headerEditButton}>
            <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.headerEditButtonText}>Edit</Text>
          </Pressable>
        </Link>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 40, // Adjust for status bar
  },
  headerButton: {
    padding: 8,
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006400',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  headerEditButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default DynamicHeader;
