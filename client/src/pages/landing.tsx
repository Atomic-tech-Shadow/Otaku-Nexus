import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Brain, Search, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-20 h-20 bg-otaku-purple rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient">
            Otaku Nexus
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            The Ultimate Anime Experience
          </p>
          <p className="text-gray-400 max-w-md mx-auto">
            Explore anime, test your knowledge with quizzes, watch AMVs, and connect with fellow otakus in one amazing app.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-12 w-full max-w-md">
          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-4 text-center">
              <Search className="w-8 h-8 text-electric-blue mx-auto mb-2" />
              <h3 className="text-sm font-semibold mb-1">Explore Anime</h3>
              <p className="text-xs text-gray-400">Discover new series and manage your watchlist</p>
            </CardContent>
          </Card>

          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 text-hot-pink mx-auto mb-2" />
              <h3 className="text-sm font-semibold mb-1">Take Quizzes</h3>
              <p className="text-xs text-gray-400">Test your otaku knowledge and earn XP</p>
            </CardContent>
          </Card>

          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-4 text-center">
              <Play className="w-8 h-8 text-otaku-purple mx-auto mb-2" />
              <h3 className="text-sm font-semibold mb-1">Watch Videos</h3>
              <p className="text-xs text-gray-400">AMVs, openings, and anime content</p>
            </CardContent>
          </Card>

          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-anime-red mx-auto mb-2" />
              <h3 className="text-sm font-semibold mb-1">Level Up</h3>
              <p className="text-xs text-gray-400">Gain XP, unlock badges, and rank up</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-electric-blue to-hot-pink hover:from-hot-pink hover:to-otaku-purple text-white font-semibold px-8 py-3 rounded-xl animate-glow btn-hover"
            onClick={() => window.location.href = '/api/login'}
          >
            Enter the Otaku World
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Join thousands of anime fans worldwide
          </p>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-gray-500">
            Your journey into the anime universe starts here
          </p>
        </div>
      </div>
    </div>
  );
}
