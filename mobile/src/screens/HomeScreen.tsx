import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface UserStats {
  totalAnime: number;
  totalQuizzes: number;
  totalXP: number;
  rank: number;
}

interface HomeScreenProps {
  navigation: any;
  user: any;
  userStats: UserStats;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user, userStats }) => {
  const handleNavigateToChat = () => {
    navigation.navigate('Chat');
  };

  const handleNavigateToQuiz = () => {
    navigation.navigate('Quiz');
  };

  const handleNavigateToAnimeSama = () => {
    navigation.navigate('AnimeSama');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>Otaku Nexus</Text>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                {user?.profileImageUrl ? (
                  <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {user?.firstName || user?.username || 'Anonymous Otaku'}
                </Text>
                <View style={styles.levelContainer}>
                  <Text style={styles.level}>Niv {user?.level || 1}</Text>
                  <View style={styles.xpBar}>
                    <View style={[styles.xpProgress, { width: '65%' }]} />
                  </View>
                  <Text style={styles.xp}>{user?.xp || 0}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.1)', 'rgba(255, 0, 255, 0.1)']}
              style={styles.welcomeCard}
            >
              <Text style={styles.welcomeTitle}>
                Welcome back, {user?.firstName || user?.username || 'Otaku'}!
              </Text>
              <Text style={styles.welcomeSubtitle}>Ready to explore the anime universe?</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats?.totalAnime || 0}</Text>
                  <Text style={styles.statLabel}>Anime</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats?.totalQuizzes || 0}</Text>
                  <Text style={styles.statLabel}>Quizzes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats?.totalXP || 0}</Text>
                  <Text style={styles.statLabel}>XP</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity onPress={handleNavigateToChat} style={styles.actionButton}>
              <LinearGradient
                colors={['#00c3ff', '#ff00ff']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="chatbubbles" size={24} color="white" />
                <Text style={styles.actionButtonText}>Chat</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNavigateToQuiz} style={styles.actionButton}>
              <LinearGradient
                colors={['#c44fff', '#ff7b00']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="brain" size={24} color="white" />
                <Text style={styles.actionButtonText}>Quiz</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Anime Sama Button */}
          <TouchableOpacity onPress={handleNavigateToAnimeSama} style={styles.fullWidthButton}>
            <LinearGradient
              colors={['#2563eb', '#0891b2']}
              style={styles.fullWidthButtonGradient}
            >
              <Ionicons name="play-circle" size={24} color="white" />
              <Text style={styles.fullWidthButtonText}>Anime-Sama Streaming</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              style={styles.progressCard}
            >
              <Text style={styles.progressTitle}>Your Progress</Text>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Quizzes Completed</Text>
                  <Text style={styles.progressValue}>{userStats?.totalQuizzes || 0}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '65%' }]} />
                </View>
              </View>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Rank</Text>
                  <Text style={styles.progressValue}>#{userStats?.rank || 'Unranked'}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '45%' }]} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00c3ff',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00c3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  level: {
    color: '#00c3ff',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  xpBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginRight: 8,
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#00c3ff',
    borderRadius: 3,
  },
  xp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ff00ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidthButton: {
    marginBottom: 24,
  },
  fullWidthButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  fullWidthButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  progressValue: {
    color: '#00c3ff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00c3ff',
    borderRadius: 4,
  },
});

export default HomeScreen;