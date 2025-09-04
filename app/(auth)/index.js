import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../src/services/supabase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Sign In Error', error.message);
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Success', 'Please check your email for a confirmation link!');
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View style={styles.spacer} />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.spacer} />
      <Button onPress={handleSignIn}>Sign In</Button>
      <View style={styles.spacer} />
      <Button variant="secondary" onPress={handleSignUp}>Sign Up</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  spacer: { height: 12 }
});