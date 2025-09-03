import React, { useCallback, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Alert, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getGardenBeds } from '../../../src/services/api';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '../../../constants/Colors';
import { Plus, Settings, Bed, Sun, Droplets } from 'lucide-react-native';

export default function BedsScreen() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  useFocusEffect(
    useCallback(() => {
      const loadBeds = async () => {
        try {
          setLoading(true);
          const data = await getGardenBeds();
          setBeds(data);
        } catch (error) {
          console.error("Failed to fetch garden beds:", error);
          Alert.alert("Error", "Could not load garden beds.");
        } finally {
          setLoading(false);
        }
      };
      loadBeds();
    }, [])
  );

  const renderBed = (bed) => (
    <Pressable key={bed.id} onPress={() => router.push(`/beds/${bed.id}`)}>
      <Card style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
            <Bed color={colors.accentForeground} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: '600', fontSize: 18 }}>{bed.name}</ThemedText>
            <ThemedText style={{ color: colors.mutedForeground, fontSize: 14 }}>{bed.location}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Sun size={14} color={colors.mutedForeground} />
                <ThemedText style={{ fontSize: 12, color: colors.mutedForeground }}>{bed.sun_exposure}</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Droplets size={14} color={colors.mutedForeground} />
                <ThemedText style={{ fontSize: 12, color: colors.mutedForeground }}>{bed.irrigation}</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <ThemedView style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <ThemedText style={styles.headerTitle}>Garden Beds</ThemedText>
          <ThemedText style={{ color: colors.mutedForeground }}>Your garden layout</ThemedText>
        </View>
        <Button variant="ghost" size="icon" onPress={() => router.push('/add-garden-bed')}>
          <Plus color={colors.foreground} />
        </Button>
      </ThemedView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />
      ) : (
        <View style={styles.bedList}>
          {beds.length > 0 ? (
            beds.map(renderBed)
          ) : (
            <ThemedText style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 40 }}>
              No garden beds found. Add one to get started!
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
  bedList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});