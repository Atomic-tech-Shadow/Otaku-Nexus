import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface QuizCardProps {
  quiz: {
    id: number;
    title: string;
    description?: string;
    difficulty: string;
    questions: any;
    xpReward?: number;
  };
  featured?: boolean;
}

export default function QuizCard({ quiz, featured = false }: QuizCardProps) {
  const difficultyColors = {
    easy: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    hard: "bg-red-500/20 text-red-400",
  };

  const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 
                       quiz.questions?.length || 25;

  if (featured) {
    return (
      <div className="bg-gradient-to-r from-otaku-purple to-hot-pink rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-2">{quiz.title}</h4>
          <p className="text-sm opacity-90 mb-4">
            {quiz.description || "Test your knowledge of the greatest anime series!"}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm font-bold">{questionCount}</div>
                <div className="text-xs opacity-75">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold capitalize">{quiz.difficulty}</div>
                <div className="text-xs opacity-75">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold">+{quiz.xpReward || 10} XP</div>
                <div className="text-xs opacity-75">Reward</div>
              </div>
            </div>
            <Link href={`/quiz/${quiz.id}`}>
              <Button className="bg-white text-otaku-purple px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                Start Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card-bg hover:bg-secondary-bg transition-all duration-300 border-gray-800 hover:border-electric-blue/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{quiz.title}</h4>
            {quiz.description && (
              <p className="text-xs text-gray-400 line-clamp-2">{quiz.description}</p>
            )}
          </div>
          <Badge 
            className={cn(
              "ml-2",
              difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.medium
            )}
          >
            {quiz.difficulty}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center">
              <Target className="w-3 h-3 mr-1" />
              {questionCount} questions
            </span>
            <span className="flex items-center">
              <Trophy className="w-3 h-3 mr-1" />
              {quiz.xpReward || 10} XP
            </span>
          </div>
          <Link href={`/quiz/${quiz.id}`}>
            <Button 
              size="sm" 
              className="bg-electric-blue hover:bg-electric-blue/80 transition-colors"
            >
              <Brain className="w-3 h-3 mr-1" />
              Start
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}