import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  timeLimit: number;
  questions: Question[];
}

export default function QuizDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { quizId } = route.params as { quizId: string };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Données du quiz
  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: ['/api/quizzes', quizId],
    enabled: !!quizId,
  });

  // Timer du quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [quizStarted, timeLeft, quizCompleted]);

  // Soumission du quiz
  const submitQuizMutation = useMutation({
    mutationFn: async (answers: number[]) => {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la soumission du quiz');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setScore(data.score);
      setQuizCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const handleStartQuiz = () => {
    if (quiz) {
      setQuizStarted(true);
      setTimeLeft(quiz.timeLimit * 60); // Convertir en secondes
      setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuizComplete = () => {
    submitQuizMutation.mutate(selectedAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'facile': return '#22c55e';
      case 'moyen': return '#f59e0b';
      case 'difficile': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Chargement du quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#ec4899" />
          <Text style={styles.errorTitle}>Quiz introuvable</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#1e40af', '#000000']}
          style={styles.resultContainer}
        >
          <View style={styles.resultContent}>
            <Ionicons 
              name={score >= quiz.questions.length * 0.7 ? "trophy" : "medal"} 
              size={80} 
              color={score >= quiz.questions.length * 0.7 ? "#f59e0b" : "#6b7280"} 
            />
            <Text style={styles.resultTitle}>Quiz terminé !</Text>
            <Text style={styles.scoreText}>
              {score} / {quiz.questions.length}
            </Text>
            <Text style={styles.percentageText}>
              {Math.round((score / quiz.questions.length) * 100)}%
            </Text>
            <Text style={styles.xpText}>
              +{Math.round(quiz.xpReward * (score / quiz.questions.length))} XP gagnés
            </Text>
            
            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.finishButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#1e40af', '#000000']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00D4FF" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.quizPreview}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.quizDescription}>{quiz.description}</Text>
          
          <View style={styles.quizInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="help-circle" size={20} color="#00D4FF" />
              <Text style={styles.infoText}>{quiz.questions.length} questions</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#00D4FF" />
              <Text style={styles.infoText}>{quiz.timeLimit} minutes</Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) }]}>
                <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text style={styles.infoText}>{quiz.xpReward} XP</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
          >
            <LinearGradient
              colors={['#00D4FF', '#1e40af']}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Commencer le quiz</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec timer et progress */}
      <LinearGradient
        colors={['#000000', '#1e40af', '#000000']}
        style={styles.quizHeader}
      >
        <View style={styles.quizHeaderContent}>
          <Text style={styles.questionCounter}>
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </Text>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </LinearGradient>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerOption,
                selectedAnswers[currentQuestionIndex] === index && styles.selectedAnswer
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <View style={styles.answerContent}>
                <View style={[
                  styles.answerIndicator,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedIndicator
                ]}>
                  <Text style={[
                    styles.answerLetter,
                    selectedAnswers[currentQuestionIndex] === index && styles.selectedLetter
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.answerText,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedAnswerText
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentQuestionIndex === 0 ? "#666" : "#00D4FF"} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledText]}>
            Précédent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            selectedAnswers[currentQuestionIndex] === -1 && styles.disabledButton
          ]}
          onPress={handleNextQuestion}
          disabled={selectedAnswers[currentQuestionIndex] === -1}
        >
          <Text style={[
            styles.navButtonText,
            selectedAnswers[currentQuestionIndex] === -1 && styles.disabledText
          ]}>
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
          </Text>
          <Ionicons 
            name={currentQuestionIndex === quiz.questions.length - 1 ? "checkmark" : "chevron-forward"} 
            size={24} 
            color={selectedAnswers[currentQuestionIndex] === -1 ? "#666" : "#00D4FF"} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingBottom: 15,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 20,
    marginTop: 10,
  },
  quizPreview: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  quizDescription: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  quizInfo: {
    gap: 20,
    marginBottom: 50,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  startButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quizHeader: {
    paddingBottom: 15,
  },
  quizHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  questionCounter: {
    color: '#00D4FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timer: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  questionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
    marginBottom: 30,
    textAlign: 'center',
  },
  answersContainer: {
    gap: 15,
  },
  answerOption: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedAnswer: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: '#00D4FF',
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  answerIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    backgroundColor: '#00D4FF',
  },
  answerLetter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedLetter: {
    color: '#000',
  },
  answerText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  selectedAnswerText: {
    color: '#00D4FF',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  nextButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navButtonText: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#666',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  scoreText: {
    color: '#00D4FF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  percentageText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  xpText: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 40,
  },
  finishButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  finishButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});