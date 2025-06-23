import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/QuizScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnimeSamaScreen from '../screens/AnimeSamaScreen';
import AnimeDetailScreen from '../screens/AnimeDetailScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size, focused }) => {
  return (
    <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
      {focused && (
        <LinearGradient
          colors={['rgba(0, 195, 255, 0.2)', 'rgba(255, 0, 255, 0.2)']}
          style={styles.iconBackground}
        />
      )}
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <LinearGradient
      colors={['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.95)']}
      style={styles.tabBar}
    >
      <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
            switch (routeName) {
              case 'Home': return 'home';
              case 'Quiz': return 'bulb';
              case 'Chat': return 'chatbubbles';
              case 'AnimeSama': return 'play-circle';
              case 'Profile': return 'person';
              default: return 'home';
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <TabBarIcon
                name={getIconName(route.name)}
                color={isFocused ? '#00c3ff' : 'rgba(255, 255, 255, 0.6)'}
                size={24}
                focused={isFocused}
              />
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? '#00c3ff' : 'rgba(255, 255, 255, 0.6)' }
              ]}>
                {label}
              </Text>
              {isFocused && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
};

// Stack Navigator pour Anime-Sama avec navigation vers détail et lecteur
function AnimeSamaStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="AnimeSamaMain" component={AnimeSamaScreen} />
      <Stack.Screen name="AnimeDetail" component={AnimeDetailScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen 
        name="Quiz" 
        component={QuizScreen}
        options={{
          tabBarLabel: 'Quiz',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen 
        name="AnimeSama" 
        component={AnimeSamaStack}
        options={{
          tabBarLabel: 'Streaming',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 195, 255, 0.2)',
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 4,
  },
  focusedIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  iconBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 3,
    backgroundColor: '#00c3ff',
    borderRadius: 2,
  },
});