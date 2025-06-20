import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';

interface AppWrapperProps {
  children?: React.ReactNode;
}

// Mock user data for demonstration
const mockUser = {
  id: '1',
  firstName: 'Otaku',
  username: 'otaku_user',
  profileImageUrl: null,
  level: 5,
  xp: 1250,
  isAdmin: false,
};

const mockUserStats = {
  totalAnime: 42,
  totalQuizzes: 15,
  totalXP: 1250,
  rank: 8,
};

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  // Simple navigation mock
  const mockNavigation = {
    navigate: (screen: string) => {
      console.log(`Navigate to: ${screen}`);
    },
  };

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        <HomeScreen 
          navigation={mockNavigation}
          user={mockUser}
          userStats={mockUserStats}
        />
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppWrapper;