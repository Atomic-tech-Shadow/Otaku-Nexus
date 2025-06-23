import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { apiService, AnimeSamaAnime } from '../services/api';
import AppHeader from '../components/AppHeader';

const AnimeSamaScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<AnimeSamaAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: trendingAnime = [], isLoading: trendingLoading, refetch: refetchTrending } = useQuery({
    queryKey: ["trendingAnime"],
    queryFn: () => apiService.getTrendingAnime(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });

  const { data: catalogueAnime = [], isLoading: catalogueLoading, refetch: refetchCatalogue } = useQuery({
    queryKey: ["catalogueAnime"],
    queryFn: () => apiService.getCatalogue(),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 3,
  });

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiService.searchAnime(searchQuery.trim());
      setSearchResults(results);
      
      if (results.length === 0) {
        Alert.alert(
          'Aucun résultat',
          `Aucun anime trouvé pour "${searchQuery}". Essayez avec d'autres termes.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert(
        'Erreur de recherche',
        'Impossible de rechercher les animes. Vérifiez votre connexion.',
        [{ text: 'OK' }]
      );
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
      await Promise.all([
        refetchTrending(),
        refetchCatalogue(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchTrending, refetchCatalogue]);

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
        {/* Header Section */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 64, 175, 0.95)']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Anime-Sama Mobile</Text>
          <Text style={styles.headerSubtitle}>
            Streaming authentique synchronisé avec le site web
          </Text>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Rechercher un anime</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Nom de l'anime..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="search" size={20} color="#fff" />
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