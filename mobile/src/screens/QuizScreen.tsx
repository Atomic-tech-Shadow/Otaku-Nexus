import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: any[];
  xpReward: number;
  imageUrl?: string;
}

const ModernQuizScreen = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      // Simulated API call - replace with actual API
      const mockQuizzes: Quiz[] = [
        {
          id: 1,
          title: "🔥 Attack on Titan - Les Secrets",
          description: "Plongez dans l'univers complexe d'Attack on Titan et ses mystères",
          difficulty: "medium",
          xpReward: 35,
          questions: Array(5).fill({}),
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop"
        },
        {
          id: 2,
          title: "⚡ Demon Slayer - Techniques de Combat",
          description: "Maîtrisez-vous les techniques de respiration des chasseurs de démons ?",
          difficulty: "easy",
          xpReward: 25,
          questions: Array(4).fill({}),
          imageUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&h=250&fit=crop"
        },
        {
          id: 3,
          title: "🌟 Jujutsu Kaisen - Énergies Occultes",
          description: "Explorez le monde mystérieux des techniques d'exorcisme",
          difficulty: "hard",
          xpReward: 45,
          questions: Array(5).fill({}),
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop"
        }
      ];
      
      setQuizzes(mockQuizzes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return ['#4ade80', '#22c55e'];
      case 'medium':
        return ['#f59e0b', '#d97706'];
      case 'hard':
        return ['#ef4444', '#dc2626'];
      default:
        return ['#6366f1', '#4f46e5'];
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'leaf-outline';
      case 'medium':
        return 'flash-outline';
      case 'hard':
        return 'flame-outline';
      default:
        return 'help-outline';
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty
  );

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Chargement des quiz...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quiz Otaku</Text>
          <Text style={styles.headerSubtitle}>Testez vos connaissances anime</Text>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterButton,
                  selectedDifficulty === difficulty && styles.filterButtonActive
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={[
                  styles.filterText,
                  selectedDifficulty === difficulty && styles.filterTextActive
                ]}>
                  {difficulty === 'all' ? 'Tous' : 
                   difficulty === 'easy' ? 'Facile' :
                   difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quiz Cards */}
        <View style={styles.quizGrid}>
          {filteredQuizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={styles.quizCard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.cardGradient}
              >
                {/* Quiz Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: quiz.imageUrl }}
                    style={styles.quizImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageOverlay}
                  />
                </View>

                {/* Quiz Info */}
                <View style={styles.cardContent}>
                  <Text style={styles.quizTitle} numberOfLines={2}>
                    {quiz.title}
                  </Text>
                  <Text style={styles.quizDescription} numberOfLines={2}>
                    {quiz.description}
                  </Text>

                  {/* Stats Row */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="help-circle-outline" size={16} color="#64748b" />
                      <Text style={styles.statText}>{quiz.questions.length} questions</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="trophy-outline" size={16} color="#64748b" />
                      <Text style={styles.statText}>{quiz.xpReward} XP</Text>
                    </View>
                  </View>

                  {/* Difficulty Badge */}
                  <LinearGradient
                    colors={getDifficultyColor(quiz.difficulty)}
                    style={styles.difficultyBadge}
                  >
                    <Ionicons 
                      name={getDifficultyIcon(quiz.difficulty) as any} 
                      size={12} 
                      color="white" 
                    />
                    <Text style={styles.difficultyText}>
                      {quiz.difficulty === 'easy' ? 'Facile' :
                       quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                    </Text>
                  </LinearGradient>
                </View>

                {/* Play Button */}
                <TouchableOpacity style={styles.playButton}>
                  <LinearGradient
                    colors={['#00D4FF', '#7B68EE']}
                    style={styles.playGradient}
                  >
                    <Ionicons name="play" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  filterText: {
    color: '#64748b',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  quizGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quizCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  quizImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardContent: {
    padding: 16,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 4,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  playButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  playGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModernQuizScreen;