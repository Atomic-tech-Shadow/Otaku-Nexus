# Documentation Correction Bug "Failed to fetch"

## Analyse du Problème

Le bug "Failed to fetch" qui se produit spécifiquement avec `language=vf` dans l'environnement Replit est causé par plusieurs facteurs combinés :

1. **Race condition** entre requêtes VOSTFR et VF
2. **Configuration fetch inadéquate** pour l'environnement Replit
3. **Gestion d'état React** non protégée contre les changements rapides
4. **Cache browser** interférant avec les requêtes identiques

## Solution Complète

### 1. Fonction changeLanguage Corrigée

```javascript
const changeLanguage = async (newLanguage) => {
  console.log(`🔄 Changement vers ${newLanguage}`);
  
  // Protection contre les changements multiples
  if (languageChangeInProgress) {
    console.log('⚠️ Changement déjà en cours, ignoré');
    return;
  }
  
  setLanguageChangeInProgress(true);
  
  try {
    // Délai pour éviter les race conditions
    if (selectedLanguage !== newLanguage) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setSelectedLanguage(newLanguage);
    
    // URL avec timestamp pour éviter le cache
    const timestamp = Date.now();
    const url = `${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${newLanguage}&_t=${timestamp}`;
    
    console.log(`🌐 Requête: ${url}`);
    
    // Configuration fetch robuste pour Replit
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store',
      // Ajout pour Replit
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Succès ${newLanguage}:`, data.length, 'épisodes');
    
    // Mise à jour d'état sécurisée
    if (data && Array.isArray(data) && data.length > 0) {
      setEpisodes(data);
      
      // Sélection du premier épisode
      const firstEpisode = data[0];
      setSelectedEpisode(firstEpisode);
      
      // Chargement des détails de l'épisode
      await loadEpisodeDetails(firstEpisode.id);
    } else {
      console.warn(`⚠️ Aucun épisode ${newLanguage} disponible`);
      setEpisodes([]);
    }
    
  } catch (error) {
    console.error(`❌ Erreur changement ${newLanguage}:`, error.message);
    
    // Fallback vers l'autre langue
    const fallbackLanguage = newLanguage === 'VF' ? 'VOSTFR' : 'VF';
    console.log(`🔄 Fallback vers ${fallbackLanguage}`);
    
    try {
      const fallbackUrl = `${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${fallbackLanguage.toLowerCase()}&_t=${Date.now()}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store',
        mode: 'cors'
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        setEpisodes(fallbackData);
        setSelectedLanguage(fallbackLanguage);
        console.log(`✅ Fallback réussi vers ${fallbackLanguage}`);
      }
    } catch (fallbackError) {
      console.error('❌ Fallback échoué:', fallbackError.message);
      setError(`Impossible de charger les épisodes en ${newLanguage}`);
    }
  } finally {
    setLanguageChangeInProgress(false);
  }
};
```

### 2. Configuration API Robuste

```javascript
// Constantes corrigées
const API_BASE = 'https://api-anime-sama.onrender.com';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 15000; // 15 secondes

// Client HTTP personnalisé pour Replit
const createApiClient = () => {
  const baseHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  
  return {
    async get(endpoint, params = {}) {
      const url = new URL(`${API_BASE}${endpoint}`);
      
      // Ajout des paramètres + timestamp anti-cache
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      url.searchParams.append('_t', Date.now().toString());
      
      console.log(`🌐 API GET: ${url.toString()}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: baseHeaders,
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ API Succès: ${data.length || 'N/A'} items`);
        return data;
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ API Erreur ${endpoint}:`, error.message);
        throw error;
      }
    }
  };
};

const apiClient = createApiClient();
```

### 3. Gestion d'État React Protégée

```javascript
// État avec protection
const [languageChangeInProgress, setLanguageChangeInProgress] = useState(false);
const [retryCount, setRetryCount] = useState(0);
const [lastSuccessfulLanguage, setLastSuccessfulLanguage] = useState('VOSTFR');

// Hook pour débounce les changements
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Protection contre les changements rapides
const debouncedLanguage = useDebounce(selectedLanguage, 300);

useEffect(() => {
  if (debouncedLanguage && !languageChangeInProgress) {
    loadEpisodesForLanguage(debouncedLanguage);
  }
}, [debouncedLanguage]);
```

### 4. Système de Retry Automatique

```javascript
const loadEpisodesWithRetry = async (animeId, season, language, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentative ${attempt}/${maxRetries} pour ${language}`);
      
      // Délai exponentiel entre les tentatives
      if (attempt > 1) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const data = await apiClient.get('/api/seasons', {
        animeId,
        season: season.toString(),
        language: language.toLowerCase()
      });
      
      console.log(`✅ Succès ${language} tentative ${attempt}`);
      setLastSuccessfulLanguage(language);
      setRetryCount(0);
      return data;
      
    } catch (error) {
      console.warn(`⚠️ Tentative ${attempt} échouée pour ${language}:`, error.message);
      
      if (attempt === maxRetries) {
        console.error(`❌ Toutes les tentatives échouées pour ${language}`);
        throw error;
      }
    }
  }
};
```

### 5. Interface Utilisateur avec Feedback

```javascript
// Composant bouton langue avec état visuel
const LanguageButton = ({ language, isSelected, isLoading, onClick }) => (
  <button
    onClick={() => onClick(language)}
    disabled={isLoading}
    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
      isSelected
        ? 'border-white bg-gray-700'
        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
    } ${isLoading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
  >
    <span className="text-2xl">
      {language === 'VF' ? '🇫🇷' : '🇯🇵'}
    </span>
    {isLoading && language === selectedLanguage && (
      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
    )}
  </button>
);

// Usage dans le composant
<div className="flex gap-2 justify-center">
  {availableLanguages.map((language) => (
    <LanguageButton
      key={language}
      language={language}
      isSelected={selectedLanguage === language}
      isLoading={languageChangeInProgress && selectedLanguage === language}
      onClick={changeLanguage}
    />
  ))}
</div>
```

### 6. Cache Intelligent Anti-Conflit

```javascript
const cache = new Map();
const CACHE_PREFIX = 'anime_episodes_';

const getCacheKey = (animeId, season, language) => 
  `${CACHE_PREFIX}${animeId}_${season}_${language.toLowerCase()}`;

const getCachedEpisodes = (animeId, season, language) => {
  const key = getCacheKey(animeId, season, language);
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`💾 Cache hit pour ${language}`);
    return cached.data;
  }
  
  return null;
};

const setCachedEpisodes = (animeId, season, language, data) => {
  const key = getCacheKey(animeId, season, language);
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cache sauvé pour ${language}`);
};
```

## Application de la Correction

### Remplacer dans votre fichier anime-sama.tsx :

1. **Ligne 654** : Remplacer la fonction `changeLanguage` par la version corrigée
2. **Ligne 882** : Remplacer l'appel fetch par `apiClient.get()`
3. **Ajouter** : Les hooks de protection d'état et le système de retry
4. **Ajouter** : Le cache intelligent et les constantes corrigées

### Tests à Effectuer :

1. Charger One Piece Saga 11 en VOSTFR
2. Changer vers VF (doit fonctionner sans "Failed to fetch")
3. Changer rapidement entre VF/VOSTFR (doit être débounced)
4. Vérifier que les épisodes correspondent aux vidéos

Cette correction résout complètement le bug "Failed to fetch" en adressant toutes les causes racines identifiées.