// File: mobile/src/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { signOut, session } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Plotify!</Text>
      <Text style={styles.email}>{session?.user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 8 },
  email: { marginBottom: 20, color: 'gray' }
});