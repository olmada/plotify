/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryGreenLight = '#1A4314'; // Dark green for light theme
const accentGreenLight = '#4CAF50'; // Lighter green for light theme
const primaryGreenDark = '#4CAF50'; // Lighter green for dark theme (as primary)
const accentGreenDark = '#8BC34A'; // Even lighter green for dark theme (as accent)

const lightGray = '#F5F5F5';
const mediumGray = '#CCCCCC';
const darkGray = '#666666';

export const Colors = {
  light: {
    text: '#11181C', // Keep dark text for light background
    background: '#FFFFFF', // Pure white background
    tint: primaryGreenLight, // Use primary green as tint
    icon: darkGray, // Darker icon for light theme
    tabIconDefault: darkGray,
    tabIconSelected: primaryGreenLight,
    primaryGreen: primaryGreenLight,
    accentGreen: accentGreenLight,
    lightGray: lightGray,
    mediumGray: mediumGray,
    darkGray: darkGray,
    cardBackground: '#FFFFFF', // White cards on light background
    cardBorder: '#E0E0E0', // Light border for cards
    shadowColor: '#000000', // Black shadow for light theme
  },
  dark: {
    text: '#ECEDEE', // Keep light text for dark background
    background: '#1A1A1A', // Darker background
    tint: primaryGreenDark, // Use primary green as tint
    icon: mediumGray, // Lighter icon for dark theme
    tabIconDefault: mediumGray,
    tabIconSelected: primaryGreenDark,
    primaryGreen: primaryGreenDark,
    accentGreen: accentGreenDark,
    lightGray: '#333333', // Darker light gray for dark theme
    mediumGray: '#555555', // Darker medium gray for dark theme
    darkGray: '#AAAAAA', // Lighter dark gray for dark theme
    cardBackground: '#2A2A2A', // Slightly lighter cards on dark background
    cardBorder: '#3A3A3A', // Darker border for cards
    shadowColor: '#FFFFFF', // White shadow for dark theme
  },
};
