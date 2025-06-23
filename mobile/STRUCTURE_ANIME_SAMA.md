# Structure Anime-Sama - Correspondance Exacte Site Web/Mobile

## 🎯 Structure Identique Confirmée

### API Endpoints (100% identiques)
```
Site Web                    Mobile
---------                   ------
/api/anime-sama/catalogue   ✅ Identique
/api/anime-sama/search      ✅ Identique  
/api/anime-sama/anime/:id   ✅ Identique
/api/anime-sama/episodes    ✅ Identique
/api/anime-sama/episode/:id ✅ Identique
```

### Interfaces TypeScript (100% identiques)
```typescript
// Site Web & Mobile - Structures identiques
interface AnimeSamaAnime {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
  description?: string;
  genres?: string[];
  year?: string;
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
}

interface AnimeSamaSeason {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface AnimeSamaEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}
```

### Fonctionnalités (100% identiques)

#### 1. Page Catalogue/Recherche
**Site Web** : anime-sama.tsx
**Mobile** : AnimeSamaScreen.tsx
- ✅ Recherche avec debounce (500ms)
- ✅ Catalogue trending/populaire
- ✅ Grille d'animes avec images
- ✅ progressInfo authentique
- ✅ Navigation vers détails

#### 2. Page Détail Anime  
**Site Web** : anime-sama.tsx (section détail)
**Mobile** : AnimeDetailScreen.tsx
- ✅ Image, titre, description, genres
- ✅ Sélection saisons dynamique
- ✅ Boutons langue VF/VOSTFR avec drapeaux
- ✅ Liste épisodes avec numérotation
- ✅ Correction One Piece (Saga 11 = 1087-1122)
- ✅ Navigation vers lecteur

#### 3. Page Lecteur Vidéo
**Site Web** : watch.tsx
**Mobile** : VideoPlayerScreen.tsx + WatchScreen.tsx
- ✅ Sélection serveurs multiples
- ✅ Sources embed/proxy
- ✅ Informations CORS
- ✅ Ouverture lecteur externe

### Logique Métier (100% identique)

#### Correction One Piece
```javascript
// EXACTEMENT le même mapping saga dans les deux versions
const sagaMapping = {
  11: 1087, // Saga 11 commence à l'épisode 1087
  10: 1000, // Saga 10 commence à l'épisode 1000
  9: 892,   // Saga 9 commence à l'épisode 892
  8: 783,   // etc...
};
```

#### Gestion Erreurs & Retry
```javascript
// Même système de retry avec délai exponentiel
retry: 3,
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
```

#### Cache Intelligent
```javascript
// Mêmes durées de cache
staleTime: 30 * 60 * 1000, // 30 minutes catalogue
staleTime: 15 * 60 * 1000, // 15 minutes épisodes
staleTime: 5 * 60 * 1000,  // 5 minutes recherche
```

### Navigation (Adaptée mais logique identique)

**Site Web** : Navigation par routes wouter
```javascript
/anime-sama → /anime/:id → /watch/:id
```

**Mobile** : Navigation stack React Navigation
```javascript
AnimeSamaMain → AnimeDetail → VideoPlayer
```

## ✅ Résultat

La structure Anime-Sama mobile est **EXACTEMENT identique** au site web :
- Mêmes APIs
- Mêmes interfaces
- Même logique métier
- Mêmes corrections (One Piece)
- Même gestion d'erreurs
- Même système de cache

La seule différence est l'interface utilisateur optimisée pour mobile avec des composants React Native au lieu de HTML/CSS, mais toute la logique sous-jacente est rigoureusement identique.