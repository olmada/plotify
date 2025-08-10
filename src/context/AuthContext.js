// File: mobile/src/context/AuthContext.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native'; // Import new components
import { supabase } from '../services/supabase';

// Create the authentication context
const AuthContext = createContext({});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// The AuthProvider component that will wrap our app
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper function to get the initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        // This will alert you if the session fetch fails
        Alert.alert("Error", "Could not fetch user session. Check your Supabase credentials.");
        console.error(error);
      } finally {
        // This ensures loading is always set to false, even if there's an error
        setLoading(false);
      }
    };
    
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Also ensure loading is false when the auth state changes
      setLoading(false); 
    });

    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  // Display a loading indicator while the session is being fetched
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};