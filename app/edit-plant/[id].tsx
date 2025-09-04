
import React, { useState, useEffect } from 'react';
import { View, Alert, TextInput, StyleSheet, ScrollView, Button, Modal, TouchableOpacity, FlatList, useColorScheme, Platform } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plant, PlantingMethod } from '../../types/plant';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../src/services/supabase';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { useLocalSearchParams, useRouter } from 'expo-router';

const seedCompanies = ["Burpee", "Baker Creek Heirloom Seeds", "Johnny's Selected Seeds", "Seed Savers Exchange", "Ferry-Morse", "Gurney's Seed & Nursery Co.", "Harris Seeds", "High Mowing Organic Seeds", "Territorial Seed Company", "Botanical Interests"];

const EditPlantScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  
  const [plant, setPlant] = useState<Partial<Plant>>({
    name: '',
    variety: '',
    plantingMethod: 'directSow',
    seedPurchasedFrom: seedCompanies[0],
    daysToHarvest: undefined,
    gardenBed: undefined,
  });

  const [gardenBeds, setGardenBeds] = useState<{ id: string, name: string }[]>([]);
  const [isAddSeedCompanyModalVisible, setAddSeedCompanyModalVisible] = useState(false);
  const [newSeedCompanyName, setNewSeedCompanyName] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'seedPlantedDate' | 'transplantedDate'>('seedPlantedDate');
  const [datePickerTitle, setDatePickerTitle] = useState('');
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [isSeedCompanyPickerModalVisible, setSeedCompanyPickerModalVisible] = useState(false);
  const [allSeedCompanies, setAllSeedCompanies] = useState(seedCompanies);

  useEffect(() => {
    const fetchGardenBeds = async () => {
      const { data, error } = await supabase.from('garden_beds').select('id, name');
      if (error) {
        console.error('Error fetching garden beds:', error);
      } else {
        setGardenBeds(data);
      }
    };
    fetchGardenBeds();
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
            gardenBed: data.garden_beds?.name
          });
        }
      };
      fetchPlantData();
    }
  }, [id, gardenBeds]);

  const handleInputChange = (field: keyof Plant, value: any) => {
    setPlant(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
        setDatePickerVisible(false);
    }
    if (selectedDate) {
      handleInputChange(datePickerField, selectedDate);
    }
  };

  const showDatePicker = (field: 'seedPlantedDate' | 'transplantedDate', title: string) => {
    setDatePickerField(field);
    setDatePickerTitle(title);
    setDatePickerVisible(true);
  };

  const handleAddNewSeedCompany = () => {
    if (newSeedCompanyName.trim() !== '' && !allSeedCompanies.includes(newSeedCompanyName.trim())) {
      const updatedCompanies = [...allSeedCompanies, newSeedCompanyName.trim()];
      setAllSeedCompanies(updatedCompanies);
      handleInputChange('seedPurchasedFrom', newSeedCompanyName.trim());
    }
    setAddSeedCompanyModalVisible(false);
    setNewSeedCompanyName('');
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

    const selectedBed = gardenBeds.find(bed => bed.name === plant.gardenBed);
    if (!selectedBed) {
        Alert.alert("Validation Error", "Invalid garden bed selected.");
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
        bed_id: selectedBed.id,
    };

    const { data, error } = id 
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
  }, [plant.seedPlantedDate, plant.transplantedDate, plant.daysToHarvest, plant.plantingMethod]);

  const styles = getStyles(colorScheme);

  const datePickerComponent = (
    <DateTimePicker
        value={plant[datePickerField] || new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleDateChange}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="subtitle">Plant Identity</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Plant Name (e.g., Tomato)"
          value={plant.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholderTextColor={Colors[colorScheme].mutedForeground}
        />
        <TextInput
          style={styles.input}
          placeholder="Variety (e.g., Cherokee Purple)"
          value={plant.variety}
          onChangeText={(text) => handleInputChange('variety', text)}
          placeholderTextColor={Colors[colorScheme].mutedForeground}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Planting Method</ThemedText>
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
        <ThemedText type="subtitle">Details</ThemedText>
        {(plant.plantingMethod === 'directSow' || plant.plantingMethod === 'transplant') && (
          <>
            <ThemedText style={styles.label}>Seed Purchased From</ThemedText>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setSeedCompanyPickerModalVisible(true)}>
                <ThemedText>{plant.seedPurchasedFrom || 'Select a company'}</ThemedText>
                <Feather name="chevron-down" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <ThemedText style={styles.label}>Seed Planted Date</ThemedText>
            <TouchableOpacity onPress={() => showDatePicker('seedPlantedDate', 'Select Seed Planted Date')} style={styles.button}>
              <ThemedText style={styles.buttonText}>{plant.seedPlantedDate ? plant.seedPlantedDate.toLocaleDateString() : 'Select Date'}</ThemedText>
            </TouchableOpacity>
          </>
        )}
        {plant.plantingMethod === 'purchasedStart' && (
          <>
            <ThemedText style={styles.label}>Purchased From</ThemedText>
            <TextInput
                style={styles.input}
                placeholder="e.g., Home Depot"
                value={plant.purchasedFrom}
                onChangeText={(text) => handleInputChange('purchasedFrom', text)}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
            />
          </>
        )}
        {(plant.plantingMethod === 'transplant' || plant.plantingMethod === 'purchasedStart') && (
            <>
                <ThemedText style={styles.label}>Transplant Date</ThemedText>
                <TouchableOpacity onPress={() => showDatePicker('transplantedDate', 'Select Transplant Date')} style={styles.button}>
                    <ThemedText style={styles.buttonText}>{plant.transplantedDate ? plant.transplantedDate.toLocaleDateString() : 'Select Date'}</ThemedText>
                </TouchableOpacity>
            </>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Harvest Details</ThemedText>
        <ThemedText style={styles.label}>Days to Harvest</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="e.g., 75"
          keyboardType="numeric"
          value={plant.daysToHarvest?.toString() || ''}
          onChangeText={(text) => handleInputChange('daysToHarvest', text ? parseInt(text, 10) : undefined)}
          placeholderTextColor={Colors[colorScheme].mutedForeground}
        />
        <ThemedText style={styles.label}>Expected Harvest Date</ThemedText>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          editable={false}
          value={plant.expectedHarvestDate ? plant.expectedHarvestDate.toLocaleDateString() : 'Calculated automatically'}
          placeholderTextColor={Colors[colorScheme].mutedForeground}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Location</ThemedText>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setLocationModalVisible(true)}>
            <ThemedText>{plant.gardenBed || 'Select a Location'}</ThemedText>
            <Feather name="chevron-down" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.buttonText}>Save Plant</ThemedText>
        </TouchableOpacity>
      </View>

      {isDatePickerVisible && Platform.OS === 'android' && datePickerComponent}
      {isDatePickerVisible && Platform.OS === 'ios' && (
        <Modal
            transparent={true}
            animationType="slide"
            visible={isDatePickerVisible}
            onRequestClose={() => setDatePickerVisible(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ThemedText style={styles.modalTitle}>{datePickerTitle}</ThemedText>
                    {datePickerComponent}
                    <Button title="Done" onPress={() => setDatePickerVisible(false)} color={Colors[colorScheme].primaryGreen} />
                </View>
            </View>
        </Modal>
      )}

      <Modal
        transparent={true}
        animationType="slide"
        visible={isLocationModalVisible}
        onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
                data={gardenBeds}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.modalItem}
                        onPress={() => {
                            handleInputChange('gardenBed', item.name);
                            setLocationModalVisible(false);
                        }}>
                        <ThemedText>{item.name}</ThemedText>
                    </TouchableOpacity>
                )}
            />
            <Button title="Cancel" onPress={() => setLocationModalVisible(false)} color={Colors[colorScheme].primaryGreen} />
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={isSeedCompanyPickerModalVisible}
        onRequestClose={() => setSeedCompanyPickerModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
                data={[...allSeedCompanies, 'Other...']}
                keyExtractor={item => item}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.modalItem}
                        onPress={() => {
                            if (item === 'Other...') {
                                setSeedCompanyPickerModalVisible(false);
                                setAddSeedCompanyModalVisible(true);
                            } else {
                                handleInputChange('seedPurchasedFrom', item);
                                setSeedCompanyPickerModalVisible(false);
                            }
                        }}>
                        <ThemedText>{item}</ThemedText>
                    </TouchableOpacity>
                )}
            />
            <Button title="Cancel" onPress={() => setSeedCompanyPickerModalVisible(false)} color={Colors[colorScheme].primaryGreen} />
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={isAddSeedCompanyModalVisible}
        onRequestClose={() => setAddSeedCompanyModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Add New Seed Company</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={newSeedCompanyName}
              onChangeText={setNewSeedCompanyName}
              placeholderTextColor={Colors[colorScheme].mutedForeground}
            />
            <Button title="Add" onPress={handleAddNewSeedCompany} color={Colors[colorScheme].primaryGreen} />
            <Button title="Cancel" onPress={() => setAddSeedCompanyModalVisible(false)} color={Colors[colorScheme].primaryGreen} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.Spacing.medium,
    backgroundColor: Colors[colorScheme].background,
  },
  section: {
    marginBottom: Theme.Spacing.large,
  },
  label: {
    fontSize: Theme.Fonts.sizes.medium,
    fontWeight: Theme.Fonts.weights.medium,
    marginBottom: Theme.Spacing.small,
    color: Colors[colorScheme].text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors[colorScheme].muted,
    borderRadius: 8,
    padding: Theme.Spacing.medium,
    marginBottom: Theme.Spacing.medium,
    fontSize: Theme.Fonts.sizes.medium,
    color: Colors[colorScheme].text,
    backgroundColor: Colors[colorScheme].cardBackground,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: Colors[colorScheme].muted,
    borderRadius: 8,
    padding: Theme.Spacing.medium,
    marginBottom: Theme.Spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors[colorScheme].cardBackground,
  },
  disabledInput: {
    backgroundColor: Colors[colorScheme].lightGray,
    color: Colors[colorScheme].darkGray,
  },
  button: {
    backgroundColor: Colors[colorScheme].primaryGreen,
    padding: Theme.Spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Theme.Spacing.medium,
  },
  saveButton: {
    backgroundColor: Colors[colorScheme].accentGreen,
    padding: Theme.Spacing.large,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors[colorScheme].background,
    fontSize: Theme.Fonts.sizes.medium,
    fontWeight: Theme.Fonts.weights.bold,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors[colorScheme].cardBackground,
    padding: Theme.Spacing.large,
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: Theme.Fonts.sizes.large,
    fontWeight: Theme.Fonts.weights.bold,
    marginBottom: Theme.Spacing.medium,
    textAlign: 'center',
    color: Colors[colorScheme].text,
  },
  modalItem: {
      padding: Theme.Spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].lightGray,
  }
});

export default EditPlantScreen;
