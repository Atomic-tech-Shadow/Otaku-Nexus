import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Users, Star } from "lucide-react";
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
    createdAt?: string;
  };
  featured?: boolean;
}

const difficultyColors = {
  easy: "bg-green-500/20 text-green-300 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function QuizCard({ quiz, featured = false }: QuizCardProps) {
  const getQuestionCount = () => {
    try {
      if (Array.isArray(quiz.questions)) {
        return quiz.questions.length;
      }
      if (typeof quiz.questions === 'string') {
        const parsed = JSON.parse(quiz.questions);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const questionCount = getQuestionCount();

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300 border-slate-700/50 hover:border-electric-blue/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-white line-clamp-2">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {quiz.description}
              </p>
            )}
          </div>
          <Badge 
            className={cn(
              "ml-3 flex-shrink-0",
              difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.medium
            )}
          >
            {quiz.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{questionCount} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>{quiz.xpReward || 10} XP</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3" />
              <span>Populaire</span>
            </div>
          </div>
          
          <Link href={`/quiz/${quiz.id}`}>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-electric-blue to-otaku-purple hover:from-electric-blue/80 hover:to-otaku-purple/80 text-white border-0"
            >
              Commencer
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}