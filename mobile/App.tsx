import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import HomeScreen from './src/screens/HomeScreen';
import AnimeScreen from './src/screens/AnimeScreen';
import QuizScreen from './src/screens/QuizScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const authContextValue = useAuthProvider();
  const { isAuthenticated, isLoading } = authContextValue;

  if (isLoading) {
    return null; // You could add a loading screen here
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? "Home" : "Auth"}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{ title: 'Connexion', headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Otaku App' }}
              />
              <Stack.Screen 
                name="Anime" 
                component={AnimeScreen}
                options={{ title: 'Anime' }}
              />
              <Stack.Screen 
                name="Quiz" 
                component={QuizScreen}
                options={{ title: 'Quiz' }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ title: 'Profil' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}