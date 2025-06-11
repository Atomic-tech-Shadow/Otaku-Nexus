import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Clock, Trophy, Target, Star, Zap } from "lucide-react";

interface QuizInstructionsProps {
  onStart: () => void;
  questionCount: number;
  xpReward: number;
  difficulty: string;
}

export default function QuizInstructions({ onStart, questionCount, xpReward, difficulty }: QuizInstructionsProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-electric-blue/20 to-hot-pink/20 border-electric-blue/50">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Brain className="w-12 h-12 electric-blue mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Comment jouer au Quiz</h2>
            <p className="text-sm text-gray-300">Suivez ces étapes simples pour commencer</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-electric-blue rounded-full flex items-center justify-center text-xs font-bold text-black">
                1
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Cliquez sur "Commencer le Quiz"</h3>
                <p className="text-xs text-gray-400">Le timer démarre dès que vous commencez</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-hot-pink rounded-full flex items-center justify-center text-xs font-bold text-black">
                2
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Lisez attentivement chaque question</h3>
                <p className="text-xs text-gray-400">Vous avez {questionCount} questions à répondre</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-otaku-purple rounded-full flex items-center justify-center text-xs font-bold text-black">
                3
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Sélectionnez votre réponse</h3>
                <p className="text-xs text-gray-400">Cliquez sur l'option que vous pensez correcte</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-anime-red rounded-full flex items-center justify-center text-xs font-bold text-black">
                4
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Passez à la question suivante</h3>
                <p className="text-xs text-gray-400">Cliquez sur "Suivant" pour continuer</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                5
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Voir vos résultats</h3>
                <p className="text-xs text-gray-400">Découvrez votre score et gagnez de l'XP</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card-bg border-gray-800">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 electric-blue mx-auto mb-2" />
            <div className="text-lg font-bold">{questionCount}</div>
            <div className="text-xs text-gray-400">Questions</div>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-gray-800">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 hot-pink mx-auto mb-2" />
            <div className="text-lg font-bold">+{xpReward}</div>
            <div className="text-xs text-gray-400">XP Maximum</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card-bg border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 otaku-purple" />
              <span className="font-semibold text-sm">Niveau de Difficulté</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {difficulty?.toUpperCase() || 'MEDIUM'}
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Temps limité : 1 minute par question</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Bonus XP : Plus vous répondez vite, plus vous gagnez</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Pas de seconde chance : Réfléchissez bien avant de répondre</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={onStart}
        className="w-full bg-gradient-to-r from-electric-blue to-hot-pink hover:from-electric-blue/80 hover:to-hot-pink/80 text-lg py-3 font-bold"
      >
        🚀 Commencer le Quiz
      </Button>
    </div>
  );
}