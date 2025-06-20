# Documentation complète API Anime-Sama
**URL de base :** `https://api-anime-sama.onrender.com`

## Table des matières
1. [Structure de réponse standardisée](#structure-de-réponse-standardisée)
2. [Endpoints disponibles avec formats exacts](#endpoints-disponibles-avec-formats-exacts)
3. [Parcours utilisateur authentique à reproduire](#parcours-utilisateur-authentique-à-reproduire)
4. [Code d'implémentation complet](#code-dimplémentation-complet)
5. [CSS pour ressembler à anime-sama.fr](#css-pour-ressembler-à-anime-samafr)

---

## Structure de réponse standardisée

Toutes les réponses suivent ce format :
```json
{
  "success": true,
  "data": { /* contenu spécifique */ },
  "timestamp": "2025-06-18T09:10:31.831Z",
  "meta": { /* métadonnées */ }
}
```

---

## Endpoints disponibles avec formats exacts

### 1. Recherche d'anime
```
GET /api/search?query={terme}
```

**Réponse exacte :**
```json
{
  "success": true,
  "data": [
    {
      "id": "naruto",
      "title": "Naruto",
      "url": "https://anime-sama.fr/catalogue/naruto/",
      "type": "anime",
      "status": "Disponible",
      "image": "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/naruto.jpg"
    }
  ],
  "meta": {
    "query": "naruto",
    "resultsCount": 1,
    "source": "anime-sama.fr"
  }
}
```

### 2. Détails complets d'un anime
```
GET /api/anime/{id}
```

**Réponse exacte :**
```json
{
  "success": true,
  "data": {
    "id": "naruto",
    "title": "Naruto",
    "description": "Description non disponible",
    "image": "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/naruto.jpg",
    "genres": ["Action", "Aventure"],
    "status": "En cours",
    "year": "2025",
    "seasons": [
      {
        "number": 1,
        "name": "Avec Fillers",
        "languages": ["VOSTFR"],
        "episodeCount": 0,
        "url": "https://anime-sama.fr/catalogue/naruto/saison1"
      },
      {
        "number": 999,
        "name": "Film",
        "languages": ["VOSTFR"],
        "episodeCount": 0,
        "url": "https://anime-sama.fr/catalogue/naruto/film"
      }
    ],
    "url": "https://anime-sama.fr/catalogue/naruto/"
  },
  "meta": {
    "animeId": "naruto",
    "source": "anime-sama.fr"
  }
}
```

**Points critiques :**
- `seasons` contient TOUTES les sections (saisons, films, OVA)
- `number: 999` = Films, `998` = OVA, `997` = Kai, etc.
- `languages` array peut contenir "VF", "VOSTFR" ou les deux

### 3. Épisodes d'une saison
```
GET /api/seasons?animeId={id}&season={number}&language={vf|vostfr}
```

**Réponse exacte :**
```json
{
  "success": true,
  "data": {
    "animeId": "naruto",
    "season": 1,
    "language": "VOSTFR",
    "episodes": [
      {
        "id": "naruto-episode-1-vostfr",
        "title": "Épisode 1",
        "episodeNumber": 1,
        "url": "https://anime-sama.fr/catalogue/naruto/saison1/vostfrepisode-1",
        "language": "VOSTFR",
        "available": true
      }
    ],
    "episodeCount": 24
  },
  "meta": {
    "animeId": "naruto",
    "season": 1,
    "language": "VOSTFR",
    "episodeCount": 24,
    "source": "anime-sama.fr"
  }
}
```

### 4. Sources de streaming d'un épisode
```
GET /api/episode/{episodeId}
```

**Format episodeId :** `{animeId}-episode-{number}-{language}`
Exemple : `naruto-episode-1-vostfr`

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "id": "naruto-episode-1-vostfr",
    "title": "Episode 1",
    "animeTitle": "Naruto",
    "episodeNumber": 1,
    "sources": [
      {
        "url": "https://...",
        "server": "Vidmoly",
        "quality": "HD",
        "language": "VOSTFR",
        "type": "iframe",
        "serverIndex": 1
      }
    ],
    "availableServers": ["Vidmoly", "SendVid", "Sibnet"],
    "url": "https://anime-sama.fr/catalogue/naruto/saison1/vostfr/episode-1"
  }
}
```

### 5. Autres endpoints disponibles

**Catalogue :**
```
GET /api/catalogue?page=1&genre=action
```

**Tendances :**
```
GET /api/trending
```

**Genres disponibles :**
```
GET /api/genres
```

**Anime aléatoire :**
```
GET /api/random
```

**Recherche avancée :**
```
GET /api/advanced-search?query=demon&genre=action&sort=year
```

---

## Parcours utilisateur authentique à reproduire

### ÉTAPE 1 : Page d'accueil (comme anime-sama.fr)

**Interface initiale :**
- Header avec logo "Anime-Sama" et menu navigation
- Barre de recherche proéminente au centre
- Sections : "Derniers ajouts", "Populaires", "Catalogue"
- Footer avec liens vers différentes sections

### ÉTAPE 2 : Recherche d'anime (comportement exact)

**Quand l'utilisateur tape dans la recherche :**
1. Suggestions automatiques pendant la frappe
2. Affichage des résultats en temps réel
3. Cartes d'anime avec image + titre + statut

### ÉTAPE 3 : Sélection d'un anime (clic sur carte)

**Comportement exact d'anime-sama.fr :**
1. Redirection vers page détaillée de l'anime
2. Affichage des informations complètes
3. **Navigation par onglets des différentes sections**

### ÉTAPE 4 : Sélection d'une section/saison

**Comportement anime-sama.fr :**
1. Clic sur onglet de saison → change le contenu
2. Sélection de langue (VF/VOSTFR) si disponible
3. Affichage de la liste des épisodes

### ÉTAPE 5 : Sélection de langue (si plusieurs disponibles)

### ÉTAPE 6 : Liste des épisodes (affichage exact)

### ÉTAPE 7 : Sélection d'un épisode (comportement authentique)

**Quand utilisateur clique sur un épisode :**
1. Redirection vers page de lecture
2. Chargement des sources de streaming
3. Sélecteur de serveur (comme anime-sama.fr)

### ÉTAPE 8 : Lecteur vidéo (interface anime-sama.fr)

---

## Code d'implémentation complet

### HTML Structure

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime-Sama</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Header comme anime-sama.fr -->
    <header class="main-header">
        <div class="container">
            <div class="logo">
                <h1>Anime-Sama</h1>
            </div>
            <nav class="main-nav">
                <a href="#catalogue">Catalogue</a>
                <a href="#trending">Populaires</a>
                <a href="#random">Aléatoire</a>
            </nav>
        </div>
    </header>

    <!-- Barre de recherche principale -->
    <section class="search-section">
        <div class="container">
            <div class="search-container">
                <input type="text" id="search-input" placeholder="Rechercher un anime...">
                <button id="search-btn">🔍</button>
            </div>
            <div id="search-results" class="search-results"></div>
        </div>
    </section>

    <!-- Contenu principal -->
    <main id="main-content">
        <!-- Page d'accueil -->
        <section id="home-page" class="page active">
            <div class="container">
                <div id="trending-section" class="content-section">
                    <h2>Anime populaires</h2>
                    <div id="trending-grid" class="anime-grid"></div>
                </div>
                
                <div id="catalogue-section" class="content-section">
                    <h2>Catalogue</h2>
                    <div id="catalogue-grid" class="anime-grid"></div>
                </div>
            </div>
        </section>

        <!-- Page détails anime -->
        <section id="anime-page" class="page">
            <div class="container">
                <!-- Navigation breadcrumb -->
                <nav class="breadcrumb">
                    <a href="#" onclick="showHome()">Accueil</a> > 
                    <span id="breadcrumb-anime"></span>
                </nav>

                <!-- Header anime -->
                <div class="anime-header">
                    <img id="anime-image" src="" alt="">
                    <div class="anime-info">
                        <h1 id="anime-title"></h1>
                        <p id="anime-description"></p>
                        <div id="anime-genres" class="genres"></div>
                        <div class="anime-meta">
                            <span id="anime-status"></span>
                            <span id="anime-year"></span>
                        </div>
                    </div>
                </div>

                <!-- Navigation saisons/sections -->
                <div id="seasons-navigation" class="seasons-nav">
                    <!-- Onglets générés dynamiquement -->
                </div>

                <!-- Sélecteur de langue -->
                <div id="language-selector" class="language-selector">
                    <button class="lang-btn active" data-lang="vostfr">VOSTFR</button>
                    <button class="lang-btn" data-lang="vf">VF</button>
                </div>

                <!-- Liste des épisodes -->
                <div id="episodes-container" class="episodes-container">
                    <div id="episodes-list" class="episodes-list"></div>
                </div>
            </div>
        </section>

        <!-- Page lecteur vidéo -->
        <section id="player-page" class="page">
            <div class="container">
                <!-- Navigation breadcrumb -->
                <nav class="breadcrumb">
                    <a href="#" onclick="showHome()">Accueil</a> > 
                    <a href="#" onclick="goBackToAnime()" id="breadcrumb-anime-link"></a> > 
                    <span id="breadcrumb-season"></span> > 
                    <span id="breadcrumb-episode"></span>
                </nav>

                <!-- Lecteur vidéo -->
                <div class="video-player-container">
                    <div class="server-selector">
                        <span>Serveur:</span>
                        <select id="server-select">
                            <!-- Options générées dynamiquement -->
                        </select>
                    </div>
                    
                    <div id="video-player-wrapper">
                        <iframe id="video-player" allowfullscreen></iframe>
                    </div>
                    
                    <div class="episode-navigation">
                        <button id="prev-episode">◀ Épisode précédent</button>
                        <button id="next-episode">Épisode suivant ▶</button>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Loading overlay -->
    <div id="loading-overlay" class="loading-overlay">
        <div class="loader"></div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### JavaScript complet

```javascript
// Configuration API
const API_BASE = 'https://api-anime-sama.onrender.com';

// Variables globales
let currentAnime = null;
let currentSeason = null;
let currentLanguage = 'vostfr';
let currentEpisodes = [];

// Utilitaires
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// API Calls
async function apiCall(endpoint) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Erreur API');
        }
        
        return data.data;
    } catch (error) {
        console.error('Erreur API:', error);
        showError('Erreur de connexion. Veuillez réessayer.');
        return null;
    } finally {
        hideLoading();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <h3>Erreur</h3>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()">Fermer</button>
    `;
    document.body.appendChild(errorDiv);
}

// Recherche d'anime
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            const results = await apiCall(`/api/search?query=${encodeURIComponent(query)}`);
            
            if (results && results.length > 0) {
                displaySearchResults(results);
            } else {
                searchResults.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
                searchResults.style.display = 'block';
            }
        }, 300);
    });

    // Cacher les résultats quand on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    
    searchResults.innerHTML = results.map(anime => `
        <div class="search-result-item" onclick="loadAnimeDetails('${anime.id}')">
            <img src="${anime.image}" alt="${anime.title}" loading="lazy">
            <div class="result-info">
                <h4>${anime.title}</h4>
                <span class="status">${anime.status}</span>
            </div>
        </div>
    `).join('');
    
    searchResults.style.display = 'block';
}

// Chargement page d'accueil
async function loadHomePage() {
    showPage('home-page');
    
    // Charger les anime populaires
    const trending = await apiCall('/api/trending');
    if (trending) {
        displayAnimeGrid('trending-grid', trending);
    }
    
    // Charger le catalogue
    const catalogue = await apiCall('/api/catalogue');
    if (catalogue) {
        displayAnimeGrid('catalogue-grid', catalogue);
    }
}

function displayAnimeGrid(containerId, animes) {
    const container = document.getElementById(containerId);
    
    container.innerHTML = animes.map(anime => `
        <div class="anime-card" onclick="loadAnimeDetails('${anime.id}')">
            <img src="${anime.image}" alt="${anime.title}" loading="lazy">
            <div class="anime-card-info">
                <h3>${anime.title}</h3>
                <span class="status">${anime.status}</span>
            </div>
        </div>
    `).join('');
}

// Chargement détails anime
async function loadAnimeDetails(animeId) {
    const animeData = await apiCall(`/api/anime/${animeId}`);
    
    if (!animeData) return;
    
    currentAnime = animeData;
    showPage('anime-page');
    
    // Remplir les informations de l'anime
    document.getElementById('anime-title').textContent = animeData.title;
    document.getElementById('anime-description').textContent = animeData.description;
    document.getElementById('anime-image').src = animeData.image;
    document.getElementById('anime-status').textContent = animeData.status;
    document.getElementById('anime-year').textContent = animeData.year;
    document.getElementById('breadcrumb-anime').textContent = animeData.title;
    
    // Afficher les genres
    const genresContainer = document.getElementById('anime-genres');
    genresContainer.innerHTML = animeData.genres.map(genre => 
        `<span class="genre-tag">${genre}</span>`
    ).join('');
    
    // Créer les onglets pour toutes les saisons/sections
    createSeasonTabs(animeData.seasons);
    
    // Charger la première saison par défaut
    if (animeData.seasons.length > 0) {
        loadSeason(animeData.seasons[0].number, animeData.seasons[0].languages[0].toLowerCase());
    }
    
    // Cacher les résultats de recherche
    document.getElementById('search-results').style.display = 'none';
}

function createSeasonTabs(seasons) {
    const seasonsNav = document.getElementById('seasons-navigation');
    
    seasonsNav.innerHTML = seasons.map(season => `
        <button class="season-tab" data-season="${season.number}" data-languages="${season.languages.join(',')}">
            ${season.name}
        </button>
    `).join('');
    
    // Activer le premier onglet
    seasonsNav.querySelector('.season-tab').classList.add('active');
    
    // Gestionnaires d'événements pour les onglets
    seasonsNav.querySelectorAll('.season-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Changer l'onglet actif
            seasonsNav.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            const seasonNumber = parseInt(e.target.dataset.season);
            const availableLanguages = e.target.dataset.languages.split(',');
            
            // Mettre à jour le sélecteur de langue
            updateLanguageSelector(availableLanguages);
            
            // Charger la saison
            loadSeason(seasonNumber, currentLanguage);
        });
    });
}

function updateLanguageSelector(availableLanguages) {
    const languageSelector = document.getElementById('language-selector');
    const langButtons = languageSelector.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        const lang = btn.dataset.lang.toUpperCase();
        if (availableLanguages.includes(lang)) {
            btn.style.display = 'inline-block';
            btn.disabled = false;
        } else {
            btn.style.display = 'none';
            btn.disabled = true;
        }
    });
    
    // Sélectionner la première langue disponible si la langue actuelle n'est pas disponible
    if (!availableLanguages.includes(currentLanguage.toUpperCase())) {
        currentLanguage = availableLanguages[0].toLowerCase();
        
        langButtons.forEach(btn => btn.classList.remove('active'));
        languageSelector.querySelector(`[data-lang="${currentLanguage}"]`).classList.add('active');
    }
    
    // Gestionnaires pour changement de langue
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.disabled) return;
            
            langButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentLanguage = e.target.dataset.lang;
            
            // Recharger les épisodes avec la nouvelle langue
            if (currentSeason) {
                loadSeason(currentSeason, currentLanguage);
            }
        });
    });
}

// Chargement épisodes d'une saison
async function loadSeason(seasonNumber, language) {
    currentSeason = seasonNumber;
    currentLanguage = language;
    
    const episodesData = await apiCall(`/api/seasons?animeId=${currentAnime.id}&season=${seasonNumber}&language=${language}`);
    
    if (!episodesData) return;
    
    currentEpisodes = episodesData.episodes;
    displayEpisodesList(episodesData.episodes);
}

function displayEpisodesList(episodes) {
    const episodesList = document.getElementById('episodes-list');
    
    episodesList.innerHTML = episodes.map(episode => `
        <div class="episode-item" onclick="loadEpisode('${episode.id}', ${episode.episodeNumber})">
            <span class="episode-number">${String(episode.episodeNumber).padStart(2, '0')}</span>
            <span class="episode-title">${episode.title}</span>
            <span class="episode-status">${episode.available ? 'Disponible' : 'Indisponible'}</span>
        </div>
    `).join('');
}

// Chargement lecteur vidéo
async function loadEpisode(episodeId, episodeNumber) {
    const episodeData = await apiCall(`/api/episode/${episodeId}`);
    
    if (!episodeData || !episodeData.sources || episodeData.sources.length === 0) {
        showError('Aucune source disponible pour cet épisode');
        return;
    }
    
    showPage('player-page');
    
    // Mettre à jour le breadcrumb
    document.getElementById('breadcrumb-anime-link').textContent = currentAnime.title;
    document.getElementById('breadcrumb-season').textContent = `Saison ${currentSeason}`;
    document.getElementById('breadcrumb-episode').textContent = `Épisode ${episodeNumber}`;
    
    // Créer le sélecteur de serveur
    createServerSelector(episodeData.sources);
    
    // Charger la première source
    loadVideoSource(episodeData.sources[0]);
    
    // Configuration navigation épisodes
    setupEpisodeNavigation(episodeNumber);
}

function createServerSelector(sources) {
    const serverSelect = document.getElementById('server-select');
    
    serverSelect.innerHTML = sources.map((source, index) => `
        <option value="${index}">
            ${source.server} (${source.quality}) - ${source.language}
        </option>
    `).join('');
    
    serverSelect.addEventListener('change', (e) => {
        const sourceIndex = parseInt(e.target.value);
        loadVideoSource(sources[sourceIndex]);
    });
}

function loadVideoSource(source) {
    const videoPlayer = document.getElementById('video-player');
    videoPlayer.src = source.url;
}

function setupEpisodeNavigation(currentEpisodeNumber) {
    const prevBtn = document.getElementById('prev-episode');
    const nextBtn = document.getElementById('next-episode');
    
    // Épisode précédent
    const prevEpisode = currentEpisodes.find(ep => ep.episodeNumber === currentEpisodeNumber - 1);
    prevBtn.style.display = prevEpisode ? 'inline-block' : 'none';
    prevBtn.onclick = () => prevEpisode && loadEpisode(prevEpisode.id, prevEpisode.episodeNumber);
    
    // Épisode suivant
    const nextEpisode = currentEpisodes.find(ep => ep.episodeNumber === currentEpisodeNumber + 1);
    nextBtn.style.display = nextEpisode ? 'inline-block' : 'none';
    nextBtn.onclick = () => nextEpisode && loadEpisode(nextEpisode.id, nextEpisode.episodeNumber);
}

// Navigation
function showHome() {
    loadHomePage();
}

function goBackToAnime() {
    if (currentAnime) {
        loadAnimeDetails(currentAnime.id);
    } else {
        showHome();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    loadHomePage();
});
```

---

## CSS pour ressembler à anime-sama.fr

```css
/* Variables CSS */
:root {
    --primary-color: #1a1a1a;
    --secondary-color: #2a2a2a;
    --accent-color: #ff6b35;
    --text-color: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #404040;
    --success-color: #4caf50;
    --error-color: #f44336;
    --card-bg: #2a2a2a;
    --hover-bg: #3a3a3a;
}

/* Reset et base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--primary-color);
    color: var(--text-color);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.main-header {
    background-color: var(--secondary-color);
    padding: 1rem 0;
    border-bottom: 2px solid var(--accent-color);
    position: sticky;
    top: 0;
    z-index: 100;
}

.main-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo h1 {
    color: var(--accent-color);
    font-size: 2rem;
    font-weight: bold;
}

.main-nav {
    display: flex;
    gap: 2rem;
}

.main-nav a {
    color: var(--text-color);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.main-nav a:hover {
    background-color: var(--hover-bg);
}

/* Recherche */
.search-section {
    padding: 2rem 0;
    background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
}

.search-container {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
}

#search-input {
    width: 100%;
    padding: 1rem 4rem 1rem 1rem;
    background-color: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-color);
    font-size: 1.1rem;
    transition: border-color 0.3s;
}

#search-input:focus {
    outline: none;
    border-color: var(--accent-color);
}

#search-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--accent-color);
    border: none;
    padding: 0.75rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2rem;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 0 0 10px 10px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
}

.search-result-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.3s;
}

.search-result-item:hover {
    background-color: var(--hover-bg);
}

.search-result-item img {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px;
    margin-right: 1rem;
}

.result-info h4 {
    margin-bottom: 0.5rem;
    color: var(--text-color);
}

.result-info .status {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

/* Pages */
.page {
    display: none;
    padding: 2rem 0;
}

.page.active {
    display: block;
}

/* Grilles d'anime */
.content-section {
    margin-bottom: 3rem;
}

.content-section h2 {
    color: var(--accent-color);
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
}

.anime-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
}

.anime-card {
    background-color: var(--card-bg);
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.anime-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(255, 107, 53, 0.3);
}

.anime-card img {
    width: 100%;
    height: 280px;
    object-fit: cover;
}

.anime-card-info {
    padding: 1rem;
}

.anime-card-info h3 {
    margin-bottom: 0.5rem;
    color: var(--text-color);
    font-size: 1.1rem;
}

.anime-card-info .status {
    color: var(--success-color);
    font-size: 0.9rem;
}

/* Détails anime */
.breadcrumb {
    margin-bottom: 2rem;
    color: var(--text-secondary);
}

.breadcrumb a {
    color: var(--accent-color);
    text-decoration: none;
}

.anime-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    background-color: var(--card-bg);
    padding: 2rem;
    border-radius: 15px;
}

.anime-header img {
    width: 300px;
    height: 400px;
    object-fit: cover;
    border-radius: 10px;
}

.anime-info {
    flex: 1;
}

.anime-info h1 {
    color: var(--accent-color);
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

.anime-info p {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
    line-height: 1.7;
}

.genres {
    margin-bottom: 1rem;
}

.genre-tag {
    display: inline-block;
    background-color: var(--accent-color);
    color: white;
    padding: 0.3rem 0.8rem;
    margin: 0.2rem;
    border-radius: 20px;
    font-size: 0.9rem;
}

.anime-meta {
    display: flex;
    gap: 2rem;
    color: var(--text-secondary);
}

/* Navigation saisons */
.seasons-nav {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.season-tab {
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 2px solid var(--border-color);
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
}

.season-tab:hover {
    border-color: var(--accent-color);
}

.season-tab.active {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
    color: white;
}

/* Sélecteur de langue */
.language-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.lang-btn {
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.lang-btn:hover:not(:disabled) {
    border-color: var(--accent-color);
}

.lang-btn.active {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
    color: white;
}

.lang-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Liste des épisodes */
.episodes-list {
    background-color: var(--card-bg);
    border-radius: 10px;
    overflow: hidden;
}

.episode-item {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.3s;
}

.episode-item:hover {
    background-color: var(--hover-bg);
}

.episode-item:last-child {
    border-bottom: none;
}

.episode-number {
    background-color: var(--accent-color);
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-weight: bold;
    margin-right: 1rem;
    min-width: 50px;
    text-align: center;
}

.episode-title {
    flex: 1;
    font-size: 1.1rem;
    color: var(--text-color);
}

.episode-status {
    color: var(--success-color);
    font-size: 0.9rem;
}

/* Lecteur vidéo */
.video-player-container {
    background-color: var(--card-bg);
    border-radius: 15px;
    padding: 2rem;
}

.server-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.server-selector span {
    color: var(--text-color);
    font-weight: bold;
}

#server-select {
    background-color: var(--primary-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 5px;
    min-width: 200px;
}

#video-player-wrapper {
    margin-bottom: 2rem;
}

#video-player {
    width: 100%;
    height: 500px;
    border: none;
    border-radius: 10px;
    background-color: #000;
}

.episode-navigation {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.episode-navigation button {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.episode-navigation button:hover {
    background-color: #e55a2b;
}

/* Loading overlay */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(26, 26, 26, 0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loader {
    width: 50px;
    height: 50px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Messages d'erreur */
.error-message {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: var(--error-color);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    z-index: 10000;
    max-width: 400px;
}

.error-message h3 {
    margin-bottom: 0.5rem;
}

.error-message button {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 1rem;
}

.no-results {
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
    .anime-header {
        flex-direction: column;
        text-align: center;
    }
    
    .anime-header img {
        width: 200px;
        height: 280px;
        margin: 0 auto;
    }
    
    .anime-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
    
    .seasons-nav {
        justify-content: center;
    }
    
    .episode-navigation {
        flex-direction: column;
    }
    
    #video-player {
        height: 250px;
    }
    
    .container {
        padding: 0 10px;
    }
}

@media (max-width: 480px) {
    .anime-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .season-tab {
        font-size: 0.9rem;
        padding: 0.6rem 1rem;
    }
    
    .episode-item {
        padding: 0.8rem 1rem;
    }
    
    .anime-info h1 {
        font-size: 2rem;
    }
}
```

---

Cette documentation complète contient tout ce dont vous avez besoin pour créer une page qui reproduit exactement le comportement d'anime-sama.fr en utilisant votre API. Le code est structuré de manière à suivre le parcours utilisateur authentique du site original.