import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import QuizCard from "@/components/quiz/quiz-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Brain, Trophy, Target } from "lucide-react";
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

  const { data: quizzes = [], isLoading, error } = useQuery({
    queryKey: ["/api/quizzes"],
    retry: false,
  });

  // Debug logging
  console.log("Quiz data:", quizzes);
  console.log("Quiz loading:", isLoading);
  console.log("Quiz error:", error);

  const filteredQuizzes = Array.isArray(quizzes) ? quizzes.filter(quiz => {
    const difficultyMatch = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    const categoryMatch = selectedCategory === "all" || quiz.category === selectedCategory;
    return difficultyMatch && categoryMatch;
  }) : [];

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

        <main className="px-4 py-6">
          <div className="mb-6">
            <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-hot-pink to-transparent rounded-full opacity-30"></div>
              <h1 className="text-2xl font-bold mb-2 hot-pink">Quiz Arena</h1>
              <p className="text-gray-300 text-sm mb-4">Test your anime knowledge and earn XP!</p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold electric-blue">🧠</div>
                  <div className="text-xs text-gray-400">Brain Power</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold hot-pink">⚡</div>
                  <div className="text-xs text-gray-400">Fast Thinking</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold otaku-purple">🏆</div>
                  <div className="text-xs text-gray-400">Victory</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="flex-1 bg-card-bg border-gray-700 text-white">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-card-bg border-gray-700">
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1 bg-card-bg border-gray-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-card-bg border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="characters">Characters</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quiz Grid */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-card-bg rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}

          {!isLoading && filteredQuizzes.length === 0 && (
            <div className="text-center py-8">
              <div className="glass-morphism rounded-2xl p-6">
                <p className="text-gray-300 mb-4">
                  {quizzes.length === 0 ? "Aucun quiz disponible pour le moment." : "Aucun quiz ne correspond à vos critères."}
                </p>
                {error && (
                  <p className="text-red-400 text-sm">
                    Erreur de chargement: {error.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </main>

        <BottomNavigation currentPath="/quiz" />
      </div>
    </div>
  );
}