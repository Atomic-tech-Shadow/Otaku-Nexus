import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen, Download, Eye, Star, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mangaApi } from "@/lib/api";
import { motion } from "framer-motion";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";

export default function MangaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"browse" | "search">("browse");
  const [selectedManga, setSelectedManga] = useState<any>(null);
  const [mangas, setMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch manga data
  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: searchMode === "search" ? ['/api/manga/search', searchTerm] : [],
    queryFn: () => mangaApi.search(searchTerm),
    enabled: searchMode === "search" && searchTerm.length > 0,
  });

  useEffect(() => {
    const fetchMangas = async () => {
      setLoading(true);
      try {
        const [popular, latest] = await Promise.all([
          mangaApi.getPopular(10),
          mangaApi.getLatest(10)
        ]);

        // Combiner les mangas populaires et récents
        const combinedMangas = [...popular, ...latest];

        // Supprimer les doublons basés sur l'ID
        const uniqueMangas = combinedMangas.filter((manga, index, self) => 
          index === self.findIndex(m => m.id === manga.id)
        );

        setMangas(uniqueMangas);
      } catch (error) {
        console.error("Erreur lors du chargement des mangas:", error);
        // Fallback vers l'API générale si les nouvelles routes échouent
        try {
          const response = await mangaApi.getAll(20);
          setMangas(response);
        } catch (fallbackError) {
          console.error("Erreur fallback:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, []);


  // Fetch chapters for selected manga
  const { data: chapters = [] } = useQuery<any[]>({
    queryKey: ['/api/manga/chapters', selectedManga?.id],
    enabled: !!selectedManga,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchMode(value.length > 0 ? "search" : "browse");
  };

  const handleMangaSelect = (manga: any) => {
    setSelectedManga(manga);
  };

  const handleChapterRead = (chapter: any) => {
    // Navigation vers le lecteur de chapitre avec l'ID du manga
    const mangaId = selectedManga?.id || selectedManga?.mangaDxId;
    window.open(`/manga/chapter/${chapter.id}/read?mangaId=${mangaId}`, '_blank');
  };

  const handleChapterDownload = async (chapter: any) => {
    try {
      await mangaApi.downloadChapter(chapter.id);
      // Afficher notification de succès
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      // Afficher notification d'erreur
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const MangaCard = ({ manga }: { manga: any }) => (
    <div key={manga.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={manga.imageUrl || manga.coverArt || "/placeholder-manga.jpg"}
          alt={manga.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-manga.jpg";
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
          {manga.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{manga.status}</span>
          {manga.year && <span>{manga.year}</span>}
        </div>
        {manga.score && (
          <div className="flex items-center mt-1">
            <Star className="h-3 w-3 text-yellow-400 mr-1" />
            <span className="text-xs text-gray-300">{manga.score}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      <div className="relative z-10">
        <AppHeader />
        
        <main className="px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-8">
        {/* Liste des mangas */}
        <div className="lg:w-1/2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📚 Scan Manga
            </h1>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher un manga..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {searchMode === 'search' && searchTerm.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchResults.map((manga: any) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          ) : (
            <div>
              {/* Section Mangas Populaires */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                  Mangas Populaires
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mangas.slice(0, 10).map((manga: any) => (
                    <MangaCard key={`popular-${manga.id}`} manga={manga} />
                  ))}
                </div>
              </div>

              {/* Section Derniers Mangas */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Derniers Mangas
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mangas.slice(10, 20).map((manga: any) => (
                    <MangaCard key={`latest-${manga.id}`} manga={manga} />
                  ))}
                </div>
              </div>

              {/* Tous les Mangas */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                  Tous les Mangas
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mangas.map((manga: any) => (
                    <MangaCard key={`all-${manga.id}`} manga={manga} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Détails du manga et chapitres */}
        <div className="lg:w-1/2">
          {selectedManga ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedManga.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <img
                      src={selectedManga.imageUrl || '/placeholder-manga.jpg'}
                      alt={selectedManga.title}
                      className="w-24 h-32 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-3">
                        {selectedManga.synopsis}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Score: {selectedManga.score || 'N/A'}</div>
                        <div>Statut: {selectedManga.status || 'N/A'}</div>
                        <div>Année: {selectedManga.year || 'N/A'}</div>
                        <div>Type: {selectedManga.type || 'Manga'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chapitres disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            Chapitre {chapter.chapterNumber}
                            {chapter.title && `: ${chapter.title}`}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {chapter.pages} pages • {chapter.translatedLanguage?.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChapterRead(chapter)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Lire
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleChapterDownload(chapter)}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            DL
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <CardContent>
                <div className="text-center text-gray-500">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Sélectionnez un manga pour voir les détails et chapitres</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </main>
        
        <BottomNavigation />
      </div>
    </div>
  );
}