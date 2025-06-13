
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Settings,
  BookOpen,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { mangaApi } from "@/lib/api";

export default function MangaReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fitToWidth, setFitToWidth] = useState(true);
  const [readingDirection, setReadingDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [showSettings, setShowSettings] = useState(false);

  // Fetch chapter pages
  const { data: chapterData, isLoading } = useQuery({
    queryKey: ['/api/manga/chapter/pages', chapterId],
    enabled: !!chapterId,
    queryFn: () => mangaApi.getChapterPages(chapterId!),
  });

  // Update reading progress
  const updateProgressMutation = useMutation({
    mutationFn: (progress: any) => mangaApi.updateProgress(progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manga/progress'] });
    },
  });

  const pages = chapterData?.pages || [];
  const totalPages = pages.length;

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        handlePreviousPage();
        break;
      case 'ArrowRight':
        handleNextPage();
        break;
      case 'Escape':
        navigate(-1);
        break;
    }
  }, [currentPage, totalPages, readingDirection]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update reading progress when page changes
  useEffect(() => {
    if (chapterData?.chapter && currentPage > 0) {
      updateProgressMutation.mutate({
        mangaId: chapterData.chapter.mangaId,
        lastChapterId: chapterData.chapter.id,
        lastPageNumber: currentPage,
      });
    }
  }, [currentPage, chapterData]);

  const handlePreviousPage = () => {
    if (readingDirection === 'ltr') {
      setCurrentPage(prev => Math.max(1, prev - 1));
    } else {
      setCurrentPage(prev => Math.min(totalPages, prev + 1));
    }
  };

  const handleNextPage = () => {
    if (readingDirection === 'ltr') {
      setCurrentPage(prev => Math.min(totalPages, prev + 1));
    } else {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  const handlePageClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    
    // Click on left side = previous page, right side = next page
    if (clickX < width / 3) {
      handlePreviousPage();
    } else if (clickX > (2 * width) / 3) {
      handleNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!chapterData || pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Card className="p-8 bg-gray-900 border-gray-700">
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Chapitre non trouvé</h2>
            <p className="text-gray-400 mb-4">
              Impossible de charger les pages de ce chapitre.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
              Retour
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentPageData = pages[currentPage - 1];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="text-sm">
            <h1 className="font-semibold">
              Chapitre {chapterData.chapter.chapterNumber}
              {chapterData.chapter.title && `: ${chapterData.chapter.title}`}
            </h1>
            <p className="text-gray-400">
              Page {currentPage} sur {totalPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ajuster à la largeur</span>
              <Switch
                checked={fitToWidth}
                onCheckedChange={setFitToWidth}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Sens de lecture RTL</span>
              <Switch
                checked={readingDirection === 'rtl'}
                onCheckedChange={(checked) => setReadingDirection(checked ? 'rtl' : 'ltr')}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Zoom: {zoom}%</span>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={50}
                max={200}
                step={10}
                className="flex-1"
                disabled={fitToWidth}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reader */}
      <div className="flex-1 relative overflow-auto">
        <div 
          className="min-h-full flex items-center justify-center cursor-pointer"
          onClick={handlePageClick}
        >
          {currentPageData && (
            <img
              src={currentPageData.imageUrl}
              alt={`Page ${currentPage}`}
              className={`max-h-full ${
                fitToWidth ? 'w-full' : `w-auto`
              }`}
              style={!fitToWidth ? { 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center'
              } : {}}
              onError={(e) => {
                // Fallback to data-saver version
                if (currentPageData.imageUrlSaver) {
                  (e.target as HTMLImageElement).src = currentPageData.imageUrlSaver;
                }
              }}
            />
          )}
        </div>

        {/* Navigation Overlay */}
        <div className="absolute inset-0 flex">
          <div 
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-20 bg-blue-500 transition-opacity"
            onClick={handlePreviousPage}
          />
          <div className="w-1/3 h-full" />
          <div 
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-20 bg-blue-500 transition-opacity"
            onClick={handleNextPage}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPage}
            disabled={readingDirection === 'ltr' ? currentPage === 1 : currentPage === totalPages}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {readingDirection === 'ltr' ? 'Précédent' : 'Suivant'}
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            
            <Slider
              value={[currentPage]}
              onValueChange={(value) => setCurrentPage(value[0])}
              min={1}
              max={totalPages}
              step={1}
              className="w-32"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={readingDirection === 'ltr' ? currentPage === totalPages : currentPage === 1}
            className="text-white hover:bg-gray-800"
          >
            {readingDirection === 'ltr' ? 'Suivant' : 'Précédent'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
