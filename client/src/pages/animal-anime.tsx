import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Heart, Sparkles, Filter, PawPrint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimeCard } from "@/components/anime/anime-card";
import { motion } from "framer-motion";

export default function AnimalAnimePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"browse" | "search">("browse");

  // Fetch animal anime data
  const { data: animes = [], isLoading } = useQuery({
    queryKey: searchMode === "search" ? ['/api/anime/animals/search', searchTerm] : ['/api/anime/animals'],
    enabled: searchMode === "browse" || (searchMode === "search" && searchTerm.length > 0),
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchMode(value.length > 0 ? "search" : "browse");
  };

  const animalTypeColors = {
    "Dogs": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Cats": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Wolves": "bg-gray-500/20 text-gray-400 border-gray-500/30",
    "Birds": "bg-sky-500/20 text-sky-400 border-sky-500/30",
    "Rabbits": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "All Animals": "bg-green-500/20 text-green-400 border-green-500/30",
    "Magical Creatures": "bg-violet-500/20 text-violet-400 border-violet-500/30",
    "Zodiac Animals": "bg-orange-500/20 text-orange-400 border-orange-500/30"
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full animate-float"></div>
        <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-40 left-20 w-28 h-28 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="relative z-10 px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-2xl p-6 relative overflow-hidden mb-6"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full opacity-50"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                <Paw className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Anime Animaliers
              </h1>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Découvrez les meilleurs anime mettant en vedette nos amis les animaux
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                <Heart className="w-3 h-3 mr-1" />
                Spécial Amoureux des Animaux
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Créatures Magiques
              </Badge>
            </div>
          </motion.div>
        </div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des anime avec des animaux..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {searchMode === "search" ? 
                    `Recherche: "${searchTerm}"` : 
                    "Tous les anime animaliers"
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass-morphism border-pink-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-400 mb-1">{animes.length}</div>
              <div className="text-xs text-gray-400">Anime Disponibles</div>
            </CardContent>
          </Card>
          <Card className="glass-morphism border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">12</div>
              <div className="text-xs text-gray-400">Types d'Animaux</div>
            </CardContent>
          </Card>
          <Card className="glass-morphism border-blue-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">8.5</div>
              <div className="text-xs text-gray-400">Score Moyen</div>
            </CardContent>
          </Card>
          <Card className="glass-morphism border-green-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">98%</div>
              <div className="text-xs text-gray-400">Satisfaction</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Animal Types Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-morphism border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Paw className="w-5 h-5 text-pink-400" />
                Types d'Animaux Populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(animalTypeColors).map(([type, className]) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className={`${className} hover:bg-opacity-30 transition-all`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-morphism border-gray-700 animate-pulse">
                <div className="aspect-[3/4] bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Anime Grid */}
        {!isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {animes.map((anime: any, index: number) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative group">
                  <AnimeCard anime={anime} />
                  {/* Animal Types Overlay */}
                  {anime.animalTypes && anime.animalTypes.length > 0 && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="flex flex-wrap gap-1">
                        {anime.animalTypes.slice(0, 2).map((type: string) => (
                          <Badge 
                            key={type}
                            className={`text-xs ${animalTypeColors[type as keyof typeof animalTypeColors] || 'bg-gray-500/20 text-gray-400'}`}
                          >
                            {type}
                          </Badge>
                        ))}
                        {anime.animalTypes.length > 2 && (
                          <Badge className="text-xs bg-gray-500/20 text-gray-400">
                            +{anime.animalTypes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Animal Icon */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="p-1 bg-pink-500/80 rounded-full">
                      <Paw className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </animes>
        )}

        {/* Empty State */}
        {!isLoading && animes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="mb-4">
              <Paw className="w-16 h-16 text-gray-600 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Aucun anime trouvé
            </h3>
            <p className="text-gray-500">
              {searchMode === "search" 
                ? `Aucun anime animalier trouvé pour "${searchTerm}"`
                : "Aucun anime animalier disponible pour le moment"
              }
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}