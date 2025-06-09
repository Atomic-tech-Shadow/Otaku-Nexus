import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import QuizCard from "@/components/quiz/quiz-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Brain, Trophy, Target } from "lucide-react";

export default function Quiz() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    retry: false,
  });

  const { data: userResults, isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/quiz-results"],
    retry: false,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Group quizzes by difficulty
  const easyQuizzes = quizzes?.filter((q: any) => q.difficulty === "easy") || [];
  const mediumQuizzes = quizzes?.filter((q: any) => q.difficulty === "medium") || [];
  const hardQuizzes = quizzes?.filter((q: any) => q.difficulty === "hard") || [];

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-20 h-20 bg-otaku-purple rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <AppHeader />

        <main className="px-4 pb-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-gradient">Otaku Quizzes</h1>
            <p className="text-gray-400 text-sm">Test your anime knowledge and earn XP</p>
          </div>

          {/* Stats Overview */}
          <section className="mb-6">
            <div className="glass-morphism rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Your Quiz Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Brain className="w-6 h-6 electric-blue mx-auto mb-2" />
                  <div className="text-lg font-bold">{userStats?.totalQuizzes || 0}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <Trophy className="w-6 h-6 hot-pink mx-auto mb-2" />
                  <div className="text-lg font-bold">{userStats?.totalXP || 0}</div>
                  <div className="text-xs text-gray-400">Total XP</div>
                </div>
                <div className="text-center">
                  <Target className="w-6 h-6 otaku-purple mx-auto mb-2" />
                  <div className="text-lg font-bold">#{userStats?.rank || 1}</div>
                  <div className="text-xs text-gray-400">Rank</div>
                </div>
              </div>
            </div>
          </section>

          {/* Easy Quizzes */}
          {easyQuizzes.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Easy Quizzes
              </h3>
              <div className="space-y-3">
                {easyQuizzes.map((quiz: any) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </section>
          )}

          {/* Medium Quizzes */}
          {mediumQuizzes.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Medium Quizzes
              </h3>
              <div className="space-y-3">
                {mediumQuizzes.map((quiz: any) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </section>
          )}

          {/* Hard Quizzes */}
          {hardQuizzes.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Hard Quizzes
              </h3>
              <div className="space-y-3">
                {hardQuizzes.map((quiz: any) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </section>
          )}

          {/* Loading State */}
          {quizzesLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card-bg rounded-xl p-4 animate-pulse h-24"></div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!quizzesLoading && (!quizzes || quizzes.length === 0) && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-400">No Quizzes Available</h3>
              <p className="text-gray-500">Check back later for new quizzes to test your knowledge!</p>
            </div>
          )}

          {/* Recent Results */}
          {userResults && userResults.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
              <div className="space-y-3">
                {userResults.slice(0, 3).map((result: any) => (
                  <div key={result.id} className="bg-card-bg rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Quiz #{result.quizId}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold electric-blue">
                          {result.score}/{result.totalQuestions}
                        </p>
                        <p className="text-xs text-gray-400">+{result.xpEarned} XP</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <BottomNavigation currentPath="/quiz" />
      </div>
    </div>
  );
}
