# Corrections Techniques - Configuration Anime-Sama

## Instructions pour l'IA

IMPORTANT: Ne pas modifier la structure, les couleurs, ou le parcours utilisateur existant. 
Uniquement appliquer les corrections techniques de configuration suivantes :

---

## 🔧 1. Configuration de l'API Backend

### Service API à corriger (`server/anime-sama-api.ts`)

```typescript
class AnimeSamaService {
  private baseUrl = 'https://api-anime-sama.onrender.com';
  private cache = new Map();
  private readonly cacheConfig = {
    ttl: 900000,        // 15 minutes
    enabled: true,
    maxSize: 1000
  };
  private readonly requestConfig = {
    timeout: 60000,     // 60 secondes
    maxRetries: 3,
    retryDelay: 2000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };

  // Méthodes à implémenter exactement :
  
  async searchAnime(query: string): Promise<AnimeSamaAnime[]> {
    const cacheKey = `search:${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/api/search?query=${encodeURIComponent(query)}`;
    const data = await this.makeRequest(url);
    
    this.setCache(cacheKey, data.data || []);
    return data.data || [];
  }

  async getAnimeDetails(animeId: string): Promise<AnimeSamaAnime> {
    const cacheKey = `anime:${animeId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/api/anime/${animeId}`;
    const data = await this.makeRequest(url);
    
    this.setCache(cacheKey, data.data);
    return data.data;
  }

  async getSeasonEpisodes(animeId: string, season: number, language: string): Promise<AnimeSamaSeasonResult> {
    const cacheKey = `episodes:${animeId}:${season}:${language}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/api/seasons?animeId=${animeId}&season=${season}&language=${language.toLowerCase()}`;
    const data = await this.makeRequest(url);
    
    this.setCache(cacheKey, data.data);
    return data.data;
  }

  async getEpisodeDetails(episodeId: string): Promise<AnimeSamaEpisodeDetail> {
    const cacheKey = `episode:${episodeId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/api/episode/${episodeId}`;
    const data = await this.makeRequest(url);
    
    this.setCache(cacheKey, data.data);
    return data.data;
  }

  // Méthode de requête avec retry
  private async makeRequest<T>(url: string): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.requestConfig.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestConfig.timeout);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: this.requestConfig.headers
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.requestConfig.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.requestConfig.retryDelay));
        }
      }
    }
    
    throw lastError!;
  }

  // Méthodes de cache
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheConfig.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

---

## 🛠️ 2. Routes API à ajouter (`server/routes.ts`)

```typescript
// Ajouter ces endpoints exactement :

app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, message: 'Query parameter required (min 2 chars)' });
    }
    
    const results = await animeSamaService.searchAnime(query);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in anime search:', error);
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
});

app.get('/api/trending', async (req, res) => {
  try {
    const results = await animeSamaService.getTrendingAnime();
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in trending:', error);
    res.status(500).json({ success: false, message: 'Trending failed', error: error.message });
  }
});

app.get('/api/anime/:animeId', async (req, res) => {
  try {
    const animeId = req.params.animeId;
    const anime = await animeSamaService.getAnimeDetails(animeId);
    res.json({ success: true, data: anime });
  } catch (error) {
    console.error('Error in anime details:', error);
    res.status(500).json({ success: false, message: 'Anime details failed', error: error.message });
  }
});

app.get('/api/seasons', async (req, res) => {
  try {
    const { animeId, season, language } = req.query;
    if (!animeId || !season || !language) {
      return res.status(400).json({ success: false, message: 'animeId, season, and language parameters required' });
    }
    
    const episodes = await animeSamaService.getSeasonEpisodes(
      animeId as string, 
      parseInt(season as string), 
      language as string
    );
    res.json({ success: true, data: episodes });
  } catch (error) {
    console.error('Error in season episodes:', error);
    res.status(500).json({ success: false, message: 'Season episodes failed', error: error.message });
  }
});

app.get('/api/episode/:episodeId', async (req, res) => {
  try {
    const episodeId = req.params.episodeId;
    const episode = await animeSamaService.getEpisodeDetails(episodeId);
    res.json({ success: true, data: episode });
  } catch (error) {
    console.error('Error in episode details:', error);
    res.status(500).json({ success: false, message: 'Episode details failed', error: error.message });
  }
});
```

---

## 🔧 3. Corrections techniques uniquement

### A. Correction des paramètres API
```typescript
// Corriger les appels API pour utiliser les bons paramètres
const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`); // Corriger 'q' en 'query'
```

### B. Gestion des race conditions (langue)
```typescript
// Ajouter protection anti-race condition
const [languageChangeInProgress, setLanguageChangeInProgress] = useState(false);

const handleLanguageChange = async (newLanguage: 'VF' | 'VOSTFR') => {
  if (languageChangeInProgress || newLanguage === selectedLanguage) {
    return; // Bloquer si changement en cours
  }
  setLanguageChangeInProgress(true);
  
  try {
    // Vider cache avant changement
    setEpisodes([]);
    setEpisodeDetails(null);
    await new Promise(resolve => setTimeout(resolve, 200)); // Anti-race
    setSelectedLanguage(newLanguage);
    // Recharger données
  } finally {
    setLanguageChangeInProgress(false);
  }
};
```

### C. Correction du cache par langue
```typescript
// États séparés par langue pour éviter conflits
const [episodesByLanguage, setEpisodesByLanguage] = useState<{
  VF: {[key: string]: Episode[]};
  VOSTFR: {[key: string]: Episode[]};
}>({ VF: {}, VOSTFR: {} });
```

### D. Validation des paramètres backend
```typescript
// Dans les routes, valider tous les paramètres requis
if (!animeId || !season || !language) {
  return res.status(400).json({ success: false, message: 'animeId, season, and language parameters required' });
}
```

---

## 📋 4. Types TypeScript obligatoires (si manquants)

```typescript
interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
}

interface Season {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}

interface VideoSource {
  url: string;
  embedUrl?: string;
  server: string;
  quality: string;
  language: string;
}
```

---

## ✅ 5. Points critiques - Configuration uniquement

1. **URL API fixe** : `https://api-anime-sama.onrender.com` 
2. **Paramètres corrects** : `query` (pas `q`), `animeId`, `season`, `language`
3. **Anti-race condition** : Protection changements de langue
4. **Cache par langue** : États séparés VF/VOSTFR
5. **Validation backend** : Paramètres requis
6. **Timeout requêtes** : 60 secondes
7. **Retry logic** : 3 tentatives maximum

IMPORTANT: Garder l'interface, couleurs et parcours utilisateur existants.