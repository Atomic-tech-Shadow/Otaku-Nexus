import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface AnimeSamaEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}

interface AnimeSamaSeason {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

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
  seasons?: AnimeSamaSeason[];
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
}

export default function AnimeDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { animeId, animeTitle, animeImage } = route.params as {
    animeId: string;
    animeTitle: string;
    animeImage: string;
  };

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');

  // Détails de l'anime
  const { data: animeDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['/api/anime-sama/anime', animeId],
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Épisodes de la saison sélectionnée
  const { data: episodes = [], isLoading: episodesLoading } = useQuery({
    queryKey: ['/api/anime-sama/episodes', animeId, selectedSeason, selectedLanguage],
    enabled: !!animeId && selectedSeason > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Correction numérotation One Piece
  const correctedEpisodes = useMemo(() => {
    if (!(episodes as AnimeSamaEpisode[])?.length || !(animeDetails as AnimeSamaAnime)?.progressInfo) return episodes as AnimeSamaEpisode[];
    
    const isOnePiece = animeTitle.toLowerCase().includes('one piece');
    if (!isOnePiece) return episodes;

    // Mapping spécial pour One Piece basé sur les sagas
    const sagaMapping: Record<number, number> = {
      11: 1087, // Saga 11 commence à l'épisode 1087
      10: 1000, // Saga 10 commence à l'épisode 1000
      9: 892,   // Saga 9 commence à l'épisode 892
      8: 783,   // Saga 8 commence à l'épisode 783
      7: 629,   // Saga 7 commence à l'épisode 629
      6: 517,   // Saga 6 commence à l'épisode 517
      5: 421,   // Saga 5 commence à l'épisode 421
      4: 326,   // Saga 4 commence à l'épisode 326
      3: 207,   // Saga 3 commence à l'épisode 207
      2: 78,    // Saga 2 commence à l'épisode 78
      1: 1,     // Saga 1 commence à l'épisode 1
    };

    const baseEpisode = sagaMapping[selectedSeason] || 1;
    
    return (episodes as AnimeSamaEpisode[]).map((episode, index) => ({
      ...episode,
      episodeNumber: baseEpisode + index,
      title: episode.title || `Épisode ${baseEpisode + index}`,
    }));
  }, [episodes, animeDetails, animeTitle, selectedSeason]);

  const handleEpisodePress = useCallback((episode: AnimeSamaEpisode) => {
    if (!episode.available) {
      Alert.alert('Épisode indisponible', 'Cet épisode n\'est pas encore disponible.');
      return;
    }

    (navigation as any).navigate('VideoPlayer', {
      episodeId: episode.id,
      animeTitle: animeTitle,
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.title,
      language: selectedLanguage,
    });
  }, [navigation, animeTitle, selectedLanguage]);

  const handleLanguageChange = useCallback((language: 'vf' | 'vostfr') => {
    setSelectedLanguage(language);
  }, []);

  const availableSeasons = useMemo(() => {
    if (!(animeDetails as AnimeSamaAnime)?.seasons) {
      // Génération de saisons basée sur progressInfo pour One Piece
      if (animeTitle.toLowerCase().includes('one piece') && (animeDetails as AnimeSamaAnime)?.progressInfo) {
        const totalEpisodes = (animeDetails as AnimeSamaAnime).progressInfo!.totalEpisodes;
        const seasons = [];
        for (let i = 1; i <= Math.ceil(totalEpisodes / 100); i++) {
          seasons.push({
            number: i,
            name: `Saga ${i}`,
            languages: ['vf', 'vostfr'],
            episodeCount: i === Math.ceil(totalEpisodes / 100) ? totalEpisodes % 100 || 100 : 100,
            url: '',
          });
        }
        return seasons;
      }
      return [];
    }
    return (animeDetails as AnimeSamaAnime).seasons!;
  }, [animeDetails, animeTitle]);

  if (detailsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1e40af', '#000000']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00D4FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {animeTitle}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image et infos principales */}
        <View style={styles.animeHeader}>
          <Image
            source={{ uri: animeImage || 'https://via.placeholder.com/300x400' }}
            style={styles.animeImage}
            resizeMode="cover"
          />
          <View style={styles.animeInfo}>
            <Text style={styles.animeTitle}>{animeTitle}</Text>
            {animeDetails && (
              <>
                <View style={styles.metaInfo}>
                  <Text style={styles.metaText}>{animeDetails.type}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.metaText}>{animeDetails.status}</Text>
                  {animeDetails.year && (
                    <>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={styles.metaText}>{animeDetails.year}</Text>
                    </>
                  )}
                </View>
                {animeDetails.progressInfo && (
                  <View style={styles.progressContainer}>
                    <Text style={styles.episodeCount}>
                      {animeDetails.progressInfo.totalEpisodes} épisodes
                    </Text>
                    {animeDetails.progressInfo.hasFilms && (
                      <View style={styles.filmBadge}>
                        <Text style={styles.filmText}>FILMS</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Description */}
        {animeDetails?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{animeDetails.description}</Text>
          </View>
        )}

        {/* Genres */}
        {animeDetails?.genres && animeDetails.genres.length > 0 && (
          <View style={styles.genresContainer}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.genresList}>
              {animeDetails.genres.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sélection de saison */}
        {availableSeasons.length > 1 && (
          <View style={styles.seasonContainer}>
            <Text style={styles.sectionTitle}>Saisons</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.seasonList}>
                {availableSeasons.map((season) => (
                  <TouchableOpacity
                    key={season.number}
                    style={[
                      styles.seasonButton,
                      selectedSeason === season.number && styles.seasonButtonActive
                    ]}
                    onPress={() => setSelectedSeason(season.number)}
                  >
                    <Text style={[
                      styles.seasonButtonText,
                      selectedSeason === season.number && styles.seasonButtonTextActive
                    ]}>
                      {season.name || `Saison ${season.number}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Sélection de langue */}
        <View style={styles.languageContainer}>
          <Text style={styles.sectionTitle}>Langue</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'vostfr' && styles.languageButtonActive
              ]}
              onPress={() => handleLanguageChange('vostfr')}
            >
              <Image
                source={{ uri: 'https://flagcdn.com/w20/jp.png' }}
                style={styles.flagIcon}
              />
              <Text style={[
                styles.languageButtonText,
                selectedLanguage === 'vostfr' && styles.languageButtonTextActive
              ]}>
                VOSTFR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'vf' && styles.languageButtonActive
              ]}
              onPress={() => handleLanguageChange('vf')}
            >
              <Image
                source={{ uri: 'https://flagcdn.com/w20/fr.png' }}
                style={styles.flagIcon}
              />
              <Text style={[
                styles.languageButtonText,
                selectedLanguage === 'vf' && styles.languageButtonTextActive
              ]}>
                VF
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des épisodes */}
        <View style={styles.episodesContainer}>
          <Text style={styles.sectionTitle}>
            Épisodes {availableSeasons.find(s => s.number === selectedSeason)?.name || `Saison ${selectedSeason}`}
          </Text>
          
          {episodesLoading ? (
            <View style={styles.episodesLoading}>
              <ActivityIndicator size="large" color="#00D4FF" />
              <Text style={styles.loadingText}>Chargement des épisodes...</Text>
            </View>
          ) : correctedEpisodes.length === 0 ? (
            <View style={styles.noEpisodes}>
              <Ionicons name="film-outline" size={48} color="#666" />
              <Text style={styles.noEpisodesText}>
                Aucun épisode disponible pour cette langue
              </Text>
            </View>
          ) : (
            <View style={styles.episodesList}>
              {correctedEpisodes.map((episode, index) => (
                <TouchableOpacity
                  key={`${episode.id}-${index}`}
                  style={[
                    styles.episodeItem,
                    !episode.available && styles.episodeItemDisabled
                  ]}
                  onPress={() => handleEpisodePress(episode)}
                  disabled={!episode.available}
                >
                  <View style={styles.episodeNumber}>
                    <Text style={styles.episodeNumberText}>
                      {episode.episodeNumber}
                    </Text>
                  </View>
                  <View style={styles.episodeInfo}>
                    <Text style={[
                      styles.episodeTitle,
                      !episode.available && styles.episodeTitleDisabled
                    ]} numberOfLines={2}>
                      {episode.title || `Épisode ${episode.episodeNumber}`}
                    </Text>
                  </View>
                  <View style={styles.episodeAction}>
                    {episode.available ? (
                      <Ionicons name="play-circle" size={24} color="#00D4FF" />
                    ) : (
                      <Ionicons name="lock-closed" size={24} color="#666" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  animeHeader: {
    flexDirection: 'row',
    padding: 20,
  },
  animeImage: {
    width: 120,
    height: 160,
    borderRadius: 10,
  },
  animeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  animeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 24,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
  },
  metaSeparator: {
    color: '#666',
    marginHorizontal: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  episodeCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filmBadge: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  filmText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#00D4FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
  },
  genresContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  genreText: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '600',
  },
  seasonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  seasonList: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  seasonButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  seasonButtonActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  seasonButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  seasonButtonTextActive: {
    color: '#000',
  },
  languageContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  languageButtons: {
    flexDirection: 'row',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageButtonActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  flagIcon: {
    width: 16,
    height: 12,
    marginRight: 8,
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  episodesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  episodesLoading: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  noEpisodes: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  noEpisodesText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  episodesList: {
    gap: 10,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  episodeItemDisabled: {
    opacity: 0.5,
  },
  episodeNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  episodeNumberText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  episodeTitleDisabled: {
    color: '#666',
  },
  episodeAction: {
    padding: 5,
  },
});