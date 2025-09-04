import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createGardenBed, uploadPhoto } from '../src/services/api';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { ArrowLeft, Camera } from 'lucide-react-native';

export default function AddGardenBedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a name for the garden bed.");
      return;
    }

    setIsSaving(true);
    try {
      const newBed = await createGardenBed({ name: name.trim(), location: location.trim(), size: size.trim(), description: description.trim() });
      if (imageUri) {
        await uploadPhoto(imageUri, null, newBed.id);
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not save the garden bed.");
      console.error(error);
    } finally {
      setIsSaving(false);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft color={colors.text} />
        </Button>
        <Text style={styles.headerTitle}>Add Garden Bed</Text>
      </View>

      <View style={styles.section}>
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
            <CardDescription>Add a photo of your new garden bed</CardDescription>
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
      </View>

      <View style={styles.section}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={styles.label}>Name</Text>
            <Input
              placeholder="e.g. Vegetable Patch"
              value={name}
              onChangeText={setName}
            />
            <View style={{ height: 16 }} />
            <Text style={styles.label}>Location</Text>
            <Input
              placeholder="e.g. Backyard"
              value={location}
              onChangeText={setLocation}
            />
            <View style={{ height: 16 }} />
            <Text style={styles.label}>Size</Text>
            <Input
              placeholder="e.g. 4x8 feet"
              value={size}
              onChangeText={setSize}
            />
            <View style={{ height: 16 }} />
            <Text style={styles.label}>Description</Text>
            <Textarea
              placeholder="Notes about this garden bed..."
              value={description}
              onChangeText={setDescription}
            />
          </CardContent>
        </Card>
      </View>

      <View style={styles.section}>
        <Button onPress={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Create Bed'}
        </Button>
      </View>
    </ScrollView>
  );
}
