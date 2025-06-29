import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import LoadingSpinner from '@/components/ui/loading-spinner';

const AnimePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulation d'un chargement
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-2">Erreur de chargement</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen text-white">
        {/* Header avec navigation */}
        <div className="glass-morphism rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-nexus-cyan mb-2">Lecteur Anime</h1>
              <Link href={`/anime/${id}`} className="text-gray-400 hover:text-nexus-cyan transition-colors">
                ← Retour à l'anime
              </Link>
            </div>
          </div>
        </div>

        {/* Contenu du lecteur */}
        <div className="glass-morphism rounded-2xl p-6">
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Lecteur Anime</h3>
              <p className="text-gray-400">
                Fonctionnalité de lecteur anime en cours de développement
              </p>
            </div>
          </div>

          {/* Contrôles et informations */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-nexus-cyan mb-2">Informations</h4>
              <p className="text-gray-300">
                Cette page utilise maintenant le layout principal avec la navigation intégrée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnimePlayerPage;