import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import QuizCard from "@/components/quiz/quiz-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Brain, Search, BookOpen, Sparkles, MessageSquare, Trophy, Crown, Medal, Play } from "lucide-react";
import { Link } from "wouter";
import { PostCard } from "@/components/ui/post-card";
import { motion } from "framer-motion";

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
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 bg-nexus-cyan"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-5 w-24 h-24 rounded-full opacity-15 bg-nexus-pink"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-5 w-20 h-20 rounded-full opacity-25 bg-nexus-purple"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 px-4 pb-6">
        {/* Welcome Section */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden card-hover">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30 bg-gradient-to-br from-nexus-pink to-transparent" />
            <h1 className="text-2xl font-bold mb-2 text-white">
              Welcome back, <span className="text-nexus-cyan">{user?.firstName || user?.username || 'Otaku'}</span>!
            </h1>
            <p className="text-gray-300 text-sm mb-4">Ready to explore our content universe?</p>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-nexus-pink">{String((userStats as any)?.totalContent || 0)}</div>
                <div className="text-xs text-gray-400">Content</div>
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
        </motion.section>

        {/* Quick Actions */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Link href="/chat">
              <motion.div
                className="glass-morphism rounded-xl p-4 text-center transition-all duration-300 hover:bg-nexus-surface/30 card-hover"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-8 h-8 text-nexus-cyan mx-auto mb-2" />
                <span className="text-sm font-medium text-white">Chat</span>
              </motion.div>
            </Link>


          </div>

          <Link href="/quiz">
            <motion.div
              className="glass-morphism rounded-xl p-4 text-center transition-all duration-300 hover:bg-nexus-surface/30 card-hover"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Brain className="w-8 h-8 text-nexus-pink mx-auto mb-2" />
              <span className="text-sm font-medium text-white">Take Quiz</span>
            </motion.div>
          </Link>
        </motion.section>

        {/* Featured Quiz */}
        {featuredQuiz && typeof featuredQuiz === 'object' && (
          <motion.section 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Sparkles className="w-5 h-5 text-nexus-orange mr-2" />
                Featured Quiz
              </h3>
            </div>
            <QuizCard quiz={featuredQuiz as any} />
          </motion.section>
        )}

        {/* Leaderboard */}
        {Array.isArray(topUsers) && topUsers.length > 0 && (
          <motion.section 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Trophy className="w-5 h-5 text-nexus-orange mr-2" />
                Top Otakus
              </h3>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-nexus-cyan hover:text-nexus-purple">
                  View All
                </Button>
              </Link>
            </div>
            <div className="glass-morphism rounded-xl p-4 space-y-3">
              {topUsers.slice(0, 3).map((topUser: any, index) => (
                <motion.div 
                  key={topUser.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-nexus-surface/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-nexus-cyan to-nexus-purple flex items-center justify-center">
                      {index === 0 && <Crown className="w-4 h-4 text-white" />}
                      {index === 1 && <Medal className="w-4 h-4 text-white" />}
                      {index === 2 && <Trophy className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{topUser.firstName || topUser.username}</div>
                      <div className="text-xs text-gray-400">Level {topUser.level || 1}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-nexus-cyan">{topUser.xp || 0} XP</div>
                    <div className="w-full bg-nexus-surface rounded-full h-2">
                      <div className="bg-gradient-to-r from-nexus-pink to-nexus-purple h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Latest Posts */}
        {Array.isArray(posts) && posts.length > 0 && (
          <motion.section 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Latest Updates</h3>
            </div>
            <div className="space-y-3">
              {posts.slice(0, 2).map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </MainLayout>
  );
}