import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
}

interface AnimeDetails {
  id: string;
  title: string;
  description: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: Season[];
  url: string;
}

interface Season {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface AnimeSamaScreenProps {
  navigation: any;
}

const AnimeSamaScreen: React.FC<AnimeSamaScreenProps> = ({ navigation }) => {
  const [currentView, setCurrentView] = useState<'search' | 'anime' | 'player'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://api-anime-sama.onrender.com';

  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`);
      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Erreur de recherche');
      }

      setSearchResults(apiResponse.data || []);
    } catch (err) {
      console.error('Erreur de recherche:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getAnimeDetails = async (animeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/anime/${animeId}`);
      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Erreur lors du chargement des détails');
      }

      setSelectedAnime(apiResponse.data);
      setCurrentView('anime');
    } catch (err) {
      console.error('Erreur détails anime:', err);
      setError('Erreur lors du chargement des détails. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchAnimes(searchQuery);
  };

  const renderSearchView = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.title}>Anime-Sama Streaming</Text>
      <Text style={styles.subtitle}>Recherchez et regardez vos animes préférés</Text>

      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un anime..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {searchResults.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={styles.resultCard}
            onPress={() => getAnimeDetails(result.id)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.resultCardGradient}
            >
              <View style={styles.resultContent}>
                {result.image && (
                  <Image source={{ uri: result.image }} style={styles.resultImage} />
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={2}>{result.title}</Text>
                  <Text style={styles.resultType}>{result.type}</Text>
                  <Text style={styles.resultStatus}>{result.status}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAnimeDetails = () => {
    if (!selectedAnime) return null;

    return (
      <View style={styles.animeContainer}>
        <View style={styles.animeHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCurrentView('search')}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.animeTitle} numberOfLines={2}>{selectedAnime.title}</Text>
        </View>

        <ScrollView style={styles.animeContent} showsVerticalScrollIndicator={false}>
          {selectedAnime.image && (
            <Image source={{ uri: selectedAnime.image }} style={styles.animeImage} />
          )}

          <View style={styles.animeInfo}>
            <Text style={styles.animeDescription}>{selectedAnime.description}</Text>
            
            <View style={styles.animeMetadata}>
              <Text style={styles.metadataLabel}>Statut:</Text>
              <Text style={styles.metadataValue}>{selectedAnime.status}</Text>
            </View>

            <View style={styles.animeMetadata}>
              <Text style={styles.metadataLabel}>Année:</Text>
              <Text style={styles.metadataValue}>{selectedAnime.year}</Text>
            </View>

            {selectedAnime.genres && selectedAnime.genres.length > 0 && (
              <View style={styles.genresContainer}>
                <Text style={styles.genresLabel}>Genres:</Text>
                <View style={styles.genresList}>
                  {selectedAnime.genres.map((genre, index) => (
                    <View key={index} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedAnime.seasons && selectedAnime.seasons.length > 0 && (
              <View style={styles.seasonsContainer}>
                <Text style={styles.seasonsLabel}>Saisons disponibles:</Text>
                {selectedAnime.seasons.map((season) => (
                  <TouchableOpacity key={season.number} style={styles.seasonCard}>
                    <LinearGradient
                      colors={['rgba(0, 195, 255, 0.1)', 'rgba(255, 0, 255, 0.1)']}
                      style={styles.seasonCardGradient}
                    >
                      <View style={styles.seasonInfo}>
                        <Text style={styles.seasonName}>{season.name}</Text>
                        <Text style={styles.seasonEpisodes}>{season.episodeCount} épisodes</Text>
                        <View style={styles.languagesContainer}>
                          {season.languages.map((lang, index) => (
                            <View key={index} style={styles.languageTag}>
                              <Text style={styles.languageText}>{lang}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <Ionicons name="play-circle" size={32} color="#00c3ff" />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        style={styles.backgroundGradient}
      >
        {currentView === 'search' && renderSearchView()}
        {currentView === 'anime' && renderAnimeDetails()}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
    backgroundColor: '#00c3ff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resultsContainer: {
    flex: 1,
  },
  resultCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultCardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  resultContent: {
    flexDirection: 'row',
    padding: 12,
  },
  resultImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultType: {
    color: '#00c3ff',
    fontSize: 12,
    marginBottom: 2,
  },
  resultStatus: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  animeContainer: {
    flex: 1,
  },
  animeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  animeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  animeContent: {
    flex: 1,
  },
  animeImage: {
    width: width,
    height: width * 0.6,
    resizeMode: 'cover',
  },
  animeInfo: {
    padding: 16,
  },
  animeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  animeMetadata: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  metadataValue: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  genresContainer: {
    marginTop: 16,
  },
  genresLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: 'rgba(0, 195, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 195, 255, 0.3)',
  },
  genreText: {
    color: '#00c3ff',
    fontSize: 12,
  },
  seasonsContainer: {
    marginTop: 24,
  },
  seasonsLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  seasonCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  seasonCardGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  seasonInfo: {
    flex: 1,
  },
  seasonName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  seasonEpisodes: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  languagesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  languageTag: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.3)',
  },
  languageText: {
    color: '#ff00ff',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default AnimeSamaScreen;