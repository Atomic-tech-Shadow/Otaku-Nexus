# Documentation du Bug "Failed to fetch"

## Analyse du Problème

### Symptômes Observés
- **Erreur principale** : `TypeError: Failed to fetch`
- **Contexte** : Se produit lors du changement de langue VF sur One Piece
- **API Status** : L'API fonctionne parfaitement (testé manuellement avec curl)
- **Comportement** : La requête VOSTFR fonctionne, mais VF échoue systématiquement

### Logs Détaillés Observés
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

### Stack Trace Complet
```
TypeError: Failed to fetch
    at window.fetch (https://44b5b607-aac2-4cfd-811d-491d787d6ec3-00-10jwh68ajwu3o.spock.replit.dev/__replco/static/devtools/eruda/3.2.3/eruda.js:2:218642)
    at changeLanguage (https://44b5b607-aac2-4cfd-811d-491d787d6ec3-00-10jwh68ajwu3o.spock.replit.dev/src/pages/anime-sama.tsx:654:32)
    at onClick (https://44b5b607-aac2-4cfd-811d-491d787d6ec3-00-10jwh68ajwu3o.spock.replit.dev/src/pages/anime-sama.tsx:1517:30)
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

### Différences Comportementales
- **VOSTFR** : Succès systématique
- **VF** : Échec systématique avec "Failed to fetch"
- **API** : Fonctionne pour les deux langues en test manuel
- **Environnement** : Problème spécifique à Replit + JavaScript fetch

### Code Concerné
```javascript
// Ligne 882 dans changeLanguage()
const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${language}`, {
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
});
```

### URLs Testées
- **Succès** : `https://api-anime-sama.onrender.com/api/seasons?animeId=one-piece&season=11&language=vostfr`
- **Échec** : `https://api-anime-sama.onrender.com/api/seasons?animeId=one-piece&season=11&language=vf`

## Hypothèses Techniques

### 1. Restriction Environnement Replit
- Proxy interne bloquant certaines requêtes
- Limitation de connexions simultanées
- Configuration CORS spécifique

### 2. Race Condition
- Requête précédente (VOSTFR) interfère avec VF
- État JavaScript corrompu entre les appels
- Timing critique entre les requêtes

### 3. Configuration Fetch
- Headers différents selon la langue
- Cache browser interférant
- State management React problématique

## Diagnostics Possibles

### Tests à Effectuer
1. **Network Tab Analysis** : Vérifier si la requête VF apparaît dans DevTools
2. **Timing Test** : Mesurer le délai entre VOSTFR et VF
3. **Isolation Test** : Tester VF directement sans changement de langue
4. **Browser Console** : Tester fetch VF manuellement dans la console

### Points d'Investigation
- La requête VF est-elle réellement envoyée ?
- Y a-t-il une différence de timing critique ?
- Le problème persiste-t-il avec un délai entre les requêtes ?
- XMLHttpRequest fonctionne-t-il à la place de fetch ?

## État Actuel

### Tentatives de Correction
- ❌ Suppression AbortController : Échec persistant
- ❌ Gestion d'erreurs améliorée : Échec persistant
- ❌ Cache simplifié : Échec persistant

### Constantes
- ✅ API externe fonctionnelle (curl)
- ✅ VOSTFR fonctionne systématiquement
- ❌ VF échoue systématiquement en JavaScript
- ❌ "Failed to fetch" sans détails techniques

## Conclusion

Le bug "Failed to fetch" est reproductible et spécifique à :
- Environnement Replit
- Requêtes JavaScript fetch côté client
- Paramètre `language=vf` uniquement
- Contexte de changement de langue

L'API backend fonctionne parfaitement, confirmant que le problème se situe dans la couche transport JavaScript du navigateur dans l'environnement Replit.