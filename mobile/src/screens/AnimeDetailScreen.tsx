import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService, AnimeSamaAnime, AnimeSamaEpisode } from '../services/api';

const AnimeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { animeId, animeTitle, anime: initialAnime } = route.params as {
    animeId: string;
    animeTitle: string;
    anime?: AnimeSamaAnime;
  };

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');

  const { data: animeData, isLoading: animeLoading } = useQuery({
    queryKey: ["animeDetail", animeId],
    queryFn: () => apiService.getAnimeById(animeId),
    initialData: initialAnime,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });

  const { data: episodes = [], isLoading: episodesLoading } = useQuery({
    queryKey: ["episodes", animeId, selectedSeason, selectedLanguage],
    queryFn: () => apiService.getSeasonEpisodes(animeId, selectedSeason, selectedLanguage),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!animeData,
  });

  const handleEpisodePress = useCallback((episode: AnimeSamaEpisode) => {
    if (!episode.available) {
      Alert.alert(
        'Épisode indisponible',
        'Cet épisode n\'est pas encore disponible.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('VideoPlayer', {
      episodeId: episode.id,
      episodeTitle: episode.title,
      animeTitle: animeData?.title || animeTitle,
      episodeNumber: episode.episodeNumber,
    });
  }, [navigation, animeData, animeTitle]);

  const handleLanguageToggle = useCallback(() => {
    setSelectedLanguage(prev => prev === 'vf' ? 'vostfr' : 'vf');
  }, []);

  const correctEpisodeNumber = useCallback((episodeNumber: number, originalEpisode: AnimeSamaEpisode) => {
    // Correction spéciale pour One Piece Saga 11
    if (animeId.includes('one-piece') && selectedSeason === 11) {
      // Utiliser le numéro d'épisode corrigé s'il est déjà présent
      if (originalEpisode.episodeNumber >= 1087) {
        return originalEpisode.episodeNumber;
      }
      // Sinon appliquer la correction
      return episodeNumber + 1026;
    }
    return episodeNumber;
  }, [animeId, selectedSeason]);

  const renderEpisodeItem = useCallback(({ item: episode }: { item: AnimeSamaEpisode }) => {
    const correctedNumber = correctEpisodeNumber(episode.episodeNumber, episode);
    
    return (
      <TouchableOpacity
        style={[styles.episodeCard, !episode.available && styles.episodeUnavailable]}
        onPress={() => handleEpisodePress(episode)}
        disabled={!episode.available}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={episode.available 
            ? ['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']
            : ['rgba(128, 128, 128, 0.1)', 'rgba(64, 64, 64, 0.1)']
          }
          style={styles.episodeGradient}
        >
          <View style={styles.episodeInfo}>
            <Text style={[styles.episodeNumber, !episode.available && styles.episodeNumberUnavailable]}>
              Épisode {correctedNumber}
            </Text>
            <Text style={[styles.episodeTitle, !episode.available && styles.episodeTitleUnavailable]} numberOfLines={2}>
              {episode.title || `Épisode ${correctedNumber}`}
            </Text>
            <View style={styles.episodeLanguage}>
              <Text style={[styles.languageText, !episode.available && styles.languageTextUnavailable]}>
                {selectedLanguage.toUpperCase()}
              </Text>
              {episode.available ? (
                <Ionicons name="play-circle" size={24} color="#00D4FF" />
              ) : (
                <Ionicons name="lock-closed" size={24} color="#666" />
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [handleEpisodePress, correctEpisodeNumber, selectedLanguage]);

  if (animeLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Chargement de l'anime...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Anime non trouvé</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 64, 175, 0.95)']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {animeData.title}
        </Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* Anime Info */}
        <View style={styles.animeInfoSection}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
            style={styles.infoCard}
          >
            <Image
              source={{ uri: animeData.image || 'https://via.placeholder.com/200x280?text=No+Image' }}
              style={styles.animeImage}
              resizeMode="cover"
            />
            <View style={styles.animeDetails}>
              <Text style={styles.animeTitle}>{animeData.title}</Text>
              <Text style={styles.animeStatus}>
                {animeData.status} • {animeData.type}
              </Text>
              {animeData.year && (
                <Text style={styles.animeYear}>Année: {animeData.year}</Text>
              )}
              {animeData.genres && animeData.genres.length > 0 && (
                <View style={styles.genresContainer}>
                  {animeData.genres.slice(0, 3).map((genre, index) => (
                    <View key={index} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              )}
              {animeData.progressInfo && (
                <View style={styles.progressSection}>
                  <Text style={styles.progressText}>
                    {animeData.progressInfo.totalEpisodes} épisodes au total
                  </Text>
                  <Text style={styles.advancementText}>
                    Statut: {animeData.progressInfo.advancement}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Langue audio</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'vostfr' && styles.languageButtonActive
              ]}
              onPress={() => setSelectedLanguage('vostfr')}
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
              onPress={() => setSelectedLanguage('vf')}
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

        {/* Season Selection */}
        {animeData.seasons && animeData.seasons.length > 1 && (
          <View style={styles.seasonSection}>
            <Text style={styles.sectionTitle}>Saisons</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {animeData.seasons.map((season) => (
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
                    Saison {season.number}
                  </Text>
                  <Text style={styles.seasonEpisodeCount}>
                    {season.episodeCount} épisodes
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Episodes List */}
        <View style={styles.episodesSection}>
          <Text style={styles.sectionTitle}>
            Épisodes - Saison {selectedSeason} ({selectedLanguage.toUpperCase()})
          </Text>
          {episodesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00D4FF" />
              <Text style={styles.loadingText}>Chargement des épisodes...</Text>
            </View>
          ) : episodes.length > 0 ? (
            <FlatList
              data={episodes}
              renderItem={renderEpisodeItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.episodeSeparator} />}
            />
          ) : (
            <View style={styles.noEpisodesContainer}>
              <Ionicons name="film" size={48} color="#666" />
              <Text style={styles.noEpisodesText}>
                Aucun épisode disponible en {selectedLanguage.toUpperCase()} pour cette saison
              </Text>
            </View>
          )}
        </View>

        {/* One Piece Correction Info */}
        {animeId.includes('one-piece') && selectedSeason === 11 && (
          <View style={styles.correctionInfo}>
            <LinearGradient
              colors={['rgba(255, 193, 7, 0.1)', 'rgba(255, 152, 0, 0.1)']}
              style={styles.correctionCard}
            >
              <Ionicons name="information-circle" size={24} color="#FFC107" />
              <Text style={styles.correctionText}>
                Correction One Piece: Les numéros d'épisodes affichés correspondent à la numérotation officielle (1087-1122) pour une meilleure synchronisation.
              </Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
  },
  headerSpacer: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  animeInfoSection: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  animeImage: {
    width: 120,
    height: 160,
    borderRadius: 10,
  },
  animeDetails: {
    flex: 1,
    marginLeft: 15,
  },
  animeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  animeStatus: {
    fontSize: 14,
    color: '#00D4FF',
    marginBottom: 5,
  },
  animeYear: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  genreTag: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  genreText: {
    fontSize: 11,
    color: '#00D4FF',
  },
  progressSection: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 3,
  },
  advancementText: {
    fontSize: 12,
    color: '#FFC107',
  },
  languageSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 15,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderColor: '#00D4FF',
  },
  flagIcon: {
    width: 20,
    height: 15,
    marginRight: 8,
  },
  languageButtonText: {
    color: '#ccc',
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: '#00D4FF',
  },
  seasonSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  seasonButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  seasonButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderColor: '#00D4FF',
  },
  seasonButtonText: {
    color: '#ccc',
    fontWeight: '600',
    marginBottom: 2,
  },
  seasonButtonTextActive: {
    color: '#00D4FF',
  },
  seasonEpisodeCount: {
    fontSize: 11,
    color: '#999',
  },
  episodesSection: {
    padding: 20,
    paddingTop: 0,
  },
  episodeCard: {
    marginBottom: 10,
  },
  episodeUnavailable: {
    opacity: 0.5,
  },
  episodeGradient: {
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  episodeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00D4FF',
    minWidth: 100,
  },
  episodeNumberUnavailable: {
    color: '#666',
  },
  episodeTitle: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    marginHorizontal: 10,
  },
  episodeTitleUnavailable: {
    color: '#666',
  },
  episodeLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    fontSize: 12,
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  languageTextUnavailable: {
    color: '#666',
  },
  episodeSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#ccc',
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#00D4FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noEpisodesContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noEpisodesText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  correctionInfo: {
    padding: 20,
    paddingTop: 0,
  },
  correctionCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  correctionText: {
    flex: 1,
    color: '#FFC107',
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default AnimeDetailScreen;