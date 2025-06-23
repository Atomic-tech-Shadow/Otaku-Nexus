import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  level: number;
  xp: number;
  avatar?: string;
}

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
}

export default function AppHeader({ 
  title = "Otaku Nexus", 
  showBack = false, 
  showProfile = true 
}: AppHeaderProps) {
  const navigation = useNavigation();
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  // Données utilisateur
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculs XP et niveau
  const currentLevel = user?.level ?? 1;
  const currentXP = user?.xp ?? 0;
  const xpToNextLevel = currentLevel * 200;
  const xpProgress = Math.min(((currentXP % xpToNextLevel) / xpToNextLevel) * 100, 100);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleProfile = () => {
    (navigation as any).navigate('Profile');
  };

  const handleNotifications = () => {
    setHasNewNotifications(false);
    Alert.alert("Notifications", "Aucune nouvelle notification pour le moment.");
  };

  const handleSettings = () => {
    Alert.alert("Paramètres", "Fonctionnalité bientôt disponible.");
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: () => {
            // Logique de déconnexion
            (navigation as any).navigate('Auth');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['rgba(0,0,0,0.95)', 'rgba(30,64,175,0.95)']}
        style={styles.container}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingTitle} />
          <View style={styles.loadingProfile} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.95)', 'rgba(30,64,175,0.95)']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Section gauche */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#00D4FF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>Votre plateforme otaku</Text>
            </View>
          )}
        </View>

        {/* Section droite */}
        {showProfile && user && (
          <View style={styles.rightSection}>
            {/* Notifications */}
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={handleNotifications}
            >
              <Ionicons name="notifications" size={20} color="#fff" />
              {hasNewNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>

            {/* Admin badge */}
            {user.isAdmin && (
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => (navigation as any).navigate('Admin')}
              >
                <Ionicons name="shield-checkmark" size={20} color="#ec4899" />
              </TouchableOpacity>
            )}

            {/* Profil */}
            <TouchableOpacity style={styles.profileContainer} onPress={handleProfile}>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.userLevel}>Niveau {currentLevel}</Text>
              </View>
              
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#00D4FF', '#a855f7']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </Text>
                </LinearGradient>
                
                {/* Indicateur niveau */}
                <View style={styles.levelIndicator}>
                  <Text style={styles.levelText}>{currentLevel}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Menu actions */}
            <TouchableOpacity style={styles.menuButton} onPress={handleSettings}>
              <Ionicons name="settings" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Barre de progression XP */}
      {showProfile && user && (
        <View style={styles.xpContainer}>
          <View style={styles.xpInfo}>
            <Text style={styles.xpText}>{currentXP.toLocaleString()} XP</Text>
            <Text style={styles.xpNext}>
              {(xpToNextLevel - (currentXP % xpToNextLevel)).toLocaleString()} XP au niveau {currentLevel + 1}
            </Text>
          </View>
          <View style={styles.xpBar}>
            <View style={[styles.xpProgress, { width: `${xpProgress}%` }]} />
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  leftSection: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ec4899',
  },
  adminButton: {
    padding: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userLevel: {
    fontSize: 11,
    color: '#00D4FF',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  levelIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  levelText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  xpContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D4FF',
  },
  xpNext: {
    fontSize: 11,
    color: '#666',
  },
  xpBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingTitle: {
    width: 120,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  loadingProfile: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
  },
});