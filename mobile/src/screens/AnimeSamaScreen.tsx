import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface AnimeResult {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
  description?: string;
  genres?: string[];
  year?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

export default function AnimeSamaScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://api-anime-sama.onrender.com';

  // Client API robuste mobile synchronisé avec le site web
  const searchAnime = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }).catch(fetchError => {
        console.warn('Mobile search fetch failed:', fetchError.message);
        throw new Error(`Erreur réseau: ${fetchError.message}`);
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse = await response.json().catch(jsonError => {
        console.warn('Mobile search JSON parsing failed:', jsonError.message);
        throw new Error('Format de réponse invalide');
      });
      
      // Gestion des différents formats de réponse comme sur le web
      let resultsData = [];
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        resultsData = apiResponse.data;
      } else if (Array.isArray(apiResponse)) {
        resultsData = apiResponse;
      }
      
      setSearchResults(resultsData);
      console.log(`Mobile search found ${resultsData.length} results for "${query}"`);
      
    } catch (err: any) {
      console.warn('Mobile search error:', err.message);
      setError('Recherche temporairement indisponible. Réessayez dans quelques instants.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAnime(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAnimePress = (animeId: string) => {
    navigation.navigate('AnimeDetail', { animeId });
  };

  const renderAnimeCard = (anime: AnimeResult) => (
    <TouchableOpacity
      key={anime.id}
      style={styles.animeCard}
      onPress={() => handleAnimePress(anime.id)}
    >
      <Image
        source={{ uri: anime.image || 'https://via.placeholder.com/150x200' }}
        style={styles.animeImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.animeOverlay}
      >
        <Text style={styles.animeTitle} numberOfLines={2}>
          {anime.title}
        </Text>
        <Text style={styles.animeType}>{anime.type}</Text>
        <View style={styles.animeStatus}>
          <View style={[
            styles.statusDot,
            { backgroundColor: anime.status === 'En cours' ? '#4ECDC4' : '#FFD700' }
          ]} />
          <Text style={styles.statusText}>{anime.status}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f0f', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anime-Sama</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un anime (ex: naruto, one piece...)"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {loading && (
              <ActivityIndicator
                size="small"
                color="#00D4FF"
                style={styles.loadingIcon}
              />
            )}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Search Instructions */}
        {!searchQuery && searchResults.length === 0 && !loading && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="search" size={64} color="#333" />
            <Text style={styles.instructionsTitle}>Rechercher un anime</Text>
            <Text style={styles.instructionsText}>
              Tapez le nom de l'anime que vous souhaitez regarder
            </Text>
            <Text style={styles.examplesText}>
              Exemples : naruto, one piece, demon slayer, attack on titan
            </Text>
          </View>
        )}

        {/* Search Results */}
        <ScrollView 
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContent}
        >
          {searchResults.length > 0 && (
            <View style={styles.resultsGrid}>
              {searchResults.map(renderAnimeCard)}
            </View>
          )}

          {/* No Results */}
          {searchQuery && searchResults.length === 0 && !loading && (
            <View style={styles.noResultsContainer}>
              <Ionicons name="sad-outline" size={48} color="#666" />
              <Text style={styles.noResultsText}>
                Aucun anime trouvé pour "{searchQuery}"
              </Text>
              <Text style={styles.noResultsSubtext}>
                Essayez avec un autre terme de recherche
              </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  loadingIcon: {
    marginLeft: 10,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    margin: 20,
    padding: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  examplesText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animeCard: {
    width: (width - 60) / 2,
    height: 280,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  animeImage: {
    width: '100%',
    height: '70%',
  },
  animeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  animeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  animeType: {
    fontSize: 12,
    color: '#00D4FF',
    marginBottom: 4,
  },
  animeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#888',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  noResultsText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});