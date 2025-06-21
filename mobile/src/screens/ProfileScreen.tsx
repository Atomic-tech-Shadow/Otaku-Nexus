import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const { data: userStats = { totalQuizzes: 0, totalAnime: 0, totalXP: 0, rank: 0 } } = useQuery<{
    totalQuizzes: number;
    totalAnime: number;
    totalXP: number;
    rank: number;
  }>({
    queryKey: ["/api/user/stats"],
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Mock user data - in real app, this would come from auth context
  const user = {
    firstName: 'Otaku',
    lastName: 'User',
    email: 'user@otaku.com',
    profileImageUrl: null,
    isAdmin: false,
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.navigate('Auth');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
            }
          },
        },
      ]
    );
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return { icon: 'trophy', color: '#FFD700', text: 'Légende' };
    if (rank <= 10) return { icon: 'medal', color: '#C0C0C0', text: 'Expert' };
    if (rank <= 50) return { icon: 'ribbon', color: '#CD7F32', text: 'Avancé' };
    return { icon: 'star', color: '#00D4FF', text: 'Novice' };
  };

  const rankBadge = getRankBadge(userStats.rank);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create" size={20} color="#00D4FF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user.profileImageUrl ? (
                <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </Text>
                </View>
              )}
              <View style={[styles.rankBadgeContainer, { backgroundColor: rankBadge.color }]}>
                <Ionicons name={rankBadge.icon as any} size={16} color="white" />
              </View>
            </View>
            
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{rankBadge.text}</Text>
              <Text style={styles.rankNumber}>Rang #{userStats.rank}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.statGradient}
                >
                  <Ionicons name="trophy" size={32} color="white" />
                  <Text style={styles.statNumber}>{userStats.totalXP}</Text>
                  <Text style={styles.statLabel}>XP Total</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.statGradient}
                >
                  <Ionicons name="brain" size={32} color="white" />
                  <Text style={styles.statNumber}>{userStats.totalQuizzes}</Text>
                  <Text style={styles.statLabel}>Quiz Réussis</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.statGradient}
                >
                  <Ionicons name="play" size={32} color="white" />
                  <Text style={styles.statNumber}>{userStats.totalAnime}</Text>
                  <Text style={styles.statLabel}>Animes Vus</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#a8edea', '#fed6e3']}
                  style={styles.statGradient}
                >
                  <Ionicons name="heart" size={32} color="white" />
                  <Text style={styles.statNumber}>{favorites.length}</Text>
                  <Text style={styles.statLabel}>Favoris</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="person" size={20} color="#00D4FF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Modifier le profil</Text>
                <Text style={styles.actionSubtitle}>Changer votre photo et vos informations</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Quiz')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="brain" size={20} color="#00D4FF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Mes quiz</Text>
                <Text style={styles.actionSubtitle}>Voir l'historique de vos quiz</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('AnimeSama')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="play" size={20} color="#00D4FF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Mes animes</Text>
                <Text style={styles.actionSubtitle}>Gérer votre liste d'animes</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Paramètres', 'Fonctionnalité à venir')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="settings" size={20} color="#00D4FF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Paramètres</Text>
                <Text style={styles.actionSubtitle}>Notifications, confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="#FF6B6B" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  rankBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  rankContainer: {
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  rankNumber: {
    fontSize: 14,
    color: '#888',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginLeft: 10,
  },
});