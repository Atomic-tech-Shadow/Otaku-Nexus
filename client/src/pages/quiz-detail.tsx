import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Trophy, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import QuizInstructions from "@/components/quiz/quiz-instructions";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuizDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, params] = useRoute("/quiz/:id");
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const quizId = params?.id ? parseInt(params.id) : null;

  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: ["/api/quizzes", quizId],
    queryFn: async () => {
      console.log("Fetching quiz data for ID:", quizId);
      const response = await fetch(`/api/quizzes/${quizId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw quiz data received:", data);
      return data;
    },
    enabled: !!quizId,
    retry: 2,
  });

  const submitResultMutation = useMutation({
    mutationFn: async (result: any) => {
      console.log("Submitting quiz result:", result);
      return await apiRequest("/api/quiz-results", {
        method: "POST",
        body: result,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-results"] });
      toast({
        title: "Quiz Completed!",
        description: "Your results have been saved.",
        variant: "default",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save quiz results.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Timer effect - only runs when quiz is actually started
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [quizStarted, quizCompleted, timeLeft]);

  // Separate effect for timer expiration to avoid premature completion
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft === 0) {
      console.log("Timer expired, completing quiz");
      handleQuizComplete();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  // Parse questions from quiz data - moved after all hooks
  const questions: Question[] = useMemo(() => {
    if (!quiz) return [];

    // Handle quiz data structure
    const quizData = quiz as any;
    
    console.log("Processing quiz data:", quizData);
    console.log("Questions field type:", typeof quizData.questions);
    console.log("Questions value:", quizData.questions);
    
    // If questions is already an array, return it
    if (Array.isArray(quizData.questions)) {
      console.log("Questions is already an array, length:", quizData.questions.length);
      return quizData.questions;
    }

    // If questions is a string (JSON), parse it
    if (typeof quizData.questions === 'string') {
      try {
        const parsed = JSON.parse(quizData.questions);
        if (Array.isArray(parsed)) {
          console.log("Successfully parsed questions from string, length:", parsed.length);
          return parsed;
        }
      } catch (error) {
        console.error("Failed to parse questions JSON:", error);
      }
    }

    // If quiz is an array, take the first element
    if (Array.isArray(quiz) && quiz.length > 0) {
      const firstQuiz = quiz[0] as any;
      console.log("Quiz is array, processing first element:", firstQuiz);
      
      if (Array.isArray(firstQuiz.questions)) {
        console.log("First quiz questions is array, length:", firstQuiz.questions.length);
        return firstQuiz.questions;
      }
      
      if (typeof firstQuiz.questions === 'string') {
        try {
          const parsed = JSON.parse(firstQuiz.questions);
          if (Array.isArray(parsed)) {
            console.log("Successfully parsed questions from first quiz string, length:", parsed.length);
            return parsed;
          }
        } catch (error) {
          console.error("Failed to parse questions JSON from first quiz:", error);
        }
      }
    }

    console.log("No valid questions found, quiz structure:", quiz);
    return [];
  }, [quiz]);
  
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  
  // Debug log for questions
  useEffect(() => {
    console.log("Quiz data loaded:", quiz);
    console.log("Questions length:", questions.length);
    console.log("Quiz started:", quizStarted);
    console.log("Show results:", showResults);
  }, [quiz, questions, quizStarted, showResults]);

  const handleStartQuiz = () => {
    console.log("Starting quiz with questions:", questions);
    console.log("Questions length:", questions.length);
    
    if (!questions || questions.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune question disponible pour ce quiz. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
      return;
    }

    // Validate that questions have the required structure
    const validQuestions = questions.filter(q => 
      q && 
      q.question && 
      q.options && 
      Array.isArray(q.options) && 
      q.options.length > 0 &&
      typeof q.correctAnswer === 'number'
    );

    if (validQuestions.length === 0) {
      toast({
        title: "Erreur",
        description: "Les questions de ce quiz ne sont pas valides. Veuillez contacter l'administrateur.",
        variant: "destructive",
      });
      return;
    }

    if (validQuestions.length !== questions.length) {
      console.warn(`Some questions are invalid. Valid: ${validQuestions.length}, Total: ${questions.length}`);
    }

    setQuizStarted(true);
    setTimeLeft(validQuestions.length * 60); // 1 minute per question
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    console.log("Quiz completion triggered");
    console.log("Current question:", currentQuestion);
    console.log("Questions length:", questions.length);
    console.log("Selected answers:", selectedAnswers);

    setQuizCompleted(true);
    setShowResults(true);

    // Calculate score
    const correctAnswers = selectedAnswers.reduce((score, answer, index) => {
      return answer === questions[index]?.correctAnswer ? score + 1 : score;
    }, 0);

    const xpEarned = Math.floor((correctAnswers / questions.length) * ((quiz as any)?.xpReward || 10));

    // Ensure quizId is valid before submitting
    if (!quizId) {
      console.error("Quiz ID is missing!");
      toast({
        title: "Erreur",
        description: "ID du quiz manquant",
        variant: "destructive",
      });
      return;
    }

    console.log("Quiz submission data:", {
      quizId,
      score: correctAnswers,
      totalQuestions: questions.length,
      xpEarned,
    });

    // Submit results
    submitResultMutation.mutate({
      quizId: quizId,
      score: correctAnswers,
      totalQuestions: questions.length,
      xpEarned: xpEarned,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateResults = () => {
    const correctAnswers = selectedAnswers.reduce((score, answer, index) => {
      return answer === questions[index]?.correctAnswer ? score + 1 : score;
    }, 0);
    const percentage = (correctAnswers / questions.length) * 100;
    const xpEarned = Math.floor(percentage / 100 * ((quiz as any)?.xpReward || 10));

    return { correctAnswers, percentage, xpEarned };
  };

  if (isLoading || quizLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!quiz && !quizLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Quiz introuvable</h2>
          <p className="text-gray-400 mb-4">
            {quizError ? "Erreur de chargement du quiz" : "Le quiz demandé n'existe pas ou a été supprimé."}
          </p>
          {quizError && (
            <p className="text-red-400 text-sm mb-4">
              Erreur: {(quizError as any)?.message || "Erreur inconnue"}
            </p>
          )}
          <Link href="/quiz">
            <Button>Retour aux Quiz</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-dark-bg text-white pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
        </div>

        <div className="relative z-10">
          <AppHeader />
          <main className="px-4 pb-6">
            <div className="mb-6">
              <Link href="/quiz">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quizzes
                </Button>
              </Link>
              <h1 className="text-2xl font-bold mb-2 text-gradient">{(quiz as any)?.title}</h1>
              <p className="text-gray-400 text-sm">{(quiz as any)?.description}</p>
            </div>

            <QuizInstructions 
              quiz={{
                title: (quiz as any)?.title || '',
                description: (quiz as any)?.description,
                difficulty: (quiz as any)?.difficulty || 'medium',
                xpReward: (quiz as any)?.xpReward || 10
              }}
              questionCount={questions.length}
              onStart={handleStartQuiz}
            />
          </main>
          <BottomNavigation currentPath="/quiz" />
        </div>
      </div>
    );
  }

  // Quiz results screen
  if (showResults) {
    const results = calculateResults();

    return (
      <div className="min-h-screen bg-dark-bg text-white pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
        </div>

        <div className="relative z-10">
          <AppHeader />
          <main className="px-4 pb-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2 text-gradient">Quiz Complete!</h1>
              <p className="text-gray-400 text-sm">{(quiz as any)?.title}</p>
            </div>

            <Card className="bg-card-bg border-gray-800 mb-6">
              <CardContent className="p-6 text-center">
                <Trophy className="w-16 h-16 text-hot-pink mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2 text-electric-blue">
                  {results.correctAnswers}/{questions.length}
                </div>
                <div className="text-lg mb-4">
                  {results.percentage.toFixed(1)}% Correct
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  You earned <span className="text-otaku-purple font-bold">+{results.xpEarned} XP</span>
                </div>
                <Progress value={results.percentage} className="mb-4" />
              </CardContent>
            </Card>

            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <Card key={index} className="bg-card-bg border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {selectedAnswers[index] === question.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-2">{question?.question || "Question not available"}</p>
                        <p className="text-xs text-gray-400 mb-2">
                          Correct: {question?.options?.[question.correctAnswer] || "N/A"}
                        </p>
                        {selectedAnswers[index] !== question?.correctAnswer && (
                          <p className="text-xs text-red-400 mb-2">
                            Your answer: {question?.options?.[selectedAnswers[index]] || "No answer"}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{question?.explanation || ""}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <Link href="/quiz">
                <Button className="w-full">Back to Quizzes</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Home</Button>
              </Link>
            </div>
          </main>
          <BottomNavigation currentPath="/quiz" />
        </div>
      </div>
    );
  }

  // Quiz question screen
  const question = questions[currentQuestion];

  if (!question) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Question introuvable</h2>
          <p className="text-gray-400 mb-4">Impossible de charger la question #{currentQuestion + 1}.</p>
          <div className="space-y-3">
            <Link href="/quiz">
              <Button>Retour aux Quiz</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                } else {
                  setQuizStarted(false);
                }
              }}
            >
              Question Précédente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        <AppHeader />
        <main className="px-4 pb-6">
          {/* Progress and Timer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span className={timeLeft < 60 ? "text-red-400" : ""}>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card className="bg-card-bg border-gray-800 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-6">{question.question}</h2>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                    className={`w-full p-4 text-left justify-start h-auto ${
                      selectedAnswers[currentQuestion] === index 
                        ? "bg-electric-blue hover:bg-electric-blue/80" 
                        : "bg-transparent border-gray-600 hover:bg-gray-800"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3 flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Button */}
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="w-full bg-hot-pink hover:bg-hot-pink/80"
          >
            {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        </main>
        <BottomNavigation currentPath="/quiz" />
      </div>
    </div>
  );
}