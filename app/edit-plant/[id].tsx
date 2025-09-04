import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet, ScrollView, useColorScheme, Text } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Plant, PlantingMethod } from '../../types/plant';
import { supabase } from '../../src/services/supabase';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';

const EditPlantScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  
  const [plant, setPlant] = useState<Partial<Plant>>({
    name: '',
    variety: '',
    plantingMethod: 'directSow',
    seedPurchasedFrom: undefined,
    daysToHarvest: undefined,
    gardenBed: undefined,
  });

  const [gardenBeds, setGardenBeds] = useState<{ label: string, value: any }[]>([]);
  const [seedCompanies, setSeedCompanies] = useState<{ label: string, value: any }[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: bedsData, error: bedsError } = await supabase.from('garden_beds').select('id, name');
      if (bedsError) console.error('Error fetching garden beds:', bedsError);
      else setGardenBeds(bedsData.map(bed => ({ label: bed.name, value: bed.id })));

      const { data: companiesData, error: companiesError } = await supabase.from('seed_companies').select('id, name');
      if (companiesError) console.error('Error fetching seed companies:', companiesError);
      else setSeedCompanies(companiesData.map(c => ({ label: c.name, value: c.id })));
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchPlantData = async () => {
        const { data, error } = await supabase
          .from('plants')
          .select(`
            *,
            garden_beds (name)
          `)
          .eq('id', id)
          .single();

        if (error) {
          Alert.alert("Error", "Failed to fetch plant data.");
          console.error('Error fetching plant data:', error);
        } else if (data) {
          let plantingMethod: PlantingMethod = 'purchasedStart';
          if (data.planted_from_seed && data.transplanted_date) {
            plantingMethod = 'transplant';
          } else if (data.planted_from_seed) {
            plantingMethod = 'directSow';
          }

          setPlant({
            name: data.name,
            variety: data.variety,
            plantingMethod: plantingMethod,
            seedPurchasedFrom: data.seed_purchased_from,
            purchasedFrom: data.purchased_from,
            seedPlantedDate: data.planted_date ? new Date(data.planted_date) : undefined,
            transplantedDate: data.transplanted_date ? new Date(data.transplanted_date) : undefined,
            daysToHarvest: data.days_to_harvest,
            gardenBed: data.bed_id
          });
        }
      };
      fetchPlantData();
    }
  }, [id]);

  const handleInputChange = (field: keyof Plant, value: any) => {
    setPlant(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        Alert.alert("Error", "You must be logged in to save a plant.");
        return;
    }

    if (!plant.name) {
        Alert.alert("Validation Error", "Plant name is required.");
        return;
    }
    if (!plant.gardenBed) {
        Alert.alert("Validation Error", "Please select a location.");
        return;
    }

    const plantToSave = {
        owner_id: user.id,
        name: plant.name,
        variety: plant.variety,
        planted_from_seed: plant.plantingMethod === 'directSow' || plant.plantingMethod === 'transplant',
        seed_purchased_from: plant.plantingMethod !== 'purchasedStart' ? plant.seedPurchasedFrom : null,
        purchased_from: plant.plantingMethod === 'purchasedStart' ? plant.purchasedFrom : null,
        planted_date: plant.seedPlantedDate,
        transplanted_date: plant.transplantedDate,
        days_to_harvest: plant.daysToHarvest,
        expected_harvest_date: plant.expectedHarvestDate,
        bed_id: plant.gardenBed,
    };

    const { error } = id 
      ? await supabase.from('plants').update(plantToSave).eq('id', id).select()
      : await supabase.from('plants').insert([plantToSave]).select();

    if (error) {
      Alert.alert('Error', `Failed to ${id ? 'update' : 'save'} plant: ${error.message}`);
      console.error(`Error ${id ? 'updating' : 'saving'} plant:`, error);
    } else {
      Alert.alert('Success', `Plant ${id ? 'updated' : 'saved'} successfully!`);
      router.back();
    }
  };

  useEffect(() => {
    const { plantingMethod, seedPlantedDate, transplantedDate, daysToHarvest } = plant;
    if (daysToHarvest === undefined || daysToHarvest === null) {
      handleInputChange('expectedHarvestDate', undefined);
      return;
    }

    let startDate: Date | undefined;
    if (plantingMethod === 'directSow') {
      startDate = seedPlantedDate;
    } else if (plantingMethod === 'transplant' || plantingMethod === 'purchasedStart') {
      startDate = transplantedDate;
    }

    if (startDate) {
      const harvestDate = new Date(startDate);
      harvestDate.setDate(harvestDate.getDate() + (daysToHarvest || 0));
      handleInputChange('expectedHarvestDate', harvestDate);
    } else {
      handleInputChange('expectedHarvestDate', undefined);
    }
  }, [plant.seedPlantedDate, plant.transplantedDate, plant.daysToHarvest, plant.plantingMethod, plant]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: Theme.Spacing.medium,
      backgroundColor: Colors[colorScheme].background,
    },
    section: {
      marginBottom: Theme.Spacing.large,
    },
    subtitle: {
      fontSize: Theme.Fonts.sizes.large,
      fontWeight: Theme.Fonts.weights.bold,
      marginBottom: Theme.Spacing.medium,
      color: Colors[colorScheme].text,
    },
    label: {
      fontSize: Theme.Fonts.sizes.medium,
      fontWeight: Theme.Fonts.weights.medium,
      marginBottom: Theme.Spacing.small,
      color: Colors[colorScheme].text,
    },
    disabledInput: {
      backgroundColor: Colors[colorScheme].lightGray,
      color: Colors[colorScheme].darkGray,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Plant Identity</Text>
        <Input
          placeholder="Plant Name (e.g., Tomato)"
          value={plant.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
        <Input
          placeholder="Variety (e.g., Cherokee Purple)"
          value={plant.variety}
          onChangeText={(text) => handleInputChange('variety', text)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Planting Method</Text>
        <SegmentedControl
          values={['Direct Sow', 'Transplant', 'Purchased Start']}
          selectedIndex={['directSow', 'transplant', 'purchasedStart'].indexOf(plant.plantingMethod!)}
          onChange={(event) => {
            const method = ['directSow', 'transplant', 'purchasedStart'][event.nativeEvent.selectedSegmentIndex] as PlantingMethod;
            handleInputChange('plantingMethod', method);
          }}
          tintColor={Colors[colorScheme].primary}
          fontStyle={{ color: Colors[colorScheme].text }}
          activeFontStyle={{ color: Colors[colorScheme].background }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Details</Text>
        {(plant.plantingMethod === 'directSow' || plant.plantingMethod === 'transplant') && (
          <>
            <Text style={styles.label}>Seed Purchased From</Text>
            <Select
              selectedValue={plant.seedPurchasedFrom}
              onValueChange={(value) => handleInputChange('seedPurchasedFrom', value)}
              options={[
                { label: 'Select a company', value: null },
                ...seedCompanies
              ]}
            />
            <Text style={styles.label}>Seed Planted Date</Text>
            <DatePicker
              value={plant.seedPlantedDate}
              onValueChange={(date) => handleInputChange('seedPlantedDate', date)}
              placeholder="Select Date"
            />
          </>
        )}
        {plant.plantingMethod === 'purchasedStart' && (
          <>
            <Text style={styles.label}>Purchased From</Text>
            <Input
                placeholder="e.g., Home Depot"
                value={plant.purchasedFrom}
                onChangeText={(text) => handleInputChange('purchasedFrom', text)}
            />
          </>
        )}
        {(plant.plantingMethod === 'transplant' || plant.plantingMethod === 'purchasedStart') && (
            <>
                <Text style={styles.label}>Transplant Date</Text>
                <DatePicker
                  value={plant.transplantedDate}
                  onValueChange={(date) => handleInputChange('transplantedDate', date)}
                  placeholder="Select Date"
                />
            </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Harvest Details</Text>
        <Text style={styles.label}>Days to Harvest</Text>
        <Input
          placeholder="e.g., 75"
          keyboardType="numeric"
          value={plant.daysToHarvest?.toString() || ''}
          onChangeText={(text) => handleInputChange('daysToHarvest', text ? parseInt(text, 10) : undefined)}
        />
        <Text style={styles.label}>Expected Harvest Date</Text>
        <Input
          style={styles.disabledInput}
          editable={false}
          value={plant.expectedHarvestDate ? plant.expectedHarvestDate.toLocaleDateString() : 'Calculated automatically'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Location</Text>
        <Select
          selectedValue={plant.gardenBed}
          onValueChange={(value) => handleInputChange('gardenBed', value)}
          options={[
            { label: 'Select a Location', value: null },
            ...gardenBeds
          ]}
        />
      </View>

      <View style={styles.section}>
        <Button onPress={handleSave}>Save Plant</Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.Spacing.medium,
    backgroundColor: Colors[colorScheme].background,
  },
  section: {
    marginBottom: Theme.Spacing.large,
  },
  subtitle: {
    fontSize: Theme.Fonts.sizes.large,
    fontWeight: Theme.Fonts.weights.bold,
    marginBottom: Theme.Spacing.medium,
    color: Colors[colorScheme].text,
  },
  label: {
    fontSize: Theme.Fonts.sizes.medium,
    fontWeight: Theme.Fonts.weights.medium,
    marginBottom: Theme.Spacing.small,
    color: Colors[colorScheme].text,
  },
  disabledInput: {
    backgroundColor: Colors[colorScheme].lightGray,
    color: Colors[colorScheme].darkGray,
  },
});

export default EditPlantScreen;