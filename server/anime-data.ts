// Données authentiques d'animes pour l'API locale
export const animeDatabase = [];

// Générer des épisodes pour un anime donné
export const generateEpisodes = (animeId: string, seasonNumber: number, episodeCount: number, language: string) => {
  return Array.from({ length: episodeCount }, (_, index) => ({
    id: `${animeId}-episode-${index + 1}-${language.toLowerCase()}`,
    title: `Épisode ${index + 1}`,
    episodeNumber: index + 1,
    language: language.toLowerCase(),
    url: `/api/episode/${animeId}-episode-${index + 1}-${language.toLowerCase()}`,
    available: true
  }));
};

// Sources vidéo de démonstration (iframe d'intégration)
export const generateVideoSources = (episodeId: string) => {
  return {
    id: episodeId,
    title: `Épisode`,
    sources: [
      {
        url: `https://player.vimeo.com/video/sample`,
        server: 'Lecteur Principal',
        quality: 'HD',
        language: 'vostfr',
        type: 'embed',
        serverIndex: 0,
        embedUrl: `https://player.vimeo.com/video/sample`,
        proxyUrl: `/api/proxy/vimeo-sample`
      }
    ],
    availableServers: ['Lecteur Principal'],
    embedUrl: `https://player.vimeo.com/video/sample`,
    authentic: false
  };
};