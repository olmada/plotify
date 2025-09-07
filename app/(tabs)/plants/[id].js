import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, useColorScheme, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

import { supabase } from '../../../src/services/supabase';
import { Colors } from '../../../constants/Colors';
import { Theme } from '../../../constants/Theme';
import { Button } from '../../../components/ui/Button';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const PlantDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Journal');

  useEffect(() => {
    if (id) {
      fetchPlantDetails();
    }
  }, [id]);

  const fetchPlantDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plants')
      .select(`
        id,
        name,
        stage,
        notes,
        last_watered,
        planted_date,
        transplanted_date,
        planted_from_seed,
        garden_beds ( name ),
        plant_varieties (
          common_name,
          scientific_name,
          temperature_min,
          temperature_max,
          sunlight_requirements
        ),
        journals ( id, title, description, created_at ),
        tasks ( id, title, due_date, completed ),
        photos ( id, storage_path )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching plant details:', error);
    } else {
      setPlant(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors[colorScheme].primary} style={{ flex: 1 }} />;
  }

  if (!plant) {
    return <View style={styles.container}><Text style={styles.text}>Plant not found.</Text></View>;
  }

  const mainPhoto = plant.photos?.length > 0
    ? supabase.storage.from('plant-photos').getPublicUrl(plant.photos[0].storage_path).data.publicUrl
    : 'https://placehold.co/600x400/a2e1a2/4d4d4d?text=No+Image';

  const renderContent = () => {
    switch (activeTab) {
      case 'Journal':
        return (
          <View>
            {plant.journals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(entry => (
              <View key={entry.id} style={styles.journalEntry}>
                <Text style={styles.journalTitle}>{entry.title}</Text>
                <Text style={styles.journalDate}>{formatDate(entry.created_at)}</Text>
                <Text style={styles.journalDescription}>{entry.description}</Text>
              </View>
            ))}
          </View>
        );
      case 'Tasks':
        return (
          <View>
            {plant.tasks.map(task => (
              <View key={task.id} style={styles.taskEntry}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDueDate}>Due: {formatDate(task.due_date)}</Text>
              </View>
            ))}
          </View>
        );
      case 'Photos':
        return (
          <View style={styles.photoGrid}>
            {plant.photos.map(photo => (
              <Image
                key={photo.id}
                source={{ uri: supabase.storage.from('plant-photos').getPublicUrl(photo.storage_path).data.publicUrl }}
                style={styles.photo}
              />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: plant.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push(`/edit-plant/${id}`)} style={{ marginRight: 16 }}>
              <Ionicons name="pencil" size={24} color={Colors[colorScheme].primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.imageContainer}>
        <Image source={{ uri: mainPhoto }} style={styles.plantImage} />
        {plant.planted_from_seed !== null && (
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>
              {plant.planted_from_seed ? 'From Seed' : 'Transplanted'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.varietyName}>{plant.plant_varieties?.common_name}</Text>
        <Text style={styles.scientificName}>{plant.plant_varieties?.scientific_name}</Text>
      </View>

      {plant.notes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.text}>{plant.notes}</Text>
        </View>
      )}

      <View style={styles.card}>
        <InfoItem icon="leaf-outline" label="Stage" value={plant.stage || 'N/A'} />
        <InfoItem icon="map-marker-outline" label="Location" value={plant.garden_beds?.name || 'N/A'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Care Information</Text>
        <View style={styles.grid}>
          <InfoItem icon="water-outline" label="Last Watered" value={plant.last_watered ? formatDistanceToNow(new Date(plant.last_watered), { addSuffix: true }) : 'N/A'} />
          <InfoItem icon="white-balance-sunny" label="Sunlight" value={plant.plant_varieties?.sunlight_requirements || 'N/A'} />
          <InfoItem icon="thermometer" label="Temp. Range" value={plant.plant_varieties ? `${plant.plant_varieties.temperature_min}-${plant.plant_varieties.temperature_max}°F` : 'N/A'} />
          <InfoItem icon="calendar-outline" label="Planted Date" value={formatDate(plant.planted_date)} />
          {plant.transplanted_date && <InfoItem icon="calendar-sync-outline" label="Transplanted" value={formatDate(plant.transplanted_date)} />}
        </View>
      </View>

      <View style={styles.tabContainer}>
        {['Journal', 'Tasks', 'Photos'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'Journal' && (
          <Button onPress={() => router.push(`/add-entry/${id}`)} style={{ marginBottom: Theme.Spacing.medium }}>
            + Add Entry
          </Button>
        )}
        {renderContent()}
      </View>
    </ScrollView>
  );
};

const InfoItem = ({ icon, label, value }) => {
  const colorScheme = useColorScheme();
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);
  return (
    <View style={styles.infoItem}>
      <MaterialCommunityIcons name={icon} size={24} color={Colors[colorScheme].primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const getStyles = (colorScheme) => StyleSheet.create({
  varietyName: {
    fontSize: Theme.Fonts.sizes.xlarge,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    textAlign: 'center',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: Theme.Fonts.sizes.medium,
    color: Colors[colorScheme].darkGray,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Theme.Spacing.medium,
  },
  container: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
  },
  text: {
    color: Colors[colorScheme].text,
  },
  imageContainer: {
    marginBottom: Theme.Spacing.medium,
  },
  plantImage: {
    width: '100%',
    height: 250,
  },
  imageBadge: {
    position: 'absolute',
    top: Theme.Spacing.small,
    right: Theme.Spacing.small,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Theme.Spacing.small,
    paddingVertical: 4,
    borderRadius: Theme.Radii.small,
  },
  imageBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: Colors[colorScheme].card,
    borderRadius: Theme.Radii.medium,
    padding: Theme.Spacing.medium,
    marginHorizontal: Theme.Spacing.medium,
    marginBottom: Theme.Spacing.medium,
    ...Theme.Shadows.medium,
  },
  cardTitle: {
    fontSize: Theme.Fonts.sizes.large,
    fontWeight: Theme.Fonts.weights.bold,
    color: Colors[colorScheme].text,
    marginBottom: Theme.Spacing.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: Theme.Spacing.medium,
  },
  infoLabel: {
    color: Colors[colorScheme].darkGray,
    marginTop: 4,
  },
  infoValue: {
    color: Colors[colorScheme].text,
    fontWeight: 'bold',
    fontSize: Theme.Fonts.sizes.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: Theme.Spacing.medium,
    marginBottom: Theme.Spacing.medium,
    backgroundColor: Colors[colorScheme].card,
    borderRadius: Theme.Radii.medium,
  },
  tab: {
    paddingVertical: Theme.Spacing.medium,
    paddingHorizontal: Theme.Spacing.large,
  },
  activeTab: {
    borderBottomColor: Colors[colorScheme].primary,
    borderBottomWidth: 2,
  },
  tabText: {
    color: Colors[colorScheme].darkGray,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: Colors[colorScheme].primary,
  },
  tabContent: {
    paddingHorizontal: Theme.Spacing.medium,
  },
  journalEntry: {
    backgroundColor: Colors[colorScheme].card,
    borderRadius: Theme.Radii.medium,
    padding: Theme.Spacing.medium,
    marginBottom: Theme.Spacing.medium,
  },
  journalTitle: {
    fontSize: Theme.Fonts.sizes.medium,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
  },
  journalDate: {
    color: Colors[colorScheme].darkGray,
    fontSize: Theme.Fonts.sizes.small,
    marginBottom: Theme.Spacing.small,
  },
  journalDescription: {
    color: Colors[colorScheme].text,
  },
  taskEntry: {
    backgroundColor: Colors[colorScheme].card,
    borderRadius: Theme.Radii.medium,
    padding: Theme.Spacing.medium,
    marginBottom: Theme.Spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: Theme.Fonts.sizes.medium,
    color: Colors[colorScheme].text,
  },
  taskDueDate: {
    color: Colors[colorScheme].darkGray,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photo: {
    width: '48%',
    height: 150,
    borderRadius: Theme.Radii.medium,
    marginBottom: Theme.Spacing.small,
  },
});

export default PlantDetailScreen;