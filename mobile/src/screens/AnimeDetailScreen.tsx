import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

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

interface AnimeData {
  id: string;
  title: string;
  description: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: Season[];
  url: string;
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

export default function AnimeDetailScreen({ navigation }: any) {
  const route = useRoute();
  const { animeId } = route.params as { animeId: string };
  
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://api-anime-sama.onrender.com';

  useEffect(() => {
    if (!animeId) return;
    
    const loadAnimeData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/anime/${animeId}`);
        const apiResponse: ApiResponse<AnimeData> = await response.json();
        
        if (!apiResponse.success) {
          throw new Error('Erreur lors du chargement de l\'anime');
        }
        
        setAnimeData(apiResponse.data);
        
        // Auto-select first season if available
        if (apiResponse.data.seasons && apiResponse.data.seasons.length > 0) {
          setSelectedSeason(apiResponse.data.seasons[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur API:', err);
        setError('Impossible de charger les données de l\'anime.');
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [animeId]);

  useEffect(() => {
    if (selectedSeason) {
      loadEpisodes();
    }
  }, [selectedSeason, selectedLanguage]);

  const loadEpisodes = async () => {
    if (!selectedSeason || !animeId) return;
    
    setEpisodeLoading(true);
    try {
      const language = selectedLanguage === 'VF' ? 'vf' : 'vostfr';
      const response = await fetch(
        `${API_BASE}/api/anime/${animeId}/season/${selectedSeason.number}/episodes?language=${language}`
      );
      const apiResponse: ApiResponse<{ episodes: Episode[] }> = await response.json();
      
      if (apiResponse.success) {
        setEpisodes(apiResponse.data.episodes || []);
      } else {
        setEpisodes([]);
      }
    } catch (err) {
      console.error('Erreur chargement épisodes:', err);
      setEpisodes([]);
    } finally {
      setEpisodeLoading(false);
    }
  };

  const handleEpisodePress = (episode: Episode) => {
    if (!episode.available) {
      Alert.alert('Épisode indisponible', 'Cet épisode n\'est pas encore disponible.');
      return;
    }
    
    navigation.navigate('VideoPlayer', { 
      episodeId: episode.id,
      animeTitle: animeData?.title,
      episodeTitle: episode.title,
      episodeNumber: episode.episodeNumber
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4FF" />
            <Text style={styles.loadingText}>Chargement de l'anime...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.retryText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {animeData.title}
          </Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Anime Info */}
          <View style={styles.animeInfo}>
            <Image
              source={{ uri: animeData.image }}
              style={styles.animeImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.infoOverlay}
            >
              <Text style={styles.animeTitle}>{animeData.title}</Text>
              <View style={styles.animeMetadata}>
                <Text style={styles.animeYear}>{animeData.year}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{animeData.status}</Text>
                </View>
              </View>
              {animeData.genres && (
                <View style={styles.genreContainer}>
                  {animeData.genres.slice(0, 3).map((genre, index) => (
                    <View key={index} style={styles.genreBadge}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Description */}
          {animeData.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.descriptionText}>{animeData.description}</Text>
            </View>
          )}

          {/* Progress Info */}
          {animeData.progressInfo && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Informations</Text>
              <View style={styles.progressGrid}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Avancement</Text>
                  <Text style={styles.progressValue}>{animeData.progressInfo.advancement}</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Épisodes</Text>
                  <Text style={styles.progressValue}>{animeData.progressInfo.totalEpisodes}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Language Selection */}
          <View style={styles.languageSection}>
            <Text style={styles.sectionTitle}>Langue</Text>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  selectedLanguage === 'VOSTFR' && styles.languageButtonActive
                ]}
                onPress={() => setSelectedLanguage('VOSTFR')}
              >
                <Text style={styles.languageFlag}>🇯🇵</Text>
                <Text style={[
                  styles.languageText,
                  selectedLanguage === 'VOSTFR' && styles.languageTextActive
                ]}>
                  VOSTFR
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  selectedLanguage === 'VF' && styles.languageButtonActive
                ]}
                onPress={() => setSelectedLanguage('VF')}
              >
                <Text style={styles.languageFlag}>🇫🇷</Text>
                <Text style={[
                  styles.languageText,
                  selectedLanguage === 'VF' && styles.languageTextActive
                ]}>
                  VF
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seasons */}
          {animeData.seasons && animeData.seasons.length > 0 && (
            <View style={styles.seasonsSection}>
              <Text style={styles.sectionTitle}>Saisons</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {animeData.seasons.map((season) => (
                  <TouchableOpacity
                    key={season.number}
                    style={[
                      styles.seasonCard,
                      selectedSeason?.number === season.number && styles.seasonCardActive
                    ]}
                    onPress={() => setSelectedSeason(season)}
                  >
                    <Text style={[
                      styles.seasonNumber,
                      selectedSeason?.number === season.number && styles.seasonNumberActive
                    ]}>
                      {season.number}
                    </Text>
                    <Text style={[
                      styles.seasonName,
                      selectedSeason?.number === season.number && styles.seasonNameActive
                    ]} numberOfLines={1}>
                      {season.name}
                    </Text>
                    <Text style={styles.seasonEpisodes}>
                      {season.episodeCount} épisodes
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Episodes */}
          {selectedSeason && (
            <View style={styles.episodesSection}>
              <Text style={styles.sectionTitle}>
                Épisodes - Saison {selectedSeason.number}
              </Text>
              
              {episodeLoading ? (
                <View style={styles.episodeLoadingContainer}>
                  <ActivityIndicator size="small" color="#00D4FF" />
                  <Text style={styles.episodeLoadingText}>Chargement des épisodes...</Text>
                </View>
              ) : episodes.length === 0 ? (
                <View style={styles.noEpisodesContainer}>
                  <Text style={styles.noEpisodesText}>
                    Aucun épisode disponible en {selectedLanguage}
                  </Text>
                </View>
              ) : (
                <View style={styles.episodesList}>
                  {episodes.map((episode) => (
                    <TouchableOpacity
                      key={episode.id}
                      style={[
                        styles.episodeCard,
                        !episode.available && styles.episodeCardDisabled
                      ]}
                      onPress={() => handleEpisodePress(episode)}
                      disabled={!episode.available}
                    >
                      <View style={styles.episodeInfo}>
                        <Text style={styles.episodeNumber}>
                          Épisode {episode.episodeNumber}
                        </Text>
                        <Text style={styles.episodeTitle} numberOfLines={2}>
                          {episode.title}
                        </Text>
                      </View>
                      <View style={styles.episodeAction}>
                        {episode.available ? (
                          <Ionicons name="play-circle" size={32} color="#00D4FF" />
                        ) : (
                          <Ionicons name="lock-closed" size={24} color="#666" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  favoriteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  animeInfo: {
    height: height * 0.4,
    position: 'relative',
  },
  animeImage: {
    width: '100%',
    height: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  animeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  animeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  animeYear: {
    fontSize: 16,
    color: '#888',
    marginRight: 15,
  },
  statusBadge: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  genreText: {
    fontSize: 12,
    color: 'white',
  },
  descriptionSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  languageSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flex: 1,
    justifyContent: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#00D4FF',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  languageTextActive: {
    color: 'white',
  },
  seasonsSection: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  seasonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    minWidth: 120,
    alignItems: 'center',
  },
  seasonCardActive: {
    backgroundColor: '#00D4FF',
  },
  seasonNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 5,
  },
  seasonNumberActive: {
    color: 'white',
  },
  seasonName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  seasonNameActive: {
    color: 'white',
  },
  seasonEpisodes: {
    fontSize: 12,
    color: '#888',
  },
  episodesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  episodeLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  episodeLoadingText: {
    color: 'white',
    marginLeft: 10,
  },
  noEpisodesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noEpisodesText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  episodesList: {
    gap: 10,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  episodeCardDisabled: {
    opacity: 0.5,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 5,
  },
  episodeTitle: {
    fontSize: 14,
    color: 'white',
    lineHeight: 18,
  },
  episodeAction: {
    marginLeft: 15,
  },
});