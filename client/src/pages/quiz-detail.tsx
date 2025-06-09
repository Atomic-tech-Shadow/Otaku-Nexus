import { useState, useEffect } from "react";
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
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);

  const quizId = params?.id ? parseInt(params.id) : null;

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

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ["/api/quizzes", quizId],
    enabled: !!quizId,
    retry: false,
  });

  const submitResultMutation = useMutation({
    mutationFn: async (result: any) => {
      return await apiRequest("POST", "/api/quiz-results", result);
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

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleQuizComplete();
    }
  }, [quizStarted, quizCompleted, timeLeft]);

  if (isLoading || quizLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Quiz not found</h2>
          <Link href="/quiz">
            <Button>Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const questions: Question[] = quiz && Array.isArray(quiz.questions) ? quiz.questions : [];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(questions.length * 60); // 1 minute per question
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
    setQuizCompleted(true);
    setShowResults(true);
    
    // Calculate score
    const correctAnswers = selectedAnswers.reduce((score, answer, index) => {
      return answer === questions[index]?.correctAnswer ? score + 1 : score;
    }, 0);
    
    const xpEarned = Math.floor((correctAnswers / questions.length) * ((quiz as any)?.xpReward || 10));
    
    // Submit results
    submitResultMutation.mutate({
      quizId: (quiz as any)?.id,
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

            <Card className="bg-card-bg border-gray-800 mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold electric-blue">{questions.length}</div>
                    <div className="text-sm text-gray-400">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold hot-pink">+{(quiz as any)?.xpReward || 10}</div>
                    <div className="text-sm text-gray-400">XP Reward</div>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <Badge className={`text-lg px-4 py-2 ${
                    (quiz as any)?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                    (quiz as any)?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {(quiz as any)?.difficulty?.toUpperCase() || 'MEDIUM'}
                  </Badge>
                </div>

                <Button 
                  onClick={handleStartQuiz}
                  className="w-full bg-electric-blue hover:bg-electric-blue/80 text-lg py-3"
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
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
                <Trophy className="w-16 h-16 hot-pink mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2 electric-blue">
                  {results.correctAnswers}/{questions.length}
                </div>
                <div className="text-lg mb-4">
                  {results.percentage.toFixed(1)}% Correct
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  You earned <span className="otaku-purple font-bold">+{results.xpEarned} XP</span>
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
          <h2 className="text-xl font-bold mb-4">Question not found</h2>
          <Link href="/quiz">
            <Button>Back to Quizzes</Button>
          </Link>
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