import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAnimeSchema,
  insertAnimeFavoriteSchema,
  insertMangaSchema,
  insertMangaFavoriteSchema,
  insertMangaChapterSchema,
  insertMangaReadingProgressSchema,
  insertMangaDownloadSchema,
  insertQuizSchema,
  insertQuizResultSchema,
  insertVideoSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatRoomMemberSchema,
  insertAdminPostSchema,
  updateUserProfileSchema,
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are now handled in setupAuth

  // User routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Anime routes
  app.get('/api/anime', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      let animes = await storage.getAnimes(limit);
      
      // If no local data, fetch from Jikan API
      if (animes.length === 0) {
        try {
          const response = await fetch('https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&limit=20');
          if (response.ok) {
            const data = await response.json();
            const jikanAnimes = data.data;
            
            // Save to database
            for (const anime of jikanAnimes) {
              try {
                await storage.createAnime({
                  malId: anime.mal_id,
                  title: anime.title,
                  synopsis: anime.synopsis,
                  imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                  score: anime.score?.toString(),
                  year: anime.year,
                  status: anime.status,
                  episodes: anime.episodes
                });
              } catch (err) {
                // Skip if already exists
              }
            }
            animes = await storage.getAnimes(limit);
          }
        } catch (apiError) {
          console.error("Error fetching from Jikan API:", apiError);
        }
      }
      
      res.json(animes);
    } catch (error) {
      console.error("Error fetching animes:", error);
      res.status(500).json({ message: "Failed to fetch animes" });
    }
  });

  app.get('/api/anime/trending', async (req, res) => {
    try {
      // First try to get from database
      let animes = await storage.getTrendingAnimes();
      
      // If no data in database, fetch from Jikan API
      if (animes.length === 0) {
        try {
          const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
          if (response.ok) {
            const data = await response.json();
            const jikanAnimes = data.data;
            
            // Save to database and return
            const savedAnimes = [];
            for (const anime of jikanAnimes) {
              try {
                const savedAnime = await storage.createAnime({
                  malId: anime.mal_id,
                  title: anime.title,
                  synopsis: anime.synopsis,
                  imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                  score: anime.score?.toString(),
                  year: anime.year,
                  status: anime.status,
                  episodes: anime.episodes
                });
                savedAnimes.push(savedAnime);
              } catch (err) {
                // Skip if already exists
                console.log(`Anime ${anime.title} already exists or error:`, err);
              }
            }
            animes = savedAnimes.length > 0 ? savedAnimes : await storage.getTrendingAnimes();
          }
        } catch (apiError) {
          console.error("Error fetching from Jikan API:", apiError);
        }
      }
      
      res.json(animes);
    } catch (error) {
      console.error("Error fetching trending animes:", error);
      res.status(500).json({ message: "Failed to fetch trending animes" });
    }
  });

  app.get('/api/anime/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      // First search local database
      let animes = await storage.searchAnimes(query);
      
      // If no local results, search Jikan API
      if (animes.length === 0) {
        try {
          const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
          if (response.ok) {
            const data = await response.json();
            const jikanAnimes = data.data;
            
            // Save to database
            const savedAnimes = [];
            for (const anime of jikanAnimes) {
              try {
                const savedAnime = await storage.createAnime({
                  malId: anime.mal_id,
                  title: anime.title,
                  synopsis: anime.synopsis,
                  imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                  score: anime.score?.toString(),
                  year: anime.year,
                  status: anime.status,
                  episodes: anime.episodes
                });
                savedAnimes.push(savedAnime);
              } catch (err) {
                // Skip if already exists
              }
            }
            animes = savedAnimes.length > 0 ? savedAnimes : jikanAnimes.map((anime: any) => ({
              id: anime.mal_id,
              malId: anime.mal_id,
              title: anime.title,
              synopsis: anime.synopsis,
              imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
              score: anime.score?.toString(),
              year: anime.year,
              status: anime.status,
              episodes: anime.episodes
            }));
          }
        } catch (apiError) {
          console.error("Error fetching from Jikan API:", apiError);
        }
      }
      
      res.json(animes);
    } catch (error) {
      console.error("Error searching animes:", error);
      res.status(500).json({ message: "Failed to search animes" });
    }
  });

  app.post('/api/anime', async (req, res) => {
    try {
      const animeData = insertAnimeSchema.parse(req.body);
      const anime = await storage.createAnime(animeData);
      res.json(anime);
    } catch (error) {
      console.error("Error creating anime:", error);
      res.status(500).json({ message: "Failed to create anime" });
    }
  });

  // Manga routes avec intégration MangaDx
  app.get('/api/manga', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      let mangas = await storage.getMangas(limit);
      
      // Si pas de données locales, récupérer depuis MangaDx
      if (mangas.length === 0) {
        try {
          const response = await fetch('https://api.mangadex.org/manga?limit=20&order[createdAt]=desc&includes[]=cover_art&includes[]=author&includes[]=artist');
          if (response.ok) {
            const data = await response.json();
            const mangaDxMangas = data.data;
            
            // Sauvegarder en base de données
            for (const manga of mangaDxMangas) {
              try {
                const coverArt = manga.relationships.find((rel: any) => rel.type === 'cover_art');
                const imageUrl = coverArt ? `https://uploads.mangadx.org/covers/${manga.id}/${coverArt.attributes.fileName}` : null;
                
                await storage.createManga({
                  malId: 0, // MangaDx n'utilise pas MAL ID
                  title: manga.attributes.title.en || manga.attributes.title.fr || Object.values(manga.attributes.title)[0],
                  synopsis: manga.attributes.description.en || manga.attributes.description.fr || '',
                  imageUrl,
                  score: manga.attributes.rating?.toString() || '0',
                  year: manga.attributes.year,
                  status: manga.attributes.status,
                  chapters: manga.attributes.lastChapter ? parseInt(manga.attributes.lastChapter) : null,
                  volumes: manga.attributes.lastVolume ? parseInt(manga.attributes.lastVolume) : null,
                  genres: manga.attributes.tags?.map((tag: any) => tag.attributes.name.en) || [],
                  type: 'manga'
                });
              } catch (err) {
                console.log('Erreur lors de la sauvegarde du manga:', err);
              }
            }
            mangas = await storage.getMangas(limit);
          }
        } catch (apiError) {
          console.error("Erreur API MangaDx:", apiError);
        }
      }
      
      res.json(mangas);
    } catch (error) {
      console.error("Erreur récupération mangas:", error);
      res.status(500).json({ message: "Échec de récupération des mangas" });
    }
  });

  app.get('/api/manga/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Paramètre 'q' requis" });
      }
      
      // Rechercher d'abord en local
      let mangas = await storage.searchMangas(query);
      
      // Si pas de résultats locaux, chercher sur MangaDx
      if (mangas.length === 0) {
        try {
          const response = await fetch(`https://api.mangadx.org/manga?title=${encodeURIComponent(query)}&limit=10&includes[]=cover_art`);
          if (response.ok) {
            const data = await response.json();
            mangas = data.data.map((manga: any) => {
              const coverArt = manga.relationships.find((rel: any) => rel.type === 'cover_art');
              const imageUrl = coverArt ? `https://uploads.mangadx.org/covers/${manga.id}/${coverArt.attributes.fileName}` : null;
              
              return {
                id: manga.id,
                title: manga.attributes.title.en || manga.attributes.title.fr || Object.values(manga.attributes.title)[0],
                synopsis: manga.attributes.description.en || manga.attributes.description.fr || '',
                imageUrl,
                score: manga.attributes.rating?.toString() || '0',
                year: manga.attributes.year,
                status: manga.attributes.status,
                chapters: manga.attributes.lastChapter ? parseInt(manga.attributes.lastChapter) : null,
                volumes: manga.attributes.lastVolume ? parseInt(manga.attributes.lastVolume) : null,
                type: 'manga',
                mangaDxId: manga.id
              };
            });
          }
        } catch (apiError) {
          console.error("Erreur API MangaDx:", apiError);
        }
      }
      
      res.json(mangas);
    } catch (error) {
      console.error("Erreur recherche mangas:", error);
      res.status(500).json({ message: "Échec de recherche des mangas" });
    }
  });

  app.get('/api/manga/:id/chapters', async (req, res) => {
    try {
      const mangaId = parseInt(req.params.id);
      let chapters = await storage.getMangaChapters(mangaId);
      
      // Si pas de chapitres locaux, récupérer depuis MangaDx
      if (chapters.length === 0) {
        try {
          const response = await fetch(`https://api.mangadx.org/manga/${req.params.id}/feed?limit=500&order[chapter]=asc&translatedLanguage[]=fr&translatedLanguage[]=en`);
          if (response.ok) {
            const data = await response.json();
            
            for (const chapter of data.data) {
              try {
                await storage.createMangaChapter({
                  mangadxId: chapter.id,
                  mangaId: mangaId,
                  chapterNumber: chapter.attributes.chapter || '0',
                  title: chapter.attributes.title || '',
                  volume: chapter.attributes.volume,
                  pages: chapter.attributes.pages || 0,
                  translatedLanguage: chapter.attributes.translatedLanguage,
                  scanlationGroup: chapter.relationships.find((rel: any) => rel.type === 'scanlation_group')?.attributes?.name || '',
                  publishAt: new Date(chapter.attributes.publishAt),
                  readableAt: new Date(chapter.attributes.readableAt),
                  version: chapter.attributes.version
                });
              } catch (err) {
                console.log('Erreur sauvegarde chapitre:', err);
              }
            }
            chapters = await storage.getMangaChapters(mangaId);
          }
        } catch (apiError) {
          console.error("Erreur API MangaDx chapitres:", apiError);
        }
      }
      
      res.json(chapters);
    } catch (error) {
      console.error("Erreur récupération chapitres:", error);
      res.status(500).json({ message: "Échec de récupération des chapitres" });
    }
  });

  app.get('/api/manga/chapter/:chapterId/pages', async (req, res) => {
    try {
      const chapterId = req.params.chapterId;
      let chapter = await storage.getChapterByMangaDxId(chapterId);
      
      if (!chapter || !chapter.hash || !chapter.data) {
        // Récupérer les pages depuis MangaDx
        try {
          const response = await fetch(`https://api.mangadx.org/at-home/server/${chapterId}`);
          if (response.ok) {
            const data = await response.json();
            const baseUrl = data.baseUrl;
            const hash = data.chapter.hash;
            const pages = data.chapter.data;
            const pagesSaver = data.chapter.dataSaver;
            
            // Mettre à jour le chapitre avec les données des pages
            if (chapter) {
              chapter = await storage.updateMangaChapter(chapter.id, {
                hash,
                data: pages,
                dataSaver: pagesSaver
              });
            }
            
            // Construire les URLs des pages
            const pageUrls = pages.map((page: string, index: number) => ({
              pageNumber: index + 1,
              imageUrl: `${baseUrl}/data/${hash}/${page}`,
              imageUrlSaver: `${baseUrl}/data-saver/${hash}/${pagesSaver[index] || page}`
            }));
            
            res.json({
              chapter: chapter,
              pages: pageUrls,
              baseUrl,
              hash
            });
          } else {
            res.status(404).json({ message: "Chapitre non trouvé sur MangaDx" });
          }
        } catch (apiError) {
          console.error("Erreur API MangaDx pages:", apiError);
          res.status(500).json({ message: "Erreur récupération pages depuis MangaDx" });
        }
      } else {
        // Utiliser les données en cache
        const baseUrl = `https://uploads.mangadx.org/data/${chapter.hash}`;
        const pageUrls = chapter.data.map((page: string, index: number) => ({
          pageNumber: index + 1,
          imageUrl: `${baseUrl}/${page}`,
          imageUrlSaver: chapter.dataSaver ? `https://uploads.mangadx.org/data-saver/${chapter.hash}/${chapter.dataSaver[index]}` : null
        }));
        
        res.json({
          chapter: chapter,
          pages: pageUrls
        });
      }
    } catch (error) {
      console.error("Erreur récupération pages:", error);
      res.status(500).json({ message: "Échec de récupération des pages" });
    }
  });

  // Progression de lecture
  app.get('/api/manga/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const mangaId = req.query.mangaId ? parseInt(req.query.mangaId as string) : undefined;
      const progress = await storage.getUserReadingProgress(userId, mangaId);
      res.json(progress);
    } catch (error) {
      console.error("Erreur récupération progression:", error);
      res.status(500).json({ message: "Échec de récupération de la progression" });
    }
  });

  app.post('/api/manga/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progressData = insertMangaReadingProgressSchema.parse({
        ...req.body,
        userId,
      });
      const progress = await storage.updateReadingProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Erreur mise à jour progression:", error);
      res.status(500).json({ message: "Échec de mise à jour de la progression" });
    }
  });

  // Téléchargements
  app.get('/api/manga/downloads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const downloads = await storage.getUserDownloads(userId);
      res.json(downloads);
    } catch (error) {
      console.error("Erreur récupération téléchargements:", error);
      res.status(500).json({ message: "Échec de récupération des téléchargements" });
    }
  });

  app.post('/api/manga/download/:chapterId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const chapterId = parseInt(req.params.chapterId);
      
      const download = await storage.createDownload({
        userId,
        chapterId,
        status: 'pending'
      });
      
      res.json(download);
    } catch (error) {
      console.error("Erreur création téléchargement:", error);
      res.status(500).json({ message: "Échec de création du téléchargement" });
    }
  });

  // Animal anime routes
  app.get('/api/anime/animals', async (req, res) => {
    try {
      const animes = await storage.getAnimalAnimes(20);
      res.json(animes);
    } catch (error) {
      console.error("Error getting animal animes:", error);
      res.status(500).json({ message: "Failed to get animal animes" });
    }
  });

  app.get('/api/anime/animals/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const animes = await storage.searchAnimalAnimes(query);
      res.json(animes);
    } catch (error) {
      console.error("Error searching animal animes:", error);
      res.status(500).json({ message: "Failed to search animal animes" });
    }
  });

  // Anime favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favoriteData = insertAnimeFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      const favorite = await storage.addToFavorites(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:animeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const animeId = parseInt(req.params.animeId);
      await storage.removeFromFavorites(userId, animeId);
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Quiz routes
  app.get('/api/quizzes', async (req, res) => {
    try {
      const quizzes = await storage.getQuizzes();
      console.log(`Retour de ${quizzes.length} quiz`);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get('/api/quizzes/featured', async (req, res) => {
    try {
      // Get the most recent non-auto-generated quiz
      const quizzes = await storage.getQuizzes();
      const featuredQuiz = quizzes.find(q => !q.title.includes('Quiz Anime du Jour'));
      
      if (featuredQuiz) {
        res.json(featuredQuiz);
      } else if (quizzes.length > 0) {
        res.json(quizzes[0]);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching featured quiz:", error);
      res.status(500).json({ message: "Failed to fetch featured quiz" });
    }
  });

  app.get('/api/quizzes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Fetching quiz with ID:", id);
      
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        console.log("Quiz not found for ID:", id);
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      console.log("Returning quiz data:", quiz);
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Delete all quizzes (admin only)
  app.delete('/api/quizzes/all', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const adminEmail = process.env.ADMIN_USER_ID || "sorokomarco@gmail.com";

      // Vérifier si l'utilisateur est l'admin spécifique
      if (user?.email !== adminEmail) {
        return res.status(403).json({ message: "Accès refusé - Admin uniquement" });
      }

      await storage.deleteAllQuizzes();
      res.json({ message: "Tous les quiz ont été supprimés avec succès" });
    } catch (error) {
      console.error("Error deleting all quizzes:", error);
      res.status(500).json({ message: "Failed to delete quizzes" });
    }
  });

  // Clean duplicate quizzes (admin only)
  app.delete('/api/quizzes/duplicates', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const adminEmail = process.env.ADMIN_USER_ID || "sorokomarco@gmail.com";

      // Vérifier si l'utilisateur est l'admin spécifique
      if (user?.email !== adminEmail) {
        return res.status(403).json({ message: "Accès refusé - Admin uniquement" });
      }

      await storage.cleanupDuplicateQuizzes();
      res.json({ message: "Quiz dupliqués supprimés avec succès" });
    } catch (error) {
      console.error("Error cleaning duplicate quizzes:", error);
      res.status(500).json({ message: "Failed to clean duplicate quizzes" });
    }
  });

  // Generate quiz from real anime data
  app.post('/api/quizzes/generate', isAuthenticated, async (req, res) => {
    try {
      const animes = await storage.getAnimes(50);
      
      if (animes.length < 5) {
        return res.status(400).json({ message: "Not enough anime data to generate quiz" });
      }
      
      const selectedAnimes = animes.sort(() => Math.random() - 0.5).slice(0, 10);
      const questions = [];
      
      // Generate different types of questions
      for (let i = 0; i < Math.min(8, selectedAnimes.length); i++) {
        const anime = selectedAnimes[i];
        const questionTypes = ['score', 'episodes', 'year', 'status'];
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        let question, options, correctAnswer, explanation;
        
        switch (questionType) {
          case 'score':
            if (anime.score) {
              const correctScore = parseFloat(anime.score);
              question = `Quel est le score de "${anime.title}" sur MyAnimeList ?`;
              options = [
                anime.score,
                (correctScore + 0.5).toFixed(1),
                (correctScore - 0.5).toFixed(1),
                (correctScore + 1).toFixed(1)
              ].sort(() => Math.random() - 0.5);
              correctAnswer = options.indexOf(anime.score);
              explanation = `${anime.title} a un score de ${anime.score} sur MyAnimeList.`;
            }
            break;
            
          case 'episodes':
            if (anime.episodes) {
              question = `Combien d'épisodes compte "${anime.title}" ?`;
              options = [
                anime.episodes.toString(),
                (anime.episodes + 12).toString(),
                (anime.episodes - 1).toString(),
                "24"
              ].sort(() => Math.random() - 0.5);
              correctAnswer = options.indexOf(anime.episodes.toString());
              explanation = `${anime.title} compte ${anime.episodes} épisodes.`;
            }
            break;
            
          case 'year':
            if (anime.year) {
              question = `En quelle année "${anime.title}" est-il sorti ?`;
              options = [
                anime.year.toString(),
                (anime.year + 1).toString(),
                (anime.year - 1).toString(),
                (anime.year + 2).toString()
              ].sort(() => Math.random() - 0.5);
              correctAnswer = options.indexOf(anime.year.toString());
              explanation = `${anime.title} est sorti en ${anime.year}.`;
            }
            break;
            
          case 'status':
            if (anime.status) {
              question = `Quel est le statut de "${anime.title}" ?`;
              const statuses = ['Finished Airing', 'Currently Airing', 'Not yet aired'];
              options = [anime.status, ...statuses.filter(s => s !== anime.status)].slice(0, 4);
              options = options.sort(() => Math.random() - 0.5);
              correctAnswer = options.indexOf(anime.status);
              explanation = `${anime.title} a le statut : ${anime.status}.`;
            }
            break;
        }
        
        if (question && options && explanation && correctAnswer !== -1) {
          questions.push({ question, options, correctAnswer, explanation });
        }
      }
      
      if (questions.length < 3) {
        return res.status(400).json({ message: "Could not generate enough valid questions" });
      }
      
      const quiz = await storage.createQuiz({
        title: `Quiz Anime Authentique - ${new Date().toLocaleDateString('fr-FR')}`,
        description: "Quiz généré automatiquement basé sur de vraies données d'anime de MyAnimeList",
        difficulty: "medium",
        questions: questions.slice(0, 8),
        xpReward: questions.length * 5
      });
      
      res.json(quiz);
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.post('/api/quizzes', isAuthenticated, async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Quiz results routes
  app.get('/api/quiz-results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const results = await storage.getUserQuizResults(userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      res.status(500).json({ message: "Failed to fetch quiz results" });
    }
  });

  app.post('/api/quiz-results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resultData = insertQuizResultSchema.parse({
        ...req.body,
        userId,
      });

      const result = await storage.createQuizResult(resultData);

      // Update user XP
      if (resultData.xpEarned && resultData.xpEarned > 0) {
        await storage.updateUserXP(userId, resultData.xpEarned);
      }

      res.json(result);
    } catch (error) {
      console.error("Error creating quiz result:", error);
      res.status(500).json({ message: "Failed to create quiz result" });
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const videos = await storage.getVideos(limit);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/popular', async (req, res) => {
    try {
      const videos = await storage.getPopularVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching popular videos:", error);
      res.status(500).json({ message: "Failed to fetch popular videos" });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.post('/api/videos', isAuthenticated, async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  // External API integration for anime data (Jikan API)
  app.get('/api/external/anime/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching from Jikan API:", error);
      res.status(500).json({ message: "Failed to search anime from external API" });
    }
  });

  app.get('/api/external/anime/top', async (req, res) => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching top anime from Jikan API:", error);
      res.status(500).json({ message: "Failed to fetch top anime from external API" });
    }
  });

  // YouTube API integration for videos
  app.get('/api/external/youtube/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const searchQuery = `${query} anime opening`;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform YouTube data to match our video format
      const videos = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: "N/A",
        views: 0,
        category: "opening",
        source: "youtube"
      })) || [];

      res.json({ videos });
    } catch (error) {
      console.error("Error fetching from YouTube API:", error);
      res.status(500).json({ message: "Failed to search videos from YouTube" });
    }
  });

  // Anime opening music search
  app.get('/api/external/music/openings', async (req, res) => {
    try {
      const anime = req.query.anime as string;
      
      if (!anime) {
        return res.status(400).json({ message: "Anime parameter is required" });
      }

      // Search for anime openings on YouTube
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }

      const searchQuery = `${anime} opening theme song`;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform YouTube data to match our music format
      const openings = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        anime: anime,
        audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: "N/A",
        type: "opening",
        source: "youtube"
      })) || [];

      res.json({ openings });
    } catch (error) {
      console.error("Error fetching anime openings:", error);
      res.status(500).json({ message: "Failed to fetch anime openings" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rooms = await storage.getUserChatRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/chat/rooms/public', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching public chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch public chat rooms" });
    }
  });

  app.post('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roomData = insertChatRoomSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const room = await storage.createChatRoom(roomData);
      res.json(room);
    } catch (error) {
      console.error("Error creating chat room:", error);
      res.status(500).json({ message: "Failed to create chat room" });
    }
  });

  app.get('/api/chat/rooms/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/rooms/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roomId = parseInt(req.params.id);
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        roomId,
        userId,
      });
      const message = await storage.sendChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post('/api/chat/rooms/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roomId = parseInt(req.params.id);
      const membership = await storage.joinChatRoom({ roomId, userId });
      res.json(membership);
    } catch (error) {
      console.error("Error joining chat room:", error);
      res.status(500).json({ message: "Failed to join chat room" });
    }
  });

  // User profile update route
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = updateUserProfileSchema.parse(req.body);
      
      // Validate image size if profileImageUrl is provided
      if (profileData.profileImageUrl) {
        const imageData = profileData.profileImageUrl;
        // Check if it's a base64 image and estimate size
        if (imageData.startsWith('data:image/')) {
          const base64Data = imageData.split(',')[1];
          const sizeInBytes = (base64Data.length * 3) / 4;
          const sizeInMB = sizeInBytes / (1024 * 1024);
          
          if (sizeInMB > 5) { // Limit to 5MB
            return res.status(413).json({ 
              message: "L'image est trop volumineuse. Veuillez utiliser une image de moins de 5MB." 
            });
          }
        }
      }
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Données de profil invalides", 
          errors: (error as any).errors 
        });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Endpoint temporaire pour voir votre ID utilisateur
  app.get('/api/debug/my-id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userInfo = req.user;
      res.json({ userId, userInfo });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user ID" });
    }
  });

  // Admin routes - Accès restreint à l'utilisateur spécifique
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const user = await storage.getUser(req.user.id);
      const adminEmail = process.env.ADMIN_USER_ID || "sorokomarco@gmail.com";

      // Vérifier si l'utilisateur est l'admin spécifique
      if (user?.email !== adminEmail) {
        return res.status(403).json({ message: "Accès refusé - Admin uniquement" });
      }
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(500).json({ message: "Erreur de vérification admin" });
    }
  };

  app.get('/api/admin/posts', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const published = req.query.published ? req.query.published === 'true' : undefined;
      const posts = await storage.getAdminPosts(published);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      res.status(500).json({ message: "Failed to fetch admin posts" });
    }
  });

  app.get('/api/admin/posts/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getAdminPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching admin post:", error);
      res.status(500).json({ message: "Failed to fetch admin post" });
    }
  });

  app.post('/api/admin/posts', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const postData = insertAdminPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const post = await storage.createAdminPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating admin post:", error);
      res.status(500).json({ message: "Failed to create admin post" });
    }
  });

  app.put('/api/admin/posts/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const post = await storage.updateAdminPost(id, updates);
      res.json(post);
    } catch (error) {
      console.error("Error updating admin post:", error);
      res.status(500).json({ message: "Failed to update admin post" });
    }
  });

  app.delete('/api/admin/posts/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdminPost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin post:", error);
      res.status(500).json({ message: "Failed to delete admin post" });
    }
  });

  // Public posts for non-admin users
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getPublicPosts(); // Only published, non-admin-only posts
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Admin platform statistics
  app.get('/api/admin/platform-stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  // Admin bulk quiz creation
  app.post('/api/admin/quizzes/bulk', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizzes = req.body.quizzes;
      if (!Array.isArray(quizzes)) {
        return res.status(400).json({ message: "Expected array of quizzes" });
      }

      const createdQuizzes = [];
      for (const quizData of quizzes) {
        const quiz = await storage.createQuiz({
          title: quizData.title,
          description: quizData.description,
          difficulty: quizData.difficulty,
          questions: quizData.questions,
          xpReward: quizData.xpReward
        });
        createdQuizzes.push(quiz);
      }

      res.json({
        message: `Successfully created ${createdQuizzes.length} quizzes`,
        quizzes: createdQuizzes
      });
    } catch (error) {
      console.error("Error creating bulk quizzes:", error);
      res.status(500).json({ message: "Failed to create bulk quizzes" });
    }
  });

  // Create French quizzes endpoint
  app.post('/api/admin/create-french-quizzes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Import French quiz data
      const { frenchQuizzes } = await import('./french-quiz-data');
      
      const createdQuizzes = [];
      for (const quizData of frenchQuizzes) {
        try {
          const quiz = await storage.createQuiz({
            title: quizData.title,
            description: quizData.description,
            difficulty: quizData.difficulty,
            questions: quizData.questions,
            xpReward: quizData.xpReward
          });
          createdQuizzes.push(quiz);
        } catch (error) {
          console.log(`Quiz ${quizData.title} might already exist or error:`, error);
        }
      }

      res.json({
        message: `Successfully created ${createdQuizzes.length} French quizzes`,
        quizzes: createdQuizzes
      });
    } catch (error) {
      console.error("Error creating French quizzes:", error);
      res.status(500).json({ message: "Failed to create French quizzes" });
    }
  });

  // Get all chat messages
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50; // Réduire la limite par défaut
      const messages = await storage.getChatMessages(1, limit);
      
      // Simplifier le traitement des messages
      const sortedMessages = messages
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((message: any, index: number) => ({
          ...message,
          id: `${message.id}-${message.createdAt || Date.now()}-${index}`,
        }));
      
      // Ajouter des headers de cache
      res.set('Cache-Control', 'private, max-age=10');
      res.json(sortedMessages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send chat message
  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { content, message: messageText } = req.body;
      
      // Support both 'content' and 'message' fields
      const messageContent = content || messageText;
      
      if (!messageContent || !messageContent.trim()) {
        return res.status(400).json({ message: "Le contenu du message est requis" });
      }

      if (messageContent.trim().length > 1000) {
        return res.status(400).json({ message: "Le message est trop long (max 1000 caractères)" });
      }

      const messageData = {
        message: messageContent.trim(),
        roomId: 1, // Default room
        userId,
      };
      
      // Créer le message en parallèle avec la récupération de l'utilisateur
      const [newMessage, user] = await Promise.all([
        storage.sendChatMessage(messageData),
        storage.getUser(userId)
      ]);
      
      // Return enriched message data immédiatement
      const enrichedMessage = {
        ...newMessage,
        id: `${newMessage.id}-${Date.now()}`,
        userId: userId,
        userFirstName: user?.firstName || 'Utilisateur',
        userLastName: user?.lastName || '',
        userProfileImageUrl: user?.profileImageUrl,
        isAdmin: user?.isAdmin || false,
        createdAt: new Date().toISOString(),
      };
      
      res.json(enrichedMessage);
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: "Échec de l'envoi du message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}