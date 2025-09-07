import React, { useCallback, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Alert, StyleSheet, Pressable, Image, Text, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getPlants } from '../../../src/services/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '../../../constants/Colors';
import { Settings, MapPin, Calendar, Camera, CheckSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = ["All Plants", "From Seed", "Transplanted"];

export default function PlantsScreen() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  useFocusEffect(
    useCallback(() => {
      const loadPlants = async () => {
        try {
          setLoading(true);
          const data = await getPlants();
          setPlants(data);
        } catch (error) {
          console.error("Failed to fetch plants:", error);
          Alert.alert("Error", "Could not load plants.");
        } finally {
          setLoading(false);
        }
      };
      loadPlants();
    }, [])
  );

  const filteredPlants = plants
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => {
      if (activeFilter === 'From Seed') return p.status === 'seeded';
      if (activeFilter === 'Transplanted') return p.status === 'transplanted';
      return true;
    });

  const renderPlant = (plant) => (
    <Pressable key={plant.id} onPress={() => router.push(`/plants/${plant.id}`)}>
      <Card style={styles.plantCard}>
        <Image source={{ uri: plant.image_url || 'https://placehold.co/100x120' }} style={styles.plantImage} />
        <View style={styles.plantInfo}>
          <View style={styles.plantHeader}>
            <Text style={styles.plantName}>{plant.name}</Text>
            <Badge variant={plant.status === 'seeded' ? 'success' : 'secondary'}>
              <Text style={styles.badgeText}>{plant.status}</Text>
            </Badge>
          </View>
          <Text style={styles.latinName}>{plant.latin_name} &apos;{plant.variety}&apos;</Text>
          
          <View style={styles.plantDetailRow}>
            <MapPin size={14} color={colors.mutedForeground} />
            <Text style={styles.detailText}>{plant.bed?.name || 'Not specified'}</Text>
          </View>
          <View style={styles.plantDetailRow}>
            <Calendar size={14} color={colors.mutedForeground} />
            <Text style={styles.detailText}>Planted on {new Date(plant.planted_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.plantDetailRow}>
            <Camera size={14} color={colors.mutedForeground} />
            <Text style={styles.detailText}>{plant.photo_count || 0} photos</Text>
            <View style={styles.separator} />
            <CheckSquare size={14} color={colors.mutedForeground} />
            <Text style={styles.detailText}>{plant.task_count || 0} active tasks</Text>
          </View>

          <Text style={styles.lastUpdated}>Last updated: {new Date(plant.updated_at).toLocaleDateString()}</Text>
        </View>
      </Card>
    </Pressable>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      paddingTop: 16, // Adjusted for SafeAreaView
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      color: colors.mutedForeground,
      marginTop: 4,
    },
    searchBarContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    searchInput: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 24,
      paddingBottom: 16,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeFilter: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      color: colors.text,
    },
    activeFilterText: {
      color: colors.primaryForeground,
      fontWeight: 'bold',
    },
    plantList: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    plantCard: {
      flexDirection: 'row',
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },
    plantImage: {
      width: 100,
      height: '100%',
    },
    plantInfo: {
      flex: 1,
      padding: 12,
    },
    plantHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    plantName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    latinName: {
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    plantDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    detailText: {
      color: colors.text,
      fontSize: 12,
    },
    separator: {
      width: 1,
      height: 12,
      backgroundColor: colors.border,
      marginHorizontal: 6,
    },
    lastUpdated: {
      fontSize: 10,
      color: colors.mutedForeground,
      textAlign: 'right',
      marginTop: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Plants</Text>
            <Text style={styles.subtitle}>{plants.length} plants in your garden</Text>
          </View>
          <TouchableOpacity>
            <Settings color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search plants..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.activeFilter]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />
        ) : (
          <View style={styles.plantList}>
            {filteredPlants.length > 0 ? (
              filteredPlants.map(renderPlant)
            ) : (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 40 }}>
                No plants found. Try adjusting your filters.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
