import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';
import { useLocalSearchParams, useNavigation, Link } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

// New dummy data matching the requested structure
const plant = {
  id: '1',
  name: 'Cherry Tomatoes',
  variety: 'Sungold',
  image: 'https://images.unsplash.com/photo-1594057687723-157a8defa753', // A more fitting placeholder
  plantedFrom: 'From Seed', // 'From Seed' or 'Transplanted'
  stage: 'Flowering',
  location: 'Backyard North Bed',
  lastWatered: '2 days ago',
  sunlight: 'Full sun',
  temperature: '68-75°F',
  plantedDate: 'Jun 15, 2024',
  journalEntries: [
    { id: 'j1', title: 'First Sprouts Appeared', date: 'Jun 22, 2024', description: 'Tiny green sprouts have broken through the soil. So exciting!' },
    { id: 'j2', title: 'Transplanted to Garden', date: 'Jul 10, 2024', description: 'Moved the seedlings to the main garden bed. They look healthy.' },
    { id: 'j3', title: 'Noticed Some Yellow Leaves', date: 'Aug 1, 2024', description: 'A few lower leaves are yellowing. Might be a nitrogen deficiency. Added some organic fertilizer.' },
  ],
  tasks: [
    { id: 't1', text: 'Fertilize with compost tea', due: 'Sep 10, 2025' },
    { id: 't2', text: 'Check for pests', due: 'Sep 15, 2025' },
  ],
  photos: [
    'https://images.unsplash.com/photo-1587049352851-d8a431dce4e8',
    'https://images.unsplash.com/photo-1620144641248-367444d9de9d',
  ]
};

const CareInfoItem = ({ icon, label, value, colors }) => (
  <View style={styles(colors).careItem}>
    <MaterialCommunityIcons name={icon} size={24} color={colors.text} style={styles(colors).careIcon} />
    <Text style={styles(colors).careLabel}>{label}</Text>
    <Text style={styles(colors).careValue}>{value}</Text>
  </View>
);

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Journal');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: plant.name,
      headerRight: () => (
        <Link href={`/edit-plant/${id}`} asChild>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Link>
      ),
    });
  }, [navigation, id, colors]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Journal':
        return (
          <View>
            <TouchableOpacity style={styles(colors).addEntryButton}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles(colors).addEntryButtonText}>Add Entry</Text>
            </TouchableOpacity>
            {plant.journalEntries.map(entry => (
              <View key={entry.id} style={styles(colors).journalEntry}>
                <Text style={styles(colors).journalTitle}>{entry.title}</Text>
                <Text style={styles(colors).journalDate}>{entry.date}</Text>
                <Text style={styles(colors).journalDescription}>{entry.description}</Text>
              </View>
            ))}
          </View>
        );
      case 'Tasks':
        return (
          <View>
            {plant.tasks.map(task => (
              <View key={task.id} style={styles(colors).taskItem}>
                <Text style={styles(colors).taskText}>{task.text}</Text>
                <Text style={styles(colors).taskDueDate}>Due: {task.due}</Text>
              </View>
            ))}
          </View>
        );
      case 'Photos':
        return (
          <View style={styles(colors).photoGrid}>
            {plant.photos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles(colors).photo} />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles(colors).safeArea}>
      <ScrollView style={styles(colors).container}>
        <View style={styles(colors).imageContainer}>
          <Image source={{ uri: plant.image }} style={styles(colors).plantImage} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles(colors).backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles(colors).imageBadge}>
            <Text style={styles(colors).imageBadgeText}>{plant.plantedFrom}</Text>
          </View>
        </View>

        <View style={styles(colors).card}>
          <View style={styles(colors).primaryInfo}>
            <View style={styles(colors).infoItem}>
              <Text style={styles(colors).infoLabel}>Stage</Text>
              <Text style={styles(colors).infoValue}>{plant.stage}</Text>
            </View>
            <View style={styles(colors).infoItem}>
              <Text style={styles(colors).infoLabel}>Location</Text>
              <Text style={styles(colors).infoValue}>{plant.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles(colors).card}>
          <Text style={styles(colors).cardTitle}>Care Information</Text>
          <View style={styles(colors).careGrid}>
            <CareInfoItem icon="water-outline" label="Last Watered" value={plant.lastWatered} colors={colors} />
            <CareInfoItem icon="white-balance-sunny" label="Sunlight" value={plant.sunlight} colors={colors} />
            <CareInfoItem icon="thermometer" label="Temperature" value={plant.temperature} colors={colors} />
            <CareInfoItem icon="calendar-start" label="Planted Date" value={plant.plantedDate} colors={colors} />
          </View>
        </View>

        <View style={styles(colors).tabContainer}>
          <TouchableOpacity
            style={[styles(colors).tab, activeTab === 'Journal' && styles(colors).activeTab]}
            onPress={() => setActiveTab('Journal')}
          >
            <Text style={[styles(colors).tabText, activeTab === 'Journal' && styles(colors).activeTabText]}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles(colors).tab, activeTab === 'Tasks' && styles(colors).activeTab]}
            onPress={() => setActiveTab('Tasks')}
          >
            <Text style={[styles(colors).tabText, activeTab === 'Tasks' && styles(colors).activeTabText]}>Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles(colors).tab, activeTab === 'Photos' && styles(colors).activeTab]}
            onPress={() => setActiveTab('Photos')}
          >
            <Text style={[styles(colors).tabText, activeTab === 'Photos' && styles(colors).activeTabText]}>Photos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles(colors).tabContent}>
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  plantImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  imageBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  careItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  careIcon: {
    marginBottom: 8,
  },
  careLabel: {
    fontSize: 12,
    color: colors.text,
  },
  careValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.muted,
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 18,
  },
  activeTab: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    padding: 16,
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addEntryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  journalEntry: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  journalDate: {
    fontSize: 12,
    color: colors.text,
    marginVertical: 4,
  },
  journalDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  taskItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: colors.text,
  },
  taskDueDate: {
    fontSize: 14,
    color: colors.destructive,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photo: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: '4%',
  },
});