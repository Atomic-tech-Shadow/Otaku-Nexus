import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { Quiz, QuizQuestion } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function QuizScreen({ navigation, route }: any) {
  const { user, updateUser } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quizInProgress, setQuizInProgress] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (quizInProgress && quizStartTime > 0) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - quizStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizInProgress, quizStartTime]);

  const loadQuizzes = async () => {
    try {
      const quizzesData = await apiService.getQuizzes();
      setQuizzes(quizzesData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les quiz');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadQuizzes();
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeSpent(0);
    setQuizStartTime(Date.now());
    setShowResult(false);
    setQuizInProgress(true);
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('Attention', 'Veuillez sélectionner une réponse');
      return;
    }

    const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
    if (currentQuestion && selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!currentQuiz) return;

    const finalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
    const finalScore = selectedAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer 
      ? score + 1 
      : score;
    
    try {
      await apiService.submitQuizResult({
        quizId: currentQuiz.id,
        score: finalScore,
        timeSpent: finalTimeSpent,
      });

      // Mise à jour de l'XP utilisateur
      if (user) {
        const xpEarned = Math.floor((finalScore / currentQuiz.questions.length) * currentQuiz.xpReward);
        updateUser({
          ...user,
          xp: user.xp + xpEarned,
        });
      }

      setScore(finalScore);
      setTimeSpent(finalTimeSpent);
      setShowResult(true);
      setQuizInProgress(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le résultat');
    }
  };

  const closeQuiz = () => {
    setCurrentQuiz(null);
    setShowResult(false);
    setQuizInProgress(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#2ecc71';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#95a5a6';
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuizItem = ({ item }: { item: Quiz }) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() => startQuiz(item)}
    >
      <LinearGradient
        colors={item.isFeatured ? ['#9b59b6', '#8e44ad'] : ['#3498db', '#2980b9']}
        style={styles.quizGradient}
      >
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}
        <Text style={styles.quizTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.quizDescription}>{item.description}</Text>
        )}
        <View style={styles.quizMeta}>
          <View style={styles.difficultyBadge}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
              {getDifficultyText(item.difficulty)}
            </Text>
          </View>
          <Text style={styles.quizReward}>+{item.xpReward} XP</Text>
        </View>
        <Text style={styles.questionCount}>
          {item.questions.length} questions
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (currentQuiz && !showResult) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#3498db', '#2980b9']}
          style={styles.quizHeader}
        >
          <View style={styles.quizProgress}>
            <Text style={styles.quizProgressText}>
              Question {currentQuestionIndex + 1} sur {currentQuiz.questions.length}
            </Text>
            <Text style={styles.quizTime}>⏱️ {formatTime(timeSpent)}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionButtonSelected
                ]}
                onPress={() => selectAnswer(index)}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswer === index && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.quizActions}>
          <TouchableOpacity
            style={styles.quitButton}
            onPress={() => {
              Alert.alert(
                'Quitter le quiz',
                'Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Quitter', style: 'destructive', onPress: closeQuiz }
                ]
              );
            }}
          >
            <Text style={styles.quitButtonText}>Quitter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.nextButton, selectedAnswer === null && styles.nextButtonDisabled]}
            onPress={nextQuestion}
            disabled={selectedAnswer === null}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3498db', '#2980b9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Quiz</Text>
        <Text style={styles.headerSubtitle}>Testez vos connaissances</Text>
      </LinearGradient>

      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.quizList}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={closeQuiz}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <LinearGradient
              colors={['#2ecc71', '#27ae60']}
              style={styles.resultHeader}
            >
              <Text style={styles.resultTitle}>Quiz terminé!</Text>
            </LinearGradient>
            
            <View style={styles.resultContent}>
              <Text style={styles.resultScore}>
                Score: {score}/{currentQuiz?.questions.length}
              </Text>
              <Text style={styles.resultPercentage}>
                {Math.round((score / (currentQuiz?.questions.length || 1)) * 100)}%
              </Text>
              <Text style={styles.resultTime}>
                Temps: {formatTime(timeSpent)}
              </Text>
              <Text style={styles.resultXP}>
                +{Math.floor((score / (currentQuiz?.questions.length || 1)) * (currentQuiz?.xpReward || 0))} XP
              </Text>
            </View>

            <TouchableOpacity
              style={styles.resultButton}
              onPress={closeQuiz}
            >
              <Text style={styles.resultButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quizList: {
    padding: 16,
    paddingBottom: 32,
  },
  quizCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizGradient: {
    padding: 20,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
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
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1c40f',
  },
  questionCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quizHeader: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  quizProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  quizTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#3498db',
    fontWeight: '600',
  },
  quizActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  quitButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  resultHeader: {
    padding: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultContent: {
    padding: 24,
    alignItems: 'center',
  },
  resultScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 16,
  },
  resultTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  resultXP: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  resultButton: {
    backgroundColor: '#3498db',
    padding: 16,
    alignItems: 'center',
    margin: 20,
    borderRadius: 12,
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});