import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Trophy, Brain, Heart, Play, Star, Award, Edit, Settings } from "lucide-react";
import { Link } from "wouter";
import { TwitterVerificationBadge, FacebookVerificationBadge } from "@/components/ui/verification-badges";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: userStats = { totalQuizzes: 0, totalAnime: 0, totalXP: 0, rank: 0 } } = useQuery<{
    totalQuizzes: number;
    totalAnime: number;
    totalXP: number;
    rank: number;
  }>({
    queryKey: ["/api/user/stats"],
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
    enabled: !!isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: quizResults = [] } = useQuery<any[]>({
    queryKey: ["/api/quiz-results"],
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = ((currentXP % 100) / 100) * 100;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Calculate achievements
  const achievements = [];
  if (userStats.totalQuizzes >= 1) achievements.push({ name: "First Quiz", icon: Brain, color: "electric-blue" });
  if (userStats.totalQuizzes >= 10) achievements.push({ name: "Quiz Master", icon: Trophy, color: "hot-pink" });
  if (userStats.totalAnime >= 5) achievements.push({ name: "Anime Lover", icon: Heart, color: "anime-red" });
  if (userStats.totalXP >= 100) achievements.push({ name: "XP Hunter", icon: Star, color: "otaku-purple" });
  if (userStats.rank <= 100) achievements.push({ name: "Top 100", icon: Award, color: "hot-pink" });

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
          {/* Profile Header */}
          <section className="mb-6">
            <div className="glass-morphism rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-electric-blue mx-auto mb-4 overflow-hidden">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-electric-blue to-hot-pink flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {(user?.firstName || user?.username || 'O').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
                {user?.firstName || user?.username || 'Anonymous Otaku'}
                {user?.isAdmin && (
                  <TwitterVerificationBadge size="md" />
                )}
                {user?.id === "71394585" && (
                  <FacebookVerificationBadge size="md" />
                )}
              </h2>
              <p className="text-gray-400 text-sm mb-2">
                {user?.email || 'No email provided'}
              </p>

              {/* Bio */}
              {user?.bio && (
                <div className="bg-gray-800/50 rounded-lg p-3 mb-3 max-w-xs mx-auto">
                  <p className="text-gray-300 text-sm italic">"{user.bio}"</p>
                </div>
              )}

              {/* Favorite Quote */}
              {user?.favoriteQuote && (
                <div className="bg-blue-900/30 rounded-lg p-3 mb-4 max-w-xs mx-auto">
                  <p className="text-blue-200 text-sm">💭 {user.favoriteQuote}</p>
                </div>
              )}

              <div className="flex gap-2 justify-center mb-4">
                <Link href="/edit-profile">
                  <Button variant="outline" size="sm" className="border-blue-500 text-blue-400 hover:bg-blue-500/20">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Level and XP */}
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-sm electric-blue">Level {currentLevel}</span>
                  <div className="flex-1 max-w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-electric-blue to-hot-pink rounded-full transition-all duration-300" 
                      style={{ width: `${xpProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">{currentXP} XP</span>
                </div>
                <p className="text-xs text-gray-500">
                  {100 - (currentXP % 100)} XP to level {currentLevel + 1}
                </p>
              </div>

              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card-bg rounded-xl p-4 text-center">
                <Brain className="w-8 h-8 electric-blue mx-auto mb-2" />
                <div className="text-2xl font-bold">{userStats.totalQuizzes}</div>
                <div className="text-sm text-gray-400">Quizzes Completed</div>
              </div>
              <div className="bg-card-bg rounded-xl p-4 text-center">
                <Heart className="w-8 h-8 hot-pink mx-auto mb-2" />
                <div className="text-2xl font-bold">{userStats.totalAnime}</div>
                <div className="text-sm text-gray-400">Favorite Anime</div>
              </div>
              <div className="bg-card-bg rounded-xl p-4 text-center">
                <Trophy className="w-8 h-8 otaku-purple mx-auto mb-2" />
                <div className="text-2xl font-bold">#{userStats.rank}</div>
                <div className="text-sm text-gray-400">Global Rank</div>
              </div>
              <div className="bg-card-bg rounded-xl p-4 text-center">
                <Star className="w-8 h-8 anime-red mx-auto mb-2" />
                <div className="text-2xl font-bold">{userStats.totalXP}</div>
                <div className="text-sm text-gray-400">Total XP</div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          {achievements.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="bg-card-bg rounded-xl p-3 text-center">
                    <achievement.icon className={`w-6 h-6 ${achievement.color} mx-auto mb-2`} />
                    <div className="text-sm font-semibold">{achievement.name}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Quiz Results */}
          {quizResults && quizResults.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Recent Quiz Results</h3>
              <div className="space-y-3">
                {quizResults.slice(0, 3).map((result: any) => (
                  <div key={result.id} className="bg-card-bg rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Quiz #{result.quizId}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-electric-blue/20 text-electric-blue">
                          {result.score}/{result.totalQuestions}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">+{result.xpEarned} XP</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Account Info */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="bg-card-bg rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since</span>
                <span className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID</span>
                <span className="text-white font-mono text-sm">{user?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-white">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </section>
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
}