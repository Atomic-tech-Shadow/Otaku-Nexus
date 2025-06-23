import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api';

const AppHeader = () => {
  const navigation = useNavigation();

  const { data: userStats = {} } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => apiService.getUserStats(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 1000) + 1;
  };

  const calculateXPProgress = (xp: number) => {
    const currentLevelXP = xp % 1000;
    return (currentLevelXP / 1000) * 100;
  };

  const totalXP = userStats.data?.totalXP || 0;
  const level = calculateLevel(totalXP);
  const xpProgress = calculateXPProgress(totalXP);

  return (
    <LinearGradient
      colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 64, 175, 0.95)']}
      style={styles.header}
    >
      <View style={styles.leftSection}>
        <Text style={styles.appTitle}>Otaku Nexus</Text>
      </View>

      <View style={styles.centerSection}>
        <View style={styles.xpContainer}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Niv {level}</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpProgress, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpText}>{totalXP.toLocaleString()} XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={32} color="#00D4FF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  leftSection: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  xpBarContainer: {
    alignItems: 'center',
    gap: 2,
  },
  xpBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  xpText: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: '600',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileButton: {
    padding: 5,
  },
});

export default AppHeader;