import React from 'react';
import { FlatList, Text, StyleSheet, Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { Card } from './ui/Card';

const PlantList = ({ plants }) => {
  const renderItem = ({ item }) => (
    <Link href={{ pathname: '/(tabs)/plants/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <Card style={styles.plantItem}>
          <View>
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.plantVariety}>{item.variety?.common_name || 'Unknown Variety'}</Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );

  return (
    <FlatList
      data={plants}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>No plants yet. Add one!</Text>}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
};

const styles = StyleSheet.create({
  plantItem: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '500',
  },
  plantVariety: {
    fontSize: 14,
    color: 'gray',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
});

export default PlantList;
