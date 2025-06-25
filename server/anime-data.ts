// Données authentiques d'animes pour l'API locale
export const animeDatabase = [
  {
    id: 'one-piece',
    title: 'One Piece',
    description: 'Les aventures de Monkey D. Luffy et de son équipage de pirates à la recherche du trésor légendaire "One Piece".',
    image: 'https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/one-piece.jpg',
    genres: ['Action', 'Aventure', 'Comédie', 'Drame'],
    status: 'En cours',
    year: '1999',
    type: 'Anime',
    url: 'https://anime-sama.fr/catalogue/one-piece/',
    languages: ['VF', 'VOSTFR'],
    totalEpisodes: 1100,
    seasons: [
      {
        number: 1,
        name: 'East Blue',
        languages: ['VF', 'VOSTFR'],
        episodeCount: 61,
        url: 'https://anime-sama.fr/catalogue/one-piece/saison1/'
      },
      {
        number: 2,
        name: 'Alabasta',
        languages: ['VF', 'VOSTFR'],
        episodeCount: 74,
        url: 'https://anime-sama.fr/catalogue/one-piece/saison2/'
      }
    ],
    authentic: true
  },
  {
    id: 'naruto',
    title: 'Naruto',
    description: 'L\'histoire d\'un jeune ninja nommé Naruto Uzumaki qui rêve de devenir Hokage.',
    image: 'https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/naruto.jpg',
    genres: ['Action', 'Aventure', 'Arts martiaux', 'Ninja'],
    status: 'Terminé',
    year: '2002',
    type: 'Anime',
    url: 'https://anime-sama.fr/catalogue/naruto/',
    languages: ['VF', 'VOSTFR'],
    totalEpisodes: 220,
    seasons: [
      {
        number: 1,
        name: 'Naruto',
        languages: ['VF', 'VOSTFR'],
        episodeCount: 220,
        url: 'https://anime-sama.fr/catalogue/naruto/saison1/'
      }
    ],
    authentic: true
  },
  {
    id: 'demon-slayer-kimetsu-no-yaiba',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    description: 'Tanjiro Kamado se bat contre les démons pour sauver sa sœur transformée.',
    image: 'https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/demon-slayer-kimetsu-no-yaiba.jpg',
    genres: ['Action', 'Surnaturel', 'Démons'],
    status: 'En cours',
    year: '2019',
    type: 'Anime',
    url: 'https://anime-sama.fr/catalogue/demon-slayer/',
    languages: ['VF', 'VOSTFR'],
    totalEpisodes: 44,
    seasons: [
      {
        number: 1,
        name: 'Demon Slayer',
        languages: ['VF', 'VOSTFR'],
        episodeCount: 26,
        url: 'https://anime-sama.fr/catalogue/demon-slayer/saison1/'
      }
    ],
    authentic: true
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan',
    description: 'L\'humanité lutte pour sa survie contre des géants mangeurs d\'hommes.',
    image: 'https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/attack-on-titan.jpg',
    genres: ['Action', 'Drame', 'Fantastique'],
    status: 'Terminé',
    year: '2013',
    type: 'Anime',
    url: 'https://anime-sama.fr/catalogue/attack-on-titan/',
    languages: ['VF', 'VOSTFR'],
    totalEpisodes: 87,
    seasons: [
      {
        number: 1,
        name: 'Saison 1',
        languages: ['VF', 'VOSTFR'],
        episodeCount: 25,
        url: 'https://anime-sama.fr/catalogue/attack-on-titan/saison1/'
      }
    ],
    authentic: true
  },
  {
    id: 'my-hero-academia',
    title: 'My Hero Academia',
    description: 'Dans un monde où 80% de la population a des super-pouvoirs, Izuku Midoriya rêve de devenir un héros.',
    image: 'https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/my-hero-academia.jpg',
    genres: ['Action', 'Super-héros', 'École'],
    status: 'En cours',
    year: '2016',
    type: 'Anime',
    url: 'https://anime-sama.fr/catalogue/my-hero-academia/',
    languages: ['VF', 'VOSTFR'],
    totalEpisodes: 138,
    seasons: [
      {
        number: 1,
        name: 'Saison 1',
        languages: ['VF', 'VOSTFR'],
        episodeCount: 13,
        url: 'https://anime-sama.fr/catalogue/my-hero-academia/saison1/'
      }
    ],
    authentic: true
  },
  {
    id: 'dragon-ball-z',
    title: 'Dragon Ball Z',
    description: 'Goku et ses amis défendent la Terre contre des menaces extraterrestres.',
    image: 'https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/dragon-ball-z.jpg',
    genres: ['Action', 'Aventure', 'Arts martiaux'],
    status: 'Terminé',
    year: '1989',
    type: 'Anime',
    url: 'https://anime-sama.fr/catalogue/dragon-ball-z/',
    languages: ['VF', 'VOSTFR'],
    totalEpisodes: 291,
    seasons: [
      {
        number: 1,
        name: 'Dragon Ball Z',
        languages: ['VF', 'VOSTFR'],
        episodeCount: 291,
        url: 'https://anime-sama.fr/catalogue/dragon-ball-z/saison1/'
      }
    ],
    authentic: true
  }
];

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