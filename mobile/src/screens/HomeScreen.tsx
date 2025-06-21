import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { data: userStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { data: featuredQuiz, isLoading: quizLoading } = useQuery({
    queryKey: ["/api/quizzes/featured"],
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  const { data: topUsers = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/users/leaderboard"],
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchInterval: 60 * 1000, // Actualise toutes les minutes
  });

  const handleAnimePress = () => {
    navigation.navigate('AnimeSama');
  };

  const handleQuizPress = () => {
    navigation.navigate('Quiz');
  };

  const handleChatPress = () => {
    navigation.navigate('Chat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f0f', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Bienvenue sur</Text>
              <Text style={styles.titleText}>Otaku Nexus</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle" size={40} color="#00D4FF" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statsNumber}>{userStats.totalXP || 0}</Text>
              <Text style={styles.statsLabel}>XP Total</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="brain" size={24} color="#FF6B6B" />
              <Text style={styles.statsNumber}>{userStats.totalQuizzes || 0}</Text>
              <Text style={styles.statsLabel}>Quiz Complétés</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="play" size={24} color="#4ECDC4" />
              <Text style={styles.statsNumber}>{userStats.totalAnime || 0}</Text>
              <Text style={styles.statsLabel}>Animes Vus</Text>
            </View>
          </View>

          {/* Main Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionCard} onPress={handleAnimePress}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionGradient}
              >
                <Ionicons name="play-circle" size={48} color="white" />
                <Text style={styles.actionTitle}>Anime-Sama</Text>
                <Text style={styles.actionSubtitle}>Regarder des animes en streaming</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleQuizPress}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.actionGradient}
              >
                <Ionicons name="brain" size={48} color="white" />
                <Text style={styles.actionTitle}>Quiz Otaku</Text>
                <Text style={styles.actionSubtitle}>Testez vos connaissances</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleChatPress}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.actionGradient}
              >
                <Ionicons name="chatbubbles" size={48} color="white" />
                <Text style={styles.actionTitle}>Chat Communauté</Text>
                <Text style={styles.actionSubtitle}>Discutez avec d'autres otakus</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Featured Quiz */}
          {featuredQuiz && (
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>Quiz du jour</Text>
              <TouchableOpacity style={styles.featuredCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredContent}>
                    <Ionicons name="star" size={24} color="#FFD700" />
                    <View style={styles.featuredText}>
                      <Text style={styles.featuredTitle}>{featuredQuiz.title}</Text>
                      <Text style={styles.featuredDescription}>{featuredQuiz.description}</Text>
                      <Text style={styles.featuredXP}>+{featuredQuiz.xpReward} XP</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Leaderboard */}
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>Top Otakus</Text>
            {topUsers.slice(0, 3).map((user: any, index: number) => (
              <View key={user.id} style={styles.leaderboardItem}>
                <View style={styles.leaderboardRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.leaderboardUser}>
                  <Text style={styles.leaderboardName}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={styles.leaderboardXP}>{user.totalXP} XP</Text>
                </View>
                {index === 0 && <Ionicons name="trophy" size={20} color="#FFD700" />}
              </View>
            ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#888',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  statsLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  featuredCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  featuredGradient: {
    padding: 15,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    flex: 1,
    marginLeft: 15,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  featuredXP: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 5,
    fontWeight: 'bold',
  },
  leaderboardSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  leaderboardRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  leaderboardUser: {
    flex: 1,
  },
  leaderboardName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardXP: {
    color: '#888',
    fontSize: 14,
  },
});