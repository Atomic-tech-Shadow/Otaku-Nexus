
import React from 'react';
import { Link } from 'wouter';
import { Home } from 'lucide-react';

export default function AnimeSama() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Fonctionnalité désactivée
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          La section Anime-Sama a été supprimée de l'application.
        </p>
        <Link href="/">
          <button className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Home size={20} />
            Retourner à l'accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
