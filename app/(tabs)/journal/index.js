import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '../../../constants/Colors';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Settings, Calendar, Camera, CheckCircle, Sprout, Droplets } from 'lucide-react-native';

export default function JournalScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState('all');

  const journalEntries = [
    {
      id: '1',
      type: 'plant_added',
      title: 'Added Cherry Tomatoes',
      description: 'Transplanted seedlings into Vegetable Patch',
      plant: 'Cherry Tomatoes',
      bed: 'Vegetable Patch',
      date: 'Today',
      time: '2:30 PM',
      image: 'https://images.unsplash.com/photo-1592841200221-76e4732eacbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjBwbGFudCUyMGdhcmRlbnxlbnwxfHx8fDE3NTY2NTIwMjZ8MA&ixlib=rb-4.1.0&q=80&w=400'
    },
    {
      id: '2',
      type: 'task_completed',
      title: 'Watered herbs',
      description: 'Deep watering for all herb plants',
      plant: 'Basil, Oregano, Thyme',
      bed: 'Herb Garden',
      date: 'Today',
      time: '8:00 AM',
      icon: Droplets
    },
  ];

  const getEntryIcon = (type) => {
    switch (type) {
      case 'plant_added': return Sprout;
      case 'task_completed': return CheckCircle;
      case 'journal_entry': return Camera;
      case 'bed_created': return Calendar;
      default: return Calendar;
    }
  };

  const filteredEntries = journalEntries.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'plants') return entry.type === 'plant_added' || entry.plant;
    if (filter === 'beds') return entry.type === 'bed_created' || entry.bed;
    if (filter === 'tasks') return entry.type === 'task_completed';
    return true;
  });

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Garden Journal</Text>
          <Text style={{ color: colors.mutedForeground }}>Your growing timeline</Text>
        </View>
        <Button variant="ghost" size="icon">
          <Settings color={colors.mutedForeground} size={20} />
        </Button>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'plants', 'beds', 'tasks'].map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? 'default' : 'outline'}
            size="sm"
            onPress={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </View>

      <View style={styles.timeline}>
        {filteredEntries.map((entry, index) => {
          const IconComponent = entry.icon || getEntryIcon(entry.type);
          return (
            <View key={entry.id} style={styles.timelineItem}>
              <Card>
                <CardHeader>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                      <IconComponent color={colors.accentForeground} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View>
                          <CardTitle>{entry.title}</CardTitle>
                          <CardDescription>{entry.description}</CardDescription>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{entry.date}</Text>
                          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{entry.time}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </CardHeader>
                <CardContent>
                  {entry.image && (
                    <Image source={{ uri: entry.image }} style={styles.image} />
                  )}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    {entry.plant && (
                      <Badge variant="outline">
                        🌱 {entry.plant}
                      </Badge>
                    )}
                    {entry.bed && (
                      <Badge variant="outline">
                        📍 {entry.bed}
                      </Badge>
                    )}
                  </View>
                </CardContent>
              </Card>
            </View>
          );
        })}
      </View>
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
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    timeline: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 16,
    },
    timelineItem: {
        position: 'relative',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        aspectRatio: 16 / 10,
        borderRadius: 8,
        marginBottom: 12,
    }
});
