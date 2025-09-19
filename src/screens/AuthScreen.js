// =================================================================================
// TODO: LEGACY CODE - REVIEW FOR REMOVAL
// This file was identified as potentially unreferenced during an automated code audit.
// It may be legacy code that is no longer in use.
// Please review its purpose and dependencies before deleting.
// =================================================================================
// File: mobile/src/screens/AuthScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSignIn = async () => {
    const { error } = await signIn({ email, password });
    if (error) Alert.alert('Sign In Error', error.message);
  };

  const handleSignUp = async () => {
    const { error } = await signUp({ email, password });
    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Success', 'Please check your email for a confirmation link!');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <View style={styles.spacer} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 5 },
  spacer: { height: 10 }
});