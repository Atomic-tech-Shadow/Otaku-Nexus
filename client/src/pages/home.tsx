import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/layout/app-header";
import BottomNav from "@/components/layout/bottom-nav";


import QuizCard from "@/components/quiz/quiz-card";

import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Brain, Search, BookOpen, Sparkles, MessageSquare } from "lucide-react";
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
                  <div className="text-lg font-bold text-nexus-pink">{(userStats as any)?.totalAnime || 0}</div>
                  <div className="text-xs text-gray-400">Anime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-nexus-cyan">{(userStats as any)?.totalQuizzes || 0}</div>
                  <div className="text-xs text-gray-400">Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-nexus-purple">{(userStats as any)?.totalXP || 0}</div>
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

          </section>



          {/* Featured Quiz */}
          {featuredQuiz && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Featured Quiz</h3>
              <QuizCard quiz={featuredQuiz as any} featured />
            </section>
          )}



          {/* User Progress */}
          <section className="mb-6">
            <div className="glass-morphism rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quizzes Completed</span>
                    <span className="text-nexus-cyan">{(userStats as any)?.totalQuizzes || 0}</span>
                  </div>
                  <div className="w-full bg-nexus-surface rounded-full h-2">
                    <div className="bg-gradient-to-r from-nexus-cyan to-nexus-pink h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Rank</span>
                    <span className="text-nexus-pink">#{(userStats as any)?.rank || 'Unranked'}</span>
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