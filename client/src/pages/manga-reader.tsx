import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Download, 
  Bookmark,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Home,
  List,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ChapterPage {
  pageNumber: number;
  imageUrl: string;
  imageUrlSaver: string;
}

interface Chapter {
  id: string;
  title?: string;
  chapter: string;
  volume?: string;
  translatedLanguage: string;
  publishAt: string;
  pages: number;
  mangaId: string;
}

interface ReaderSettings {
  readingMode: 'single' | 'double' | 'webtoon';
  imageQuality: 'high' | 'low';
  zoomLevel: number;
  fitToWidth: boolean;
  backgroundColor: string;
}

export default function MangaReader() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    readingMode: 'single',
    imageQuality: 'high',
    zoomLevel: 100,
    fitToWidth: true,
    backgroundColor: '#1a1a1a'
  });

  // Récupérer l'ID du manga depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const mangaId = urlParams.get('mangaId');

  // Récupérer les pages du chapitre
  const { data: chapterData, isLoading, error } = useQuery<{
    pages: ChapterPage[];
    baseUrl: string;
    hash: string;
    totalPages: number;
  }>({
    queryKey: ['/api/manga/chapter', chapterId, 'pages'],
    enabled: !!chapterId,
  });

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ['/api/manga', mangaId, 'chapters'],
    enabled: !!mangaId,
  });

  const currentChapterIndex = chapters.findIndex(ch => ch.id === chapterId);
  const nextChapter = chapters[currentChapterIndex + 1];
  const prevChapter = chapters[currentChapterIndex - 1];

  // Navigation par clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault();
        nextPage();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      } else if (e.code === 'Escape') {
        setShowUI(!showUI);
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, chapterData, showUI]);

  // Masquer l'UI automatiquement
  useEffect(() => {
    if (!showUI) return;
    
    const timer = setTimeout(() => {
      setShowUI(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showUI, currentPage]);

  const nextPage = useCallback(() => {
    if (!chapterData) return;
    
    if (currentPage < chapterData.totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (nextChapter) {
      navigate(`/manga/chapter/${nextChapter.id}/read`);
    }
  }, [currentPage, chapterData, nextChapter, navigate]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (prevChapter) {
      navigate(`/manga/chapter/${prevChapter.id}/read`);
    }
  }, [currentPage, prevChapter, navigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadChapter = async () => {
    try {
      toast({
        title: "Téléchargement démarré",
        description: "Le téléchargement du chapitre a commencé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le chapitre.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !chapterData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <p className="mb-4">Impossible de charger les pages du chapitre.</p>
          <Button onClick={() => navigate('/manga')}>
            <Home className="h-4 w-4 mr-2" />
            Retour aux mangas
          </Button>
        </div>
      </div>
    );
  }

  const currentPageData = chapterData.pages[currentPage - 1];
  const imageUrl = settings.imageQuality === 'high' ? currentPageData?.imageUrl : currentPageData?.imageUrlSaver;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: settings.backgroundColor }}
      onClick={() => setShowUI(!showUI)}
    >
      {/* Interface utilisateur */}
      <AnimatePresence>
        {showUI && (
          <>
            {/* Header */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md text-white p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/manga')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Accueil
                  </Button>
                  <div>
                    <h1 className="font-semibold">Chapitre {chapters[currentChapterIndex]?.chapter}</h1>
                    <p className="text-sm text-gray-400">
                      {chapters[currentChapterIndex]?.title}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadChapter}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                  >
                    {showUI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Footer / Navigation */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md text-white p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1 && !prevChapter}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm">
                    Page {currentPage} / {chapterData.totalPages}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === chapterData.totalPages && !nextChapter}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full">
                <Slider
                  value={[currentPage]}
                  onValueChange={([value]) => setCurrentPage(value)}
                  max={chapterData.totalPages}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Panneau de paramètres */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-md text-white p-6 z-40 overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-4">Paramètres de lecture</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Mode de lecture</label>
                <Select 
                  value={settings.readingMode} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, readingMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Page simple</SelectItem>
                    <SelectItem value="double">Double page</SelectItem>
                    <SelectItem value="webtoon">Webtoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Qualité d'image</label>
                <Select 
                  value={settings.imageQuality} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, imageQuality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Haute qualité</SelectItem>
                    <SelectItem value="low">Économie de données</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Zoom ({settings.zoomLevel}%)
                </label>
                <Slider
                  value={[settings.zoomLevel]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, zoomLevel: value }))}
                  min={50}
                  max={200}
                  step={10}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ajuster à la largeur</label>
                <Switch
                  checked={settings.fitToWidth}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, fitToWidth: checked }))}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de lecture */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {settings.readingMode === 'single' && (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <img
              src={imageUrl}
              alt={`Page ${currentPage}`}
              className={`max-h-screen object-contain ${
                settings.fitToWidth ? 'w-full max-w-4xl' : ''
              }`}
              style={{
                transform: `scale(${settings.zoomLevel / 100})`,
                transformOrigin: 'center center'
              }}
              onError={(e) => {
                // Fallback vers l'image de sauvegarde
                (e.target as HTMLImageElement).src = currentPageData?.imageUrlSaver;
              }}
            />
          </motion.div>
        )}

        {settings.readingMode === 'double' && currentPage < chapterData.totalPages && (
          <div className="flex gap-2">
            <motion.div
              key={`${currentPage}-left`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <img
                src={imageUrl}
                alt={`Page ${currentPage}`}
                className="max-h-screen object-contain"
                style={{ transform: `scale(${settings.zoomLevel / 100})` }}
              />
            </motion.div>
            
            {currentPage + 1 <= chapterData.totalPages && (
              <motion.div
                key={`${currentPage}-right`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <img
                  src={chapterData.pages[currentPage]?.imageUrl}
                  alt={`Page ${currentPage + 1}`}
                  className="max-h-screen object-contain"
                  style={{ transform: `scale(${settings.zoomLevel / 100})` }}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Navigation par clic */}
      <div className="absolute inset-0 flex">
        <div 
          className="flex-1 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            prevPage();
          }}
        />
        <div 
          className="flex-1 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            nextPage();
          }}
        />
      </div>
    </div>
  );
}