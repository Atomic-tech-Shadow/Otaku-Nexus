import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import AppWrapper from './src/components/AppWrapper';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import AnimeSamaScreen from './src/screens/AnimeSamaScreen';
import AnimeDetailScreen from './src/screens/AnimeDetailScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import QuizScreen from './src/screens/QuizScreen';
import QuizDetailScreen from './src/screens/QuizDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AdminScreen from './src/screens/AdminScreen';
import LandingScreen from './src/screens/LandingScreen';

const Stack = createStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#000000" />
            <Stack.Navigator
              initialRouteName="Landing"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#000000' },
                animationEnabled: true,
                gestureEnabled: true,
              }}
            >
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="Main" component={AppWrapper} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="AnimeSama" component={AnimeSamaScreen} />
              <Stack.Screen 
                name="AnimeDetail" 
                component={AnimeDetailScreen}
                options={{
                  animationEnabled: true,
                  gestureEnabled: true,
                }}
              />
              <Stack.Screen 
                name="VideoPlayer" 
                component={VideoPlayerScreen}
                options={{
                  presentation: 'modal',
                  animationEnabled: true,
                }}
              />
              <Stack.Screen name="Quiz" component={QuizScreen} />
              <Stack.Screen 
                name="QuizDetail" 
                component={QuizDetailScreen}
                options={{
                  animationEnabled: true,
                  gestureEnabled: true,
                }}
              />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen 
                name="Admin" 
                component={AdminScreen}
                options={{
                  animationEnabled: true,
                  gestureEnabled: true,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}