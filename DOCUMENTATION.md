# Project Documentation

This document provides a high-level overview of the essential files in this project. It was automatically generated to improve clarity and maintainability. Files that are potentially legacy or unreferenced have been tagged with a `TODO: LEGACY CODE` comment for future review.

## Essential Files

**- `app/_layout.js`**: This file serves as the root layout for the entire application. It wraps the app in an `AuthProvider` and manages the initial routing logic, directing users to the authentication or main app screens based on their login status.

**- `src/context/AuthContext.js`**: This file provides authentication context to the application using React's Context API. It manages the user's session state, handles sign-in and sign-out logic by interacting with Supabase, and makes the authentication status available to all components.

**- `src/services/supabase.js`**: This file initializes and configures the Supabase client for the application. It retrieves the Supabase URL and anonymous key from environment variables and sets up the client with React Native's AsyncStorage for session persistence.

**- `app/(auth)/index.js`**: Defines the authentication screen where users can sign in or sign up. It uses custom UI components for a consistent look and feel.

**- `app/(tabs)/_layout.js`**: Sets up the main tab navigation for the application after a user is logged in. It defines the different tabs available, such as Beds, Plants, Tasks, and Journal.

**- `app/(tabs)/index.js`**: This is the default screen shown after login, likely a dashboard or home screen.

**- `components/ui/Button.tsx`**: A reusable button component with consistent styling, used throughout the application.

**- `components/ui/Input.tsx`**: A reusable input field component, ensuring a uniform appearance for all text inputs.

**- `constants/Colors.ts`**: Defines the color palette for the application, with support for both light and dark themes.

**- `types/plant.ts`**: Provides TypeScript type definitions for the Plant data structure, ensuring type safety when handling plant-related data.

**- `app.json`**: The main configuration file for the Expo app, defining metadata such as the app's name, version, and icon.

**- `package.json`**: The project's manifest file, listing all dependencies, dev dependencies, and scripts required to run and develop the application.
