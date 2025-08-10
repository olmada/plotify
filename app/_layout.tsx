// File: mobile/app/_layout.js
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { SplashScreen } from 'expo-router';
import AuthAndNavigation from './AuthAndNavigation'; // We will create this next

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded or an error occurred
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Render nothing until the fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Render the main app layout
  return <AuthAndNavigation />;
}