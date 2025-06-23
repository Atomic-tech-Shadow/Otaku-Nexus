import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { apiService, AnimeSamaAnime } from '../services/api';
import AppHeader from '../components/AppHeader';

const { width: screenWidth } = Dimensions.get('window');

const AnimeSamaScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<AnimeSamaAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState<'catalogue' | 'trending' | 'search'>('catalogue');
  const [showEmptyResults, setShowEmptyResults] = useState(false);

  // Synchronisation avec les queries du site web
  const { data: trendingAnime = [], isLoading: trendingLoading, refetch: refetchTrending, error: trendingError } = useQuery({
    queryKey: ["anime-sama", "trending"],
    queryFn: () => apiService.getTrendingAnime(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    enabled: currentView === 'trending',
  });

  const { data: catalogueAnime = [], isLoading: catalogueLoading, refetch: refetchCatalogue, error: catalogueError } = useQuery({
    queryKey: ["anime-sama", "catalogue"],
    queryFn: () => apiService.getCatalogue(),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 3,
    enabled: currentView === 'catalogue',
  });

  // Auto-load catalogue au démarrage (comme le site web)
  useEffect(() => {
    if (currentView === 'catalogue' && catalogueAnime.length === 0 && !catalogueLoading) {
      refetchCatalogue();
    }
  }, [currentView, catalogueAnime.length, catalogueLoading, refetchCatalogue]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowEmptyResults(false);
      setCurrentView('catalogue');
      return;
    }

    setIsSearching(true);
    setCurrentView('search');
    setShowEmptyResults(false);
    
    try {
      const results = await apiService.searchAnime(searchQuery.trim());
      setSearchResults(results);
      setShowEmptyResults(results.length === 0);
      
      if (results.length === 0) {
        setTimeout(() => {
          Alert.alert(
            'Aucun résultat',
            `Aucun anime trouvé pour "${searchQuery}". Essayez avec d'autres termes de recherche.`,
            [
              { text: 'Catalogue', onPress: () => setCurrentView('catalogue') },
              { text: 'OK' }
            ]
          );
        }, 500);
      }
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert(
        'Erreur de recherche',
        'Impossible de rechercher les animes. Vérifiez votre connexion internet.',
        [
          { text: 'Réessayer', onPress: () => handleSearch() },
          { text: 'Annuler', onPress: () => setCurrentView('catalogue') }
        ]
      );
      setCurrentView('catalogue');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleAnimePress = useCallback((anime: AnimeSamaAnime) => {
    navigation.navigate('AnimeDetail', { 
      animeId: anime.id,
      animeTitle: anime.title,
      anime: anime 
    });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh selon la vue actuelle (comme le site web)
      if (currentView === 'search') {
        await handleSearch();
      } else if (currentView === 'trending') {
        await refetchTrending();
      } else {
        await refetchCatalogue();
      }
      
      // Clear cache si nécessaire
      apiService.clearCache();
    } catch (error) {
      console.error('Refresh failed:', error);
      Alert.alert(
        'Erreur de rafraîchissement',
        'Impossible de rafraîchir les données. Vérifiez votre connexion.',
        [{ text: 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  }, [currentView, handleSearch, refetchTrending, refetchCatalogue]);

  const renderAnimeCard = useCallback(({ item: anime }: { item: AnimeSamaAnime }) => (
    <TouchableOpacity
      style={styles.animeCard}
      onPress={() => handleAnimePress(anime)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
        style={styles.cardGradient}
      >
        <Image
          source={{ uri: anime.image || 'https://via.placeholder.com/150x200?text=No+Image' }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        <View style={styles.animeInfo}>
          <Text style={styles.animeTitle} numberOfLines={2}>
            {anime.title}
          </Text>
          <Text style={styles.animeStatus}>
            {anime.status} • {anime.type}
          </Text>
          {anime.year && (
            <Text style={styles.animeYear}>{anime.year}</Text>
          )}
          {anime.progressInfo && (
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {anime.progressInfo.totalEpisodes} épisodes
              </Text>
              {anime.progressInfo.advancement && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {anime.progressInfo.advancement}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [handleAnimePress]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00D4FF']}
            tintColor="#00D4FF"
          />
        }
      >
        {/* Header Section - Style authentique anime-sama.fr */}
        <LinearGradient
          colors={['#000000', '#1a1a1a']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🔍 Anime-Sama</Text>
            <Text style={styles.headerSubtitle}>
              Streaming authentique • Données réelles
            </Text>
            <Text style={styles.headerInfo}>
              {currentView === 'catalogue' && `${catalogueAnime.length} animes disponibles`}
              {currentView === 'trending' && `${trendingAnime.length} animes populaires`}
              {currentView === 'search' && `${searchResults.length} résultats`}
            </Text>
          </View>
        </LinearGradient>

        {/* Navigation Tabs - Synchronisé avec le site web */}
        <View style={styles.navigationTabs}>
          <TouchableOpacity
            style={[styles.navTab, currentView === 'catalogue' && styles.navTabActive]}
            onPress={() => setCurrentView('catalogue')}
          >
            <Ionicons 
              name="library" 
              size={20} 
              color={currentView === 'catalogue' ? '#00D4FF' : '#666'} 
            />
            <Text style={[styles.navTabText, currentView === 'catalogue' && styles.navTabTextActive]}>
              Catalogue
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navTab, currentView === 'trending' && styles.navTabActive]}
            onPress={() => setCurrentView('trending')}
          >
            <Ionicons 
              name="trending-up" 
              size={20} 
              color={currentView === 'trending' ? '#00D4FF' : '#666'} 
            />
            <Text style={[styles.navTabText, currentView === 'trending' && styles.navTabTextActive]}>
              Tendances
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navTab, currentView === 'search' && styles.navTabActive]}
            onPress={() => {
              setCurrentView('search');
              if (searchQuery.trim()) handleSearch();
            }}
          >
            <Ionicons 
              name="search" 
              size={20} 
              color={currentView === 'search' ? '#00D4FF' : '#666'} 
            />
            <Text style={[styles.navTabText, currentView === 'search' && styles.navTabTextActive]}>
              Recherche
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Section - Toujours visible comme le site web */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un anime... (ex: One Piece, Naruto)"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="words"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setCurrentView('catalogue');
                    setShowEmptyResults(false);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.searchButton, isSearching && styles.searchButtonDisabled]} 
              onPress={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Rechercher</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Résultats de recherche ({searchResults.length})
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderAnimeCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Trending Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="trending-up" size={20} color="#00D4FF" /> Tendances
          </Text>
          {trendingLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00D4FF" />
              <Text style={styles.loadingText}>Chargement des tendances...</Text>
            </View>
          ) : (
            <FlatList
              data={trendingAnime.slice(0, 10)}
              renderItem={renderAnimeCard}
              keyExtractor={(item) => `trending-${item.id}`}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Catalogue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="library" size={20} color="#00D4FF" /> Catalogue complet
          </Text>
          {catalogueLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00D4FF" />
              <Text style={styles.loadingText}>Chargement du catalogue...</Text>
            </View>
          ) : (
            <FlatList
              data={catalogueAnime.slice(0, 20)}
              renderItem={renderAnimeCard}
              keyExtractor={(item) => `catalogue-${item.id}`}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
            style={styles.infoCard}
          >
            <Ionicons name="information-circle" size={48} color="#00D4FF" />
            <Text style={styles.infoTitle}>Fonctionnalités synchronisées</Text>
            <Text style={styles.infoDescription}>
              • Catalogue authentique d'animes{'\n'}
              • Correction One Piece (Saga 11 = épisodes 1087-1122){'\n'}
              • Langues VF et VOSTFR disponibles{'\n'}
              • Cache intelligent avec fallbacks{'\n'}
              • Lecteur vidéo optimisé mobile
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  searchSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  searchButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  section: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  animeCard: {
    width: '48%',
    marginBottom: 15,
  },
  cardGradient: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  animeImage: {
    width: '100%',
    height: 180,
  },
  animeInfo: {
    padding: 12,
  },
  animeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  animeStatus: {
    fontSize: 12,
    color: '#00D4FF',
    marginBottom: 3,
  },
  animeYear: {
    fontSize: 11,
    color: '#999',
    marginBottom: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 11,
    color: '#ccc',
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#ccc',
    marginTop: 10,
    fontSize: 14,
  },
  infoSection: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AnimeSamaScreen;