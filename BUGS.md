# Documentation des Bugs - Plateforme Anime

## Bug Critique: Sélection de Saison Incorrecte

### Description
Lorsqu'un utilisateur clique sur une saison spécifique (ex: Saison 2), le lecteur charge toujours les épisodes de la Saison 1 au lieu de la saison sélectionnée.

### Symptômes Observés
- Navigation vers `/anime/my-hero-academia/player?season=2&episode=1&lang=vostfr`
- L'interface affiche "SAISON 2" mais charge l'épisode `my-hero-academia-1-vostfr` (Saison 1)
- Les logs montrent: "Génération épisodes pour: {animeId: 'my-hero-academia', season: 2, language: 'vostfr'}"
- Mais l'ID d'épisode généré est toujours basé sur la Saison 1

### Cause Technique
Le système génère les IDs d'épisodes avec le format `{anime-id}-{episode-number}-{language}` sans tenir compte de la saison sélectionnée. L'API anime-sama utilise un index global d'épisodes à travers toutes les saisons.

**Format actuel:** `my-hero-academia-1-vostfr` (toujours épisode 1)
**Format requis:** `my-hero-academia-14-vostfr` (pour épisode 1 de saison 2, car 13 épisodes en saison 1 + 1 = 14)

### Impact Utilisateur
- Expérience utilisateur frustrante
- Impossible de regarder les saisons autres que la première
- Navigation entre saisons non fonctionnelle

### Localisation du Code
**Fichier:** `client/src/pages/anime-player.tsx`
**Fonctions affectées:**
- `loadSeasonEpisodes()` - ligne ~147-158 (génération IDs épisodes)
- `loadEpisodeSources()` - ligne ~186-207 (construction ID pour API)

### Solution Requise
Calculer l'index global d'épisode en additionnant les épisodes de toutes les saisons précédentes:
- Saison 1, Épisode 1 = Index global 1
- Saison 2, Épisode 1 = Index global 14 (13 + 1)
- Saison 3, Épisode 1 = Index global 39 (13 + 25 + 1)

### Statut
🔴 **Non corrigé** - Bug documenté mais correction annulée à la demande de l'utilisateur

### Date d'identification
2025-06-27 22:08