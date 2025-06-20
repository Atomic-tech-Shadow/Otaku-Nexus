import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Play, ArrowLeft, ArrowRight, Download } from "lucide-react";
import { Link } from "wouter";

interface AnimeInfo {
  id: string;
  title: string;
  description?: string;
  image: string;
  status: string;
  genres?: string[];
  year?: string;
  type: string;
  totalEpisodes?: number;
  hasFilms?: boolean;
  hasScans?: boolean;
  correspondence?: string;
  advancement?: string;
  seasons?: AnimeSeason[];
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
}

interface AnimeSeason {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface AnimeEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}

export default function AnimeSamaPage() {
  const [selectedAnime, setSelectedAnime] = useState<AnimeInfo | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-sélectionner One Piece au chargement
  useEffect(() => {
    const onePiece: AnimeInfo = {
      id: "one-piece",
      title: "One Piece",
      image: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/one-piece.jpg",
      status: "Disponible",
      type: "anime",
      progressInfo: {
        advancement: "Aucune donnée.",
        correspondence: "Episode 1",
        totalEpisodes: 1000,
        hasFilms: true,
        hasScans: true
      }
    };
    setSelectedAnime(onePiece);
  }, []);

  // Charger les épisodes de la saison sélectionnée
  const { data: seasonEpisodes, isLoading: loadingEpisodes } = useQuery({
    queryKey: ['/api/anime', selectedAnime?.id, 'seasons', selectedSeason, 'episodes', selectedLanguage],
    queryFn: async () => {
      if (!selectedAnime?.id) return [];
      const response = await fetch(`/api/anime/${selectedAnime.id}/seasons/${selectedSeason}/episodes?language=${selectedLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch episodes');
      return response.json();
    },
    enabled: !!selectedAnime?.id,
  });

  const handleEpisodeSelect = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
  };

  const navigateEpisode = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedEpisode > 1) {
      setSelectedEpisode(selectedEpisode - 1);
    } else if (direction === 'next') {
      setSelectedEpisode(selectedEpisode + 1);
    }
  };

  if (!selectedAnime) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header avec image de fond One Piece */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={selectedAnime.image} 
          alt={selectedAnime.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-5xl font-bold mb-3">{selectedAnime.title.toUpperCase()}</h1>
          <div className="text-gray-300 text-lg space-y-1">
            <p><strong>Avancement :</strong> {selectedAnime.progressInfo?.advancement}</p>
            <p><strong>Correspondance :</strong> {selectedAnime.progressInfo?.correspondence}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Boutons d'action */}
        <div className="flex gap-4">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg">
            ⭐ Favoris
          </Button>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-6 py-3 rounded-lg">
            👁 Watchlist
          </Button>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-6 py-3 rounded-lg">
            ✓ Vu
          </Button>
        </div>

        {/* Section ANIME avec sagas */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">ANIME</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {[
              { number: 1, name: "East Blue", episodes: "1-61" },
              { number: 2, name: "Alabasta", episodes: "62-135" },
              { number: 3, name: "Île céleste", episodes: "136-206" },
              { number: 4, name: "Water Seven", episodes: "207-325" },
              { number: 5, name: "Thriller Bark", episodes: "326-384" },
              { number: 6, name: "Sabaody", episodes: "385-516" }
            ].map((saga) => (
              <Card 
                key={saga.number}
                className="bg-gray-900/80 border-gray-700 hover:bg-gray-800/80 transition-all cursor-pointer rounded-2xl overflow-hidden group"
                onClick={() => setSelectedSeason(saga.number)}
              >
                <div className="relative">
                  <img 
                    src={selectedAnime.image} 
                    alt={`Saga ${saga.number}`}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-xl">
                      Saga {saga.number} ({saga.name})
                    </h3>
                    <p className="text-gray-300 text-sm">Épisodes {saga.episodes}</p>
                  </div>
                  {selectedSeason === saga.number && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sélection de saison et épisode */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6">SAISON {selectedSeason}</h3>
          
          {/* Sélecteurs de langue */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-6 bg-red-600 rounded-sm mr-2"></div>
              <Button
                variant={selectedLanguage === 'vostfr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage('vostfr')}
                className="bg-gray-800 border-gray-600"
              >
                🇯🇵
              </Button>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-6 bg-blue-600 rounded-sm mr-2"></div>
              <Button
                variant={selectedLanguage === 'vf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage('vf')}
                className="bg-gray-800 border-gray-600"
              >
                VF
              </Button>
            </div>
          </div>

          {/* Sélecteur d'épisode */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-white text-sm font-bold mb-2">EPISODE {selectedEpisode}</label>
              <select 
                value={selectedEpisode} 
                onChange={(e) => handleEpisodeSelect(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
              >
                {Array.from({length: 50}, (_, i) => i + 1).map(ep => (
                  <option key={ep} value={ep}>Episode {ep}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-bold mb-2">LECTEUR 1</label>
              <select className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white">
                <option>Lecteur 1</option>
                <option>Lecteur 2</option>
                <option>Lecteur 3</option>
              </select>
            </div>
          </div>

          {/* Dernière sélection */}
          <p className="text-gray-400 mb-6">
            <strong>DERNIÈRE SÉLECTION :</strong> EPISODE {selectedEpisode}
          </p>

          {/* Contrôles de navigation */}
          <div className="flex justify-center gap-4 mb-6">
            <Button 
              onClick={() => navigateEpisode('prev')}
              className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 p-0"
              disabled={selectedEpisode <= 1}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button 
              onClick={() => navigateEpisode('next')}
              className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 p-0"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
            <Button className="bg-gray-700 hover:bg-gray-600 rounded-full w-12 h-12 p-0">
              <Download className="h-6 w-6" />
            </Button>
          </div>

          {/* Message d'aide */}
          <div className="text-center text-gray-400 mb-6">
            <p className="italic">Pub insistante ou vidéo indisponible ?</p>
            <p className="font-bold">Changez de lecteur.</p>
          </div>

          {/* Lecteur vidéo placeholder */}
          <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video">
            <img 
              src="https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/one-piece.jpg"
              alt="One Piece Player"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Link href={`/watch/one-piece-episode-${selectedEpisode}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-full w-20 h-20 p-0">
                  <Play className="h-10 w-10 text-white" fill="white" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}