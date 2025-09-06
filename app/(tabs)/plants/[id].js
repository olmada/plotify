import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useNavigation, Link } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

const CareInfoItem = ({ icon, label, value }) => (
  <View style={styles.careItem}>
    <MaterialCommunityIcons name={icon} size={24} color="#34495e" style={styles.careIcon} />
    <Text style={styles.careLabel}>{label}</Text>
    <Text style={styles.careValue}>{value}</Text>
  </View>
);

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Journal');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: plant.name,
      headerRight: () => (
        <Link href={`/edit-plant/${id}`} asChild>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="pencil" size={24} color="#007AFF" />
          </TouchableOpacity>
        </Link>
      ),
    });
  }, [navigation, id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Journal':
        return (
          <View>
            <TouchableOpacity style={styles.addEntryButton}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addEntryButtonText}>Add Entry</Text>
            </TouchableOpacity>
            {plant.journalEntries.map(entry => (
              <View key={entry.id} style={styles.journalEntry}>
                <Text style={styles.journalTitle}>{entry.title}</Text>
                <Text style={styles.journalDate}>{entry.date}</Text>
                <Text style={styles.journalDescription}>{entry.description}</Text>
              </View>
            ))}
          </View>
        );
      case 'Tasks':
        return (
          <View>
            {plant.tasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskText}>{task.text}</Text>
                <Text style={styles.taskDueDate}>Due: {task.due}</Text>
              </View>
            ))}
          </View>
        );
      case 'Photos':
        return (
          <View style={styles.photoGrid}>
            {plant.photos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.photo} />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: plant.image }} style={styles.plantImage} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{plant.plantedFrom}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.primaryInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Stage</Text>
              <Text style={styles.infoValue}>{plant.stage}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{plant.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Care Information</Text>
          <View style={styles.careGrid}>
            <CareInfoItem icon="water-outline" label="Last Watered" value={plant.lastWatered} />
            <CareInfoItem icon="white-balance-sunny" label="Sunlight" value={plant.sunlight} />
            <CareInfoItem icon="thermometer" label="Temperature" value={plant.temperature} />
            <CareInfoItem icon="calendar-start" label="Planted Date" value={plant.plantedDate} />
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Journal' && styles.activeTab]}
            onPress={() => setActiveTab('Journal')}
          >
            <Text style={[styles.tabText, activeTab === 'Journal' && styles.activeTabText]}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
            onPress={() => setActiveTab('Tasks')}
          >
            <Text style={[styles.tabText, activeTab === 'Tasks' && styles.activeTabText]}>Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Photos' && styles.activeTab]}
            onPress={() => setActiveTab('Photos')}
          >
            <Text style={[styles.tabText, activeTab === 'Photos' && styles.activeTabText]}>Photos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
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
    backgroundColor: 'white',
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
    color: '#555',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
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
    color: '#7f8c8d',
  },
  careValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#E9ECEF',
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 18,
  },
  activeTab: {
    backgroundColor: 'white',
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
    color: '#495057',
  },
  activeTabText: {
    color: '#2c3e50',
  },
  tabContent: {
    padding: 16,
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  journalDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginVertical: 4,
  },
  journalDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#34495e',
  },
  taskDueDate: {
    fontSize: 14,
    color: '#c0392b',
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