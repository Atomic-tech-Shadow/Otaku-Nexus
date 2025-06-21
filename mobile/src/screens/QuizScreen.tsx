import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  questions: any[];
  xpReward: number;
}

export default function QuizScreen({ navigation }: any) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: quizzes = [], isLoading, error } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
    retry: false,
  });

  const filteredQuizzes = Array.isArray(quizzes) ? quizzes.filter(quiz => {
    const difficultyMatch = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    const categoryMatch = selectedCategory === "all";
    return difficultyMatch && categoryMatch;
  }) : [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4ECDC4';
      case 'medium': return '#FFD700';
      case 'hard': return '#FF6B6B';
      default: return '#888';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return difficulty;
    }
  };

  const handleQuizPress = (quizId: number) => {
    navigation.navigate('QuizDetail', { quizId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4FF" />
            <Text style={styles.loadingText}>Chargement des quiz...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Quiz Otaku</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Difficulté</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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
                  styles.filterButtonText,
                  selectedDifficulty === difficulty && styles.filterButtonTextActive
                ]}>
                  {difficulty === 'all' ? 'Tous' : getDifficultyText(difficulty)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quiz List */}
        <ScrollView 
          style={styles.quizContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.quizContent}
        >
          {filteredQuizzes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="brain" size={64} color="#333" />
              <Text style={styles.emptyTitle}>Aucun quiz disponible</Text>
              <Text style={styles.emptyText}>
                Revenez plus tard pour de nouveaux défis !
              </Text>
            </View>
          ) : (
            filteredQuizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={styles.quizCard}
                onPress={() => handleQuizPress(quiz.id)}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.quizGradient}
                >
                  <View style={styles.quizHeader}>
                    <View style={styles.quizInfo}>
                      <Text style={styles.quizTitle}>{quiz.title}</Text>
                      <Text style={styles.quizDescription} numberOfLines={2}>
                        {quiz.description}
                      </Text>
                    </View>
                    <View style={styles.quizMeta}>
                      <View style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(quiz.difficulty) }
                      ]}>
                        <Text style={styles.difficultyText}>
                          {getDifficultyText(quiz.difficulty)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.quizFooter}>
                    <View style={styles.quizStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="help-circle" size={16} color="#888" />
                        <Text style={styles.statText}>
                          {quiz.questions?.length || 0} questions
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="trophy" size={16} color="#FFD700" />
                        <Text style={styles.statText}>+{quiz.xpReward} XP</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#00D4FF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
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
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#00D4FF',
  },
  filterButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  quizContainer: {
    flex: 1,
  },
  quizContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  quizCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  quizGradient: {
    padding: 20,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  quizInfo: {
    flex: 1,
    marginRight: 15,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  quizDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  quizMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    color: '#888',
    fontSize: 12,
  },
});