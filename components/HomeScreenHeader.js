import React from 'react';
import { ThemedText } from './ThemedText'; // Import ThemedText
import { Colors } from '../constants/Colors'; // Import Colors
import { useColorScheme } from '../hooks/useColorScheme'; // Import useColorScheme

const HomeScreenHeader = ({ userName, plantsCount, tasksCount }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.headerTop}>
        <ThemedText type="title">Hello, {userName}!</ThemedText>
      </View>
      <View style={styles.summaryContainer}>
        <ThemedText type="default" style={{ color: colors.mutedForeground }}>You have {plantsCount} active plants.</ThemedText>
        <ThemedText type="default" style={{ color: colors.mutedForeground }}>Upcoming Tasks: {tasksCount}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  // welcomeMessage and summaryText styles are now handled by ThemedText
  signOutText: {
    color: '#007AFF', // Keep existing, not part of current task
    fontSize: 16, // Keep existing
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default HomeScreenHeader;
