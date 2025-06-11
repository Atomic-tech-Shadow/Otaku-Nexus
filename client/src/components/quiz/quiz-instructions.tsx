import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Target, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizInstructionsProps {
  quiz: {
    title: string;
    description?: string;
    difficulty: string;
    xpReward?: number;
  };
  questionCount: number;
  onStart: () => void;
  isLoading?: boolean;
}

const difficultyColors = {
  easy: "bg-green-500/20 text-green-300 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function QuizInstructions({ quiz, questionCount, onStart, isLoading }: QuizInstructionsProps) {
  const estimatedTime = Math.ceil(questionCount * 1); // 1 minute per question

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-electric-blue to-otaku-purple flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <Badge 
              className={cn(
                difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.medium
              )}
            >
              {quiz.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            {quiz.title}
          </CardTitle>
          {quiz.description && (
            <p className="text-gray-400 text-base">
              {quiz.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-electric-blue" />
              </div>
              <div className="text-2xl font-bold text-white">{questionCount}</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-electric-blue" />
              </div>
              <div className="text-2xl font-bold text-white">{estimatedTime}</div>
              <div className="text-sm text-gray-400">Minutes</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-electric-blue" />
              </div>
              <div className="text-2xl font-bold text-white">{quiz.xpReward || 10}</div>
              <div className="text-sm text-gray-400">XP Max</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-electric-blue" />
              Instructions
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-electric-blue/20 text-electric-blue flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <span>Vous avez <strong>{estimatedTime} minutes</strong> pour répondre à toutes les questions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-electric-blue/20 text-electric-blue flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <span>Chaque question a <strong>une seule bonne réponse</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-electric-blue/20 text-electric-blue flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <span>Vous pouvez naviguer entre les questions et modifier vos réponses</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-electric-blue/20 text-electric-blue flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                <span>Plus vous répondez correctement, plus vous gagnez d'XP</span>
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <div className="pt-4 border-t border-slate-700/50">
            <Button 
              onClick={onStart}
              disabled={isLoading || questionCount === 0}
              className="w-full h-12 bg-gradient-to-r from-electric-blue to-otaku-purple hover:from-electric-blue/80 hover:to-otaku-purple/80 text-white font-semibold text-lg border-0"
            >
              {isLoading ? "Chargement..." : "Commencer le Quiz"}
            </Button>
            {questionCount === 0 && (
              <p className="text-center text-red-400 text-sm mt-2">
                Aucune question disponible pour ce quiz
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}