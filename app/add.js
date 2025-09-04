import React, { useState, useEffect } from 'react';
import { ScrollView, Switch, Text, View, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createPlant, getGardenBeds, getSeedCompanies, getPlantFamilies, getPlantTemplates, uploadPhoto } from '../src/services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { Camera, Search, X } from 'lucide-react-native';

const AddPlantScreen = () => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [plantedFromSeed, setPlantedFromSeed] = useState(false);
  const [seedPurchasedFrom, setSeedPurchasedFrom] = useState(null);
  const [family, setFamily] = useState(null);
  const [daysToHarvest, setDaysToHarvest] = useState('');
  const [plantedDate, setPlantedDate] = useState(null);
  const [transplantedDate, setTransplantedDate] = useState(null);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [selectedBed, setSelectedBed] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [gardenBeds, setGardenBeds] = useState([]);
  const [seedCompanies, setSeedCompanies] = useState([]);
  const [plantFamilies, setPlantFamilies] = useState([]);
  const [plantTemplates, setPlantTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  useEffect(() => {
    const loadData = async () => {
      try {
        const beds = await getGardenBeds();
        setGardenBeds(beds.map(bed => ({ label: bed.name, value: bed.id })));
        const companies = await getSeedCompanies();
        setSeedCompanies(companies.map(company => ({ label: company.name, value: company.id })));
        const families = await getPlantFamilies();
        setPlantFamilies(families.map(family => ({ label: family.name, value: family.id })));
        const templates = await getPlantTemplates();
        setPlantTemplates(templates);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (transplantedDate && daysToHarvest) {
      const transplant = new Date(transplantedDate);
      if (!isNaN(transplant.getTime())) {
        const harvestDays = parseInt(daysToHarvest);
        if (!isNaN(harvestDays)) {
          const expectedHarvest = new Date(transplant);
          expectedHarvest.setDate(transplant.getDate() + harvestDays);
          setExpectedHarvestDate(expectedHarvest.toISOString().split('T')[0]);
        }
      }
    } else {
      setExpectedHarvestDate('');
    }
  }, [transplantedDate, daysToHarvest]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setName(template.common_name);
    setFamily(template.family);
    setDaysToHarvest(template.days_to_harvest?.toString());
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a name for the plant.");
      return;
    }

    setIsSaving(true);
    try {
      const plantData = {
        name,
        notes,
        bed_id: selectedBed,
        planted_from_seed: plantedFromSeed,
        seed_purchased_from: plantedFromSeed ? seedPurchasedFrom : null,
        family,
        days_to_harvest: daysToHarvest ? parseInt(daysToHarvest) : null,
        planted_date: plantedFromSeed ? (plantedDate ? plantedDate.toISOString().split('T')[0] : null) : null,
        transplanted_date: transplantedDate ? transplantedDate.toISOString().split('T')[0] : null,
        expected_harvest_date: expectedHarvestDate || null,
        variety_id: selectedTemplate?.id
      };
      const newPlant = await createPlant(plantData);
      if (imageUri) {
        await uploadPhoto(imageUri, newPlant.id);
      }
      Alert.alert("Success", "Plant added successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not add plant.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 16,
    },
    section: {
      padding: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    templateGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    templateCard: {
      width: '48%',
      marginBottom: 16,
    },
    templateImage: {
      width: '100%',
      height: 100,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    imagePicker: {
      alignItems: 'center',
      marginBottom: 24,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
    },
  });

  if (showTemplates) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Plant</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Choose a Plant Type</Text>
          <View style={styles.templateGrid}>
            {plantTemplates.map((template) => (
              <TouchableOpacity key={template.id} style={styles.templateCard} onPress={() => handleTemplateSelect(template)}>
                <Card>
                  <Image source={{ uri: template.image_url }} style={styles.templateImage} />
                  <CardHeader>
                    <CardTitle>{template.common_name}</CardTitle>
                  </CardHeader>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
          <Button variant="outline" onPress={() => setShowTemplates(false)}>Create Custom Plant</Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" size="icon" onPress={() => setShowTemplates(true)}>
          <Search color={colors.text} />
        </Button>
        <Text style={styles.headerTitle}>Add New Plant</Text>
        {selectedTemplate && (
          <Button variant="ghost" size="icon" onPress={() => setSelectedTemplate(null)}>
            <X color={colors.text} />
          </Button>
        )}
      </View>
      <View style={styles.section}>
        {selectedTemplate && (
          <Card style={{ marginBottom: 24 }}>
            <CardHeader>
              <CardTitle>Using {selectedTemplate.common_name} template</CardTitle>
              <CardDescription>You can customize all details below</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.imagePicker}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <View style={[styles.image, { backgroundColor: colors.muted, justifyContent: 'center', alignItems: 'center' }]}>
                  <Camera color={colors.mutedForeground} size={48} />
                </View>
              )}
              <Button variant="outline" onPress={pickImage}>Choose Photo</Button>
            </View>
          </CardContent>
        </Card>

        <Card style={{ marginTop: 24 }}>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={styles.label}>Plant Name</Text>
            <Input
              placeholder="e.g., Cherry Tomato"
              value={name}
              onChangeText={setName}
            />
            <View style={{ height: 16 }} />
            <View style={styles.row}>
              <Text style={styles.label}>Planted from Seed:</Text>
              <Switch
                onValueChange={setPlantedFromSeed}
                value={plantedFromSeed}
              />
            </View>

            {plantedFromSeed && (
              <>
                <Text style={styles.label}>Seed Company</Text>
                <Select
                  selectedValue={seedPurchasedFrom}
                  onValueChange={(itemValue) => setSeedPurchasedFrom(itemValue)}
                  options={[
                    { label: "Select Seed Company...", value: null },
                    ...seedCompanies,
                  ]}
                />
                <Text style={styles.label}>Seed Planted Date</Text>
                <DatePicker
                  value={plantedDate}
                  onValueChange={setPlantedDate}
                  placeholder="Select Date"
                />
              </>
            )}

            <Text style={styles.label}>Plant Family</Text>
            <Select
              selectedValue={family}
              onValueChange={(itemValue) => setFamily(itemValue)}
              options={[
                { label: "Select Plant Family...", value: null },
                ...plantFamilies,
              ]}
            />

            <Text style={styles.label}>Days to Harvest</Text>
            <Input
              placeholder="e.g., 90"
              value={daysToHarvest}
              onChangeText={setDaysToHarvest}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Transplanted Date</Text>
            <DatePicker
              value={transplantedDate}
              onValueChange={setTransplantedDate}
              placeholder="Select Date"
            />
            <Text style={styles.label}>Expected Harvest Date</Text>
            <Input
              placeholder="YYYY-MM-DD"
              value={expectedHarvestDate}
              editable={false}
            />
            <Text style={styles.label}>Garden Bed</Text>
            <Select
              selectedValue={selectedBed}
              onValueChange={(itemValue) => setSelectedBed(itemValue)}
              options={[
                { label: "Select a Garden Bed...", value: null },
                ...gardenBeds,
              ]}
            />
            <Text style={styles.label}>Notes</Text>
            <Input
              placeholder="Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              style={{ height: 100, textAlignVertical: 'top' }}
            />
          </CardContent>
        </Card>

        <View style={{ marginTop: 24 }}>
          <Button onPress={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Plant"}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddPlantScreen;