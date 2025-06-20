import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Quiz {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  category: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizScreenProps {
  navigation: any;
  user: any;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, user }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'quiz' | 'results'>('list');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Simulation de données pour le moment
      const mockQuizzes: Quiz[] = [
        {
          id: 1,
          title: 'Anime Classics',
          description: 'Test your knowledge of classic anime series',
          difficulty: 'medium',
          category: 'Classic',
          questions: [
            {
              id: 1,
              question: 'Which anime features a character named Spike Spiegel?',
              options: ['Cowboy Bebop', 'Trigun', 'Outlaw Star', 'Space Dandy'],
              correctAnswer: 0,
              explanation: 'Spike Spiegel is the main character of Cowboy Bebop.'
            },
            {
              id: 2,
              question: 'What is the name of the main character in Dragon Ball?',
              options: ['Vegeta', 'Piccolo', 'Goku', 'Gohan'],
              correctAnswer: 2,
              explanation: 'Goku is the main protagonist of the Dragon Ball series.'
            }
          ]
        },
        {
          id: 2,
          title: 'Modern Anime',
          description: 'Challenge yourself with recent anime series',
          difficulty: 'hard',
          category: 'Modern',
          questions: [
            {
              id: 1,
              question: 'Which anime features the character Tanjiro Kamado?',
              options: ['Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen', 'My Hero Academia'],
              correctAnswer: 1,
              explanation: 'Tanjiro Kamado is the main character of Demon Slayer.'
            }
          ]
        }
      ];
      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
    setViewMode('quiz');
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!selectedQuiz) return;

    let correctAnswers = 0;
    selectedQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    setScore(correctAnswers);
    setViewMode('results');
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
    setViewMode('list');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderQuizList = () => (
    <View style={styles.quizList}>
      <Text style={styles.sectionTitle}>Available Quizzes</Text>
      {quizzes.map((quiz) => (
        <TouchableOpacity
          key={quiz.id}
          style={styles.quizCard}
          onPress={() => startQuiz(quiz)}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.quizCardGradient}
          >
            <View style={styles.quizHeader}>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) }]}>
                <Text style={styles.difficultyText}>{quiz.difficulty.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.quizDescription}>{quiz.description}</Text>
            <View style={styles.quizFooter}>
              <Text style={styles.quizCategory}>{quiz.category}</Text>
              <Text style={styles.questionCount}>{quiz.questions.length} questions</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuiz = () => {
    if (!selectedQuiz) return null;

    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const isAnswerSelected = selectedAnswers[currentQuestionIndex] !== undefined;

    return (
      <View style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={resetQuiz} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.quizTitle}>{selectedQuiz.title}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
                ]}
                onPress={() => selectAnswer(index)}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.nextButton, !isAnswerSelected && styles.disabledButton]}
            onPress={nextQuestion}
            disabled={!isAnswerSelected}
          >
            <LinearGradient
              colors={isAnswerSelected ? ['#00c3ff', '#ff00ff'] : ['#666', '#666']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex === selectedQuiz.questions.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResults = () => {
    if (!selectedQuiz) return null;

    const percentage = (score / selectedQuiz.questions.length) * 100;

    return (
      <View style={styles.resultsContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.resultsCard}
        >
          <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          <Text style={styles.scoreText}>
            {score} / {selectedQuiz.questions.length}
          </Text>
          <Text style={styles.percentageText}>
            {percentage.toFixed(0)}%
          </Text>
          
          <View style={styles.scoreBreakdown}>
            <Text style={styles.breakdownTitle}>Review:</Text>
            {selectedQuiz.questions.map((question, index) => (
              <View key={index} style={styles.questionReview}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewQuestionText}>Q{index + 1}</Text>
                  <Ionicons 
                    name={selectedAnswers[index] === question.correctAnswer ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={selectedAnswers[index] === question.correctAnswer ? "#10b981" : "#ef4444"}
                  />
                </View>
                <Text style={styles.reviewQuestion}>{question.question}</Text>
                <Text style={styles.correctAnswer}>
                  Correct: {question.options[question.correctAnswer]}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.restartButton} onPress={resetQuiz}>
            <LinearGradient
              colors={['#00c3ff', '#ff00ff']}
              style={styles.restartButtonGradient}
            >
              <Text style={styles.restartButtonText}>Back to Quizzes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {viewMode === 'list' && renderQuizList()}
          {viewMode === 'quiz' && renderQuiz()}
          {viewMode === 'results' && renderResults()}
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  quizList: {
    paddingTop: 20,
  },
  quizCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quizCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quizDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizCategory: {
    color: '#00c3ff',
    fontSize: 12,
    fontWeight: '600',
  },
  questionCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  quizContainer: {
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00c3ff',
    borderRadius: 4,
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#00c3ff',
    backgroundColor: 'rgba(0, 195, 255, 0.2)',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#00c3ff',
    fontWeight: 'bold',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingTop: 20,
  },
  resultsCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00c3ff',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 24,
    color: '#ff00ff',
    marginBottom: 24,
  },
  scoreBreakdown: {
    width: '100%',
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  questionReview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewQuestionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewQuestion: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  correctAnswer: {
    color: '#10b981',
    fontSize: 12,
  },
  restartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  restartButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizScreen;