import { View, Text, Button, TextInput, Alert, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../../src/services/supabase';
import { useAuth } from '../../../src/context/AuthContext';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch the current username from the profiles table
      const fetchUsername = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (data) {
          setUsername(data.username);
        } else if (error) {
          Alert.alert('Error', error.message);
        }
      };
      fetchUsername();
    }
  }, [user]);

  const handleUpdateUsername = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Username updated successfully!');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 20, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Settings</Text>
      <View style={{ width: '80%', alignSelf: 'center' }}>
        <TextInput
          style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10, borderRadius: 5 }}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Button title={loading ? 'Updating...' : 'Update Username'} onPress={handleUpdateUsername} disabled={loading} />
      </View>
      <View style={{ marginTop: 40, width: '80%', alignSelf: 'center' }}>
        <Button title="Sign Out" onPress={signOut} color="red" />
      </View>
    </SafeAreaView>
  );
}
