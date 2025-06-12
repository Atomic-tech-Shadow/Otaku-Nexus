import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { Anime, Quiz } from '../types';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [featuredQuiz, setFeaturedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [animesData, quizData] = await Promise.all([
        apiService.getTrendingAnimes(),
        apiService.getFeaturedQuiz(),
      ]);
      setAnimes(animesData.slice(0, 5));
      setFeaturedQuiz(quizData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Auth');
  };

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <TouchableOpacity
      style={styles.animeCard}
      onPress={() => navigation.navigate('Anime', { animeId: item.id })}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.animeImage} />
      )}
      <Text style={styles.animeTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.score && (
        <Text style={styles.animeScore}>★ {item.score}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>
              {user?.firstName || user?.email || 'Otaku'}
            </Text>
            <Text style={styles.userLevel}>
              Niveau {user?.level || 1} • {user?.xp || 0} XP
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Navigation Cards */}
        <View style={styles.navCards}>
          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: '#e74c3c' }]}
            onPress={() => navigation.navigate('Anime')}
          >
            <Text style={styles.navCardTitle}>Anime</Text>
            <Text style={styles.navCardSubtitle}>Découvrir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: '#3498db' }]}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Text style={styles.navCardTitle}>Quiz</Text>
            <Text style={styles.navCardSubtitle}>Tester vos connaissances</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: '#9b59b6' }]}
            onPress={() => navigation.navigate('Videos')}
          >
            <Text style={styles.navCardTitle}>Vidéos</Text>
            <Text style={styles.navCardSubtitle}>AMVs et openings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: '#2ecc71' }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.navCardTitle}>Chat</Text>
            <Text style={styles.navCardSubtitle}>Communauté</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Quiz */}
        {featuredQuiz && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiz du jour</Text>
            <TouchableOpacity
              style={styles.featuredQuiz}
              onPress={() => navigation.navigate('Quiz', { quizId: featuredQuiz.id })}
            >
              <LinearGradient
                colors={['#9b59b6', '#8e44ad']}
                style={styles.quizGradient}
              >
                <Text style={styles.quizTitle}>{featuredQuiz.title}</Text>
                <Text style={styles.quizDescription}>
                  {featuredQuiz.description}
                </Text>
                <Text style={styles.quizReward}>
                  +{featuredQuiz.xpReward} XP
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Trending Anime */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anime tendance</Text>
          <FlatList
            data={animes}
            renderItem={renderAnimeItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.animeList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.quickActionText}>Mon Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Anime')}
            >
              <Text style={styles.quickActionText}>Mes Favoris</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#ccc',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#3498db',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  navCards: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  navCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  navCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  navCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featuredQuiz: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quizGradient: {
    padding: 20,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  quizReward: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1c40f',
  },
  animeList: {
    paddingLeft: 4,
  },
  animeCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animeImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  animeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    padding: 8,
    paddingBottom: 4,
  },
  animeScore: {
    fontSize: 11,
    color: '#f39c12',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});