import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

const HomeScreenHeader = ({ userName, plantsCount, tasksCount, onSignOut }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.welcomeMessage}>Hello, {userName}!</Text>
        <Pressable onPress={onSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>You have {plantsCount} active plants.</Text>
        <Text style={styles.summaryText}>Upcoming Tasks: {tasksCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  signOutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default HomeScreenHeader;
