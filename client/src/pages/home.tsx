import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/layout/app-header";
import BottomNav from "@/components/layout/bottom-nav";


import QuizCard from "@/components/quiz/quiz-card";

import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Brain, Search, BookOpen, Sparkles, MessageSquare, Trophy, Crown, Medal } from "lucide-react";
import { Link } from "wouter";
import { PostCard } from "@/components/ui/post-card";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  const { data: userStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });



  const { data: featuredQuiz, isLoading: quizLoading } = useQuery({
    queryKey: ["/api/quizzes/featured"],
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });



  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { data: topUsers = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/users/leaderboard"],
    staleTime: 30 * 1000, // 30 seconds pour forcer la mise à jour fréquente
    retry: 2,
    refetchInterval: 60 * 1000, // Actualise toutes les minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-dark text-white pb-20">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 animate-float" style={{ backgroundColor: 'var(--nexus-cyan)' }}></div>
        <div className="absolute top-40 right-5 w-24 h-24 rounded-full opacity-15 animate-pulse-slow" style={{ backgroundColor: 'var(--nexus-pink)' }}></div>
        <div className="absolute bottom-20 left-5 w-20 h-20 rounded-full opacity-25 animate-float" style={{ backgroundColor: 'var(--nexus-purple)', animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <AppHeader />

        <main className="px-4 pb-6">
          {/* Welcome Section */}
          <section className="mb-6">
            <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30" style={{ background: 'linear-gradient(to bottom right, var(--nexus-pink), transparent)' }}></div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, <span className="text-nexus-cyan">{user?.firstName || user?.username || 'Otaku'}</span>!
              </h1>
              <p className="text-gray-300 text-sm mb-4">Ready to explore the anime universe?</p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-nexus-pink">{String((userStats as any)?.totalAnime || 0)}</div>
                  <div className="text-xs text-gray-400">Anime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-nexus-cyan">{String((userStats as any)?.totalQuizzes || 0)}</div>
                  <div className="text-xs text-gray-400">Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-nexus-purple">{String((userStats as any)?.totalXP || 0)}</div>
                  <div className="text-xs text-gray-400">XP</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-6">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Link href="/chat">
                <div>
                  <Button className="w-full bg-gradient-to-r from-nexus-cyan to-nexus-pink hover:from-nexus-cyan/80 hover:to-nexus-pink/80 transition-all duration-300 transform hover:scale-105">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </Link>
              <Link href="/quiz">
                <div>
                  <Button className="w-full bg-gradient-to-r from-nexus-purple to-nexus-orange hover:from-nexus-purple/80 hover:to-nexus-orange/80 transition-all duration-300 transform hover:scale-105">
                    <Brain className="w-4 h-4 mr-2" />
                    Quiz
                  </Button>
                </div>
              </Link>
            </div>
            
            {/* Test Anime Page */}
            <div className="mt-3">
              <Link href="/anime/1">
                <div>
                  <Button className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Test Anime Streaming
                  </Button>
                </div>
              </Link>
            </div>

          </section>



          {/* Featured Quiz */}
          {featuredQuiz && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Featured Quiz</h3>
              <QuizCard quiz={featuredQuiz as any} featured />
            </section>
          )}



          {/* Leaderboard */}
          <section className="mb-6">
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-nexus-cyan" />
                <h3 className="text-lg font-semibold">Top Otakus</h3>
              </div>
              {leaderboardLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : Array.isArray(topUsers) && topUsers.length > 0 ? (
                <div className="space-y-3">
                  {topUsers.slice(0, 5).map((topUser: any, index: number) => (
                    <div key={topUser.id} className="flex items-center space-x-3 p-3 rounded-xl bg-nexus-surface/30 hover:bg-nexus-surface/50 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                        {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                        {index > 2 && <span className="text-sm font-semibold text-gray-400">#{index + 1}</span>}
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-nexus-cyan/50 flex-shrink-0 relative">
                        {topUser.profileImageUrl ? (
                          <img 
                            src={topUser.profileImageUrl} 
                            alt={`${topUser.firstName || topUser.username} profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Image failed to load:', topUser.profileImageUrl);
                              const target = e.currentTarget;
                              const fallback = target.parentElement?.querySelector('.fallback-avatar') as HTMLElement;
                              if (fallback) {
                                target.style.display = 'none';
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`fallback-avatar w-full h-full bg-gradient-to-br from-nexus-cyan to-nexus-purple items-center justify-center ${topUser.profileImageUrl ? 'hidden' : 'flex'}`}>
                          <span className="text-xs font-bold text-white">
                            {(topUser.firstName || topUser.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {topUser.firstName ? `${topUser.firstName} ${topUser.lastName || ''}`.trim() : topUser.username || 'Otaku'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Niveau {topUser.level || 1} • {topUser.xp || 0} XP
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-nexus-cyan">
                          {String(topUser.xp || 0)}
                        </div>
                        <div className="text-xs text-gray-400">XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun classement disponible</p>
                </div>
              )}
            </div>
          </section>

          {/* User Progress */}
          <section className="mb-6">
            <div className="glass-morphism rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quizzes Completed</span>
                    <span className="text-nexus-cyan">{String((userStats as any)?.totalQuizzes || 0)}</span>
                  </div>
                  <div className="w-full bg-nexus-surface rounded-full h-2">
                    <div className="bg-gradient-to-r from-nexus-cyan to-nexus-pink h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Rank</span>
                    <span className="text-nexus-pink">#{String((userStats as any)?.rank || 'Unranked')}</span>
                  </div>
                  <div className="w-full bg-nexus-surface rounded-full h-2">
                    <div className="bg-gradient-to-r from-nexus-pink to-nexus-purple h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Posts */}
          {Array.isArray(posts) && posts.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Latest Updates</h3>
              </div>
              <div className="space-y-3">
                {posts.slice(0, 2).map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}