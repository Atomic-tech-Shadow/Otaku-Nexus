import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AnimeCard from "@/components/anime/anime-card";
import QuizCard from "@/components/quiz/quiz-card";
import VideoCard from "@/components/video/video-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Brain, Search } from "lucide-react";
import { Link } from "wouter";
import { PostCard } from "@/components/ui/post-card";

export default function Home() {
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

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    retry: false,
  });

  const { data: trendingAnimes, isLoading: animesLoading } = useQuery({
    queryKey: ["/api/anime/trending"],
    retry: false,
  });

  const { data: featuredQuiz, isLoading: quizLoading } = useQuery({
    queryKey: ["/api/quizzes/featured"],
    retry: false,
  });

  const { data: popularVideos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos/popular"],
    retry: false,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
          {/* Welcome Section */}
          <section className="mb-6">
            <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-hot-pink to-transparent rounded-full opacity-30"></div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, <span className="electric-blue">{user?.firstName || user?.username || 'Otaku'}</span>!
              </h1>
              <p className="text-gray-300 text-sm mb-4">Ready to explore the anime universe?</p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold hot-pink">{userStats?.totalAnime || 0}</div>
                  <div className="text-xs text-gray-400">Anime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold electric-blue">{userStats?.totalQuizzes || 0}</div>
                  <div className="text-xs text-gray-400">Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold otaku-purple">{userStats?.totalXP || 0}</div>
                  <div className="text-xs text-gray-400">XP</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/quiz">
                <Button className="gradient-border w-full h-auto p-0">
                  <div className="gradient-border-inner p-4 text-center w-full">
                    <Brain className="w-6 h-6 electric-blue mx-auto mb-2" />
                    <div className="font-semibold text-sm">Take Quiz</div>
                    <div className="text-xs text-gray-400">Test your knowledge</div>
                  </div>
                </Button>
              </Link>
              <Link href="/anime">
                <Button className="gradient-border w-full h-auto p-0">
                  <div className="gradient-border-inner p-4 text-center w-full">
                    <Search className="w-6 h-6 hot-pink mx-auto mb-2" />
                    <div className="font-semibold text-sm">Find Anime</div>
                    <div className="text-xs text-gray-400">Discover new series</div>
                  </div>
                </Button>
              </Link>
            </div>
          </section>

          {/* Trending Anime */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Trending Anime</h3>
              <Link href="/anime">
                <Button variant="ghost" size="sm" className="electric-blue text-sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2 custom-scroll">
              {animesLoading ? (
                <div className="flex space-x-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-32 h-32 bg-card-bg rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : trendingAnimes && trendingAnimes.length > 0 ? (
                trendingAnimes.map((anime: any) => (
                  <AnimeCard key={anime.id} anime={anime} compact />
                ))
              ) : (
                <p className="text-gray-400 text-sm">No trending anime available</p>
              )}
            </div>
          </section>

          {/* Featured Quiz */}
          {featuredQuiz && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Featured Quiz</h3>
              <QuizCard quiz={featuredQuiz} featured />
            </section>
          )}

          {/* Popular Videos */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Popular AMVs</h3>
              <Link href="/videos">
                <Button variant="ghost" size="sm" className="electric-blue text-sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {videosLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-card-bg rounded-xl p-3 animate-pulse h-16"></div>
                  ))}
                </div>
              ) : popularVideos && popularVideos.length > 0 ? (
                popularVideos.slice(0, 2).map((video: any) => (
                  <VideoCard key={video.id} video={video} compact />
                ))
              ) : (
                <p className="text-gray-400 text-sm">No popular videos available</p>
              )}
            </div>
          </section>

          {/* User Stats */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Your Progress</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card-bg rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-4 h-4 hot-pink" />
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <div className="text-xl font-bold mb-1">{userStats?.totalQuizzes || 0}</div>
                <div className="text-xs text-gray-400">Quizzes Completed</div>
              </div>
              <div className="bg-card-bg rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Search className="w-4 h-4 electric-blue" />
                  <span className="text-xs text-gray-400">Global</span>
                </div>
                <div className="text-xl font-bold mb-1">#{userStats?.rank || 1}</div>
                <div className="text-xs text-gray-400">Rank</div>
              </div>
            </div>
          </section>

          {/* Creator Posts Section */}
          {posts.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold text-white mb-6">📢 Annonces du Créateur</h3>
              <div className="space-y-6">
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  posts.slice(0, 3).map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
              {posts.length > 3 && (
                <div className="text-center mt-6">
                  <Button variant="outline" className="electric-blue text-sm">
                    Voir toutes les annonces
                  </Button>
                </div>
              )}
            </section>
          )}
        </main>

        <BottomNavigation currentPath="/" />
      </div>
    </div>
  );
}