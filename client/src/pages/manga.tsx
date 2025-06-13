
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen, Download, Eye, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mangaApi } from "@/lib/api";
import { motion } from "framer-motion";

export default function MangaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"browse" | "search">("browse");
  const [selectedManga, setSelectedManga] = useState<any>(null);

  // Fetch manga data
  const { data: mangas = [], isLoading } = useQuery<any[]>({
    queryKey: searchMode === "search" ? ['/api/manga/search', searchTerm] : ['/api/manga'],
    enabled: searchMode === "browse" || (searchMode === "search" && searchTerm.length > 0),
  });

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
    // Navigation vers le lecteur de chapitre
    window.open(`/manga/chapter/${chapter.mangadxId || chapter.id}/read`, '_blank');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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

          <div className="space-y-4">
            {mangas.map((manga, index) => (
              <motion.div
                key={manga.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedManga?.id === manga.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleMangaSelect(manga)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={manga.imageUrl || '/placeholder-manga.jpg'}
                        alt={manga.title}
                        className="w-16 h-20 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-manga.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{manga.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {manga.synopsis}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {manga.score && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {manga.score}
                            </Badge>
                          )}
                          {manga.status && (
                            <Badge variant="outline">
                              {manga.status}
                            </Badge>
                          )}
                          {manga.chapters && (
                            <Badge variant="secondary">
                              {manga.chapters} chapitres
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
    </div>
  );
}
