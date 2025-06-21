import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import QuizCard from "@/components/quiz/quiz-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Brain, Trophy, Target, Filter } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Quiz() {
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: quizzes = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/quizzes"],
    retry: false,
  });

  const filteredQuizzes = Array.isArray(quizzes) ? quizzes.filter(quiz => {
    const difficultyMatch = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    const categoryMatch = selectedCategory === "all" || quiz.category === selectedCategory;
    return difficultyMatch && categoryMatch;
  }) : [];

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
        {/* Header Section */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden card-hover">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-nexus-pink to-transparent rounded-full opacity-30" />
            <h1 className="text-2xl font-bold mb-2 text-nexus-pink">Quiz Arena</h1>
            <p className="text-gray-300 text-sm mb-4">Test your anime knowledge and earn XP!</p>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-nexus-cyan">🧠</div>
                <div className="text-xs text-gray-400">Brain Power</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-nexus-pink">⚡</div>
                <div className="text-xs text-gray-400">Fast Thinking</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-nexus-purple">🏆</div>
                <div className="text-xs text-gray-400">Victory</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Filters */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="glass-morphism border-nexus-cyan/30 text-white hover:border-nexus-cyan/50 transition-colors">
                  <Filter className="w-4 h-4 text-nexus-cyan mr-2" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-nexus-surface border-nexus-cyan/30">
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="glass-morphism border-nexus-purple/30 text-white hover:border-nexus-purple/50 transition-colors">
                  <Target className="w-4 h-4 text-nexus-purple mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-nexus-surface border-nexus-purple/30">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="characters">Characters</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.section>

        {/* Quiz Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="h-32 glass-morphism rounded-lg animate-shimmer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <QuizCard quiz={quiz} />
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filteredQuizzes.length === 0 && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass-morphism rounded-2xl p-6 card-hover">
                <Brain className="w-16 h-16 text-nexus-cyan mx-auto mb-4 opacity-50" />
                <p className="text-gray-300 mb-4">No quizzes match your current filters.</p>
                <p className="text-sm text-gray-400">Try adjusting your difficulty or category selection.</p>
              </div>
            </motion.div>
          )}
        </motion.section>
      </div>
    </MainLayout>
  );
}