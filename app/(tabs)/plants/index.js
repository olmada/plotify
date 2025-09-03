
import React, { useCallback, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Alert, StyleSheet, Pressable, Image } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getPlants } from '../../../src/services/api';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '../../../constants/Colors';
import { Plus, Settings, Sprout } from 'lucide-react-native';

export default function PlantsScreen() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const renderPlant = (plant) => (
    <Pressable key={plant.id} onPress={() => router.push(`/plant/${plant.id}`)}>
      <Card style={{ marginBottom: 16 }}>
          {plant.image_url && (
              <Image source={{ uri: plant.image_url }} style={styles.plantImage} />
          )}
        <View style={{ padding: 16 }}>
            <ThemedText style={{ fontWeight: '600', fontSize: 18, marginBottom: 8 }}>{plant.name}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Badge variant="outline">
                    <Sprout size={12} color={colors.mutedForeground} />
                    <ThemedText style={{ marginLeft: 4, fontSize: 12, color: colors.mutedForeground }}>
                        {plant.variety}
                    </ThemedText>
                </Badge>
                {plant.bed && (
                    <Badge variant="secondary">
                        <ThemedText>{plant.bed.name}</ThemedText>
                    </Badge>
                )}
            </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <ThemedView style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <ThemedText style={styles.headerTitle}>My Plants</ThemedText>
          <ThemedText style={{ color: colors.mutedForeground }}>Your plant collection</ThemedText>
        </View>
        <Button variant="ghost" size="icon" onPress={() => router.push('/add')}>
          <Plus color={colors.foreground} />
        </Button>
      </ThemedView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />
      ) : (
        <View style={styles.plantList}>
          {plants.length > 0 ? (
            plants.map(renderPlant)
          ) : (
            <ThemedText style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 40 }}>
              No plants found. Add one to get started!
            </ThemedText>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  plantList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  plantImage: {
      width: '100%',
      height: 150,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
  }
});
