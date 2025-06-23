# Documentation du Bug "Failed to fetch"

## Analyse du Problème

### Symptômes Observés
- **Erreur principale** : `TypeError: Failed to fetch`
- **Contexte** : Se produit lors du changement de langue VF sur One Piece
- **API Status** : L'API fonctionne parfaitement (testé manuellement avec curl)
- **Comportement** : La requête VOSTFR fonctionne, mais VF échoue systématiquement

### Logs Détaillés
```javascript
// Succès VOSTFR
"Requesting episodes from: https://api-anime-sama.onrender.com/api/seasons?animeId=one-piece&season=11&language=vostfr"
"Episodes response status: 200"

// Échec VF
"Language change fetch failed for VF: Failed to fetch"
"API Response diagnosis for VF: {
  hasResponse: true,
  isSuccess: false, 
  hasData: true,
  hasEpisodes: true,
  isArray: true,
  episodeCount: 0,
  error: "Failed to fetch"
}"
```

### Tests API Manuels (Fonctionnels)
```bash
# Test VF - Succès ✅
curl "https://api-anime-sama.onrender.com/api/seasons?animeId=one-piece&season=11&language=vf"
# Retour: 26 épisodes VF (261-286)

# Test Episode 1087 VF - Succès ✅  
curl "https://api-anime-sama.onrender.com/api/episode/one-piece-episode-1087-vf"
# Retour: 2 serveurs vidéo disponibles
```

## Analyse Technique

### Hypothèses du Problème

#### 1. **Conflit CORS/Fetch dans Replit**
- L'environnement Replit peut avoir des restrictions spéciales
- Le fetch JavaScript peut être bloqué par des proxies internes
- Les requêtes simultanées peuvent être limitées

#### 2. **Race Condition**
- Requête VOSTFR encore en cours quand VF démarre
- AbortController qui interfère entre les requêtes
- Cache corrompu entre les langues

#### 3. **Headers ou Configuration**
- Différence subtile entre les requêtes VOSTFR et VF
- Timeout ou signal abort qui échoue spécifiquement sur VF
- Configuration fetch différente

### Code Problématique Identifié
```javascript
// Dans changeLanguage() - ligne ~885
const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${language}`, {
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  signal: controller.signal  // ← Potentiel problème ici
});
```

## Solutions Proposées

### Solution 1: Éliminer AbortController
```javascript
// Remplacer par un fetch simple
const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${language}`, {
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
  // Supprimer signal: controller.signal
});
```

### Solution 2: Délai Entre Requêtes
```javascript
// Ajouter un délai avant la requête VF
if (newLanguage === 'VF') {
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### Solution 3: Requête Alternative via Proxy Local
```javascript
// Utiliser le serveur Express comme proxy
const proxyUrl = `/api/proxy-seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${language}`;
const response = await fetch(proxyUrl);
```

### Solution 4: Fallback XMLHttpRequest
```javascript
// Fallback si fetch échoue
const makeRequest = (url, headers) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    xhr.onload = () => resolve({
      ok: xhr.status >= 200 && xhr.status < 300,
      status: xhr.status,
      json: () => Promise.resolve(JSON.parse(xhr.responseText))
    });
    xhr.onerror = () => reject(new Error('XMLHttpRequest failed'));
    xhr.send();
  });
};
```

## Tests de Diagnostic

### Test 1: Isolation de la Requête VF
```javascript
// Test direct sans cache ni AbortController
const testVF = async () => {
  try {
    const response = await fetch('https://api-anime-sama.onrender.com/api/seasons?animeId=one-piece&season=11&language=vf');
    const data = await response.json();
    console.log('Test VF direct:', data);
  } catch (err) {
    console.error('Test VF failed:', err);
  }
};
```

### Test 2: Comparaison Timing
```javascript
// Mesurer le temps entre VOSTFR et VF
console.time('VOSTFR-request');
// ... requête VOSTFR
console.timeEnd('VOSTFR-request');

console.time('VF-request'); 
// ... requête VF
console.timeEnd('VF-request');
```

### Test 3: Vérification Network Tab
- Ouvrir DevTools → Network
- Observer les requêtes pendant le changement de langue
- Vérifier si la requête VF apparaît dans l'onglet réseau

## Workarounds Temporaires

### Workaround 1: Bypass Client-Side
```javascript
// Forcer la requête côté serveur
app.get('/api/anime-sama-proxy/seasons', async (req, res) => {
  try {
    const { animeId, season, language } = req.query;
    const response = await fetch(`https://api-anime-sama.onrender.com/api/seasons?animeId=${animeId}&season=${season}&language=${language}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Workaround 2: Force Reload Page
```javascript
// En dernier recours
if (fetchError.message === 'Failed to fetch' && newLanguage === 'VF') {
  console.log('Forcing page reload for VF compatibility...');
  window.location.reload();
}
```

## Next Steps pour Investigation

1. **Tester Solution 1** (éliminer AbortController)
2. **Implémenter proxy côté serveur** si fetch client continue d'échouer  
3. **Analyser Network Tab** pour voir si la requête est réellement envoyée
4. **Tester avec XMLHttpRequest** comme fallback
5. **Vérifier les logs serveur** pour voir si la requête arrive

## Informations Environnement

- **Plateforme** : Replit
- **Framework** : React + Express
- **API Externe** : api-anime-sama.onrender.com
- **Statut API** : ✅ Fonctionnelle (vérifiée manuellement)
- **Problème** : ❌ Fetch JavaScript côté client uniquement

## Conclusion Temporaire

Le bug "Failed to fetch" est spécifique à l'environnement Replit et/ou à la configuration fetch côté client. L'API fonctionne parfaitement, le problème est dans la couche transport JavaScript. Les solutions proposées ciblent cette couche problématique.