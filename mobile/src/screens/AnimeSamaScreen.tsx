import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
}

export default function AnimeSamaScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Recherche avec debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Catalogue des animes populaires
  const { data: catalogueAnimes = [], isLoading: catalogueLoading } = useQuery({
    queryKey: ['/api/anime-sama/catalogue'],
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Résultats de recherche
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/anime-sama/search', debouncedQuery],
    enabled: debouncedQuery.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleAnimePress = useCallback((anime: AnimeSamaAnime) => {
    (navigation as any).navigate('AnimeDetail', { 
      animeId: anime.id,
      animeTitle: anime.title,
      animeImage: anime.image 
    });
  }, [navigation]);

  const renderAnimeCard = useCallback((anime: AnimeSamaAnime, index: number) => (
    <TouchableOpacity
      key={`${anime.id}-${index}`}
      style={styles.animeCard}
      onPress={() => handleAnimePress(anime)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <Image
          source={{ uri: anime.image || 'https://via.placeholder.com/300x400' }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.animeTitle} numberOfLines={2}>
            {anime.title}
          </Text>
          <View style={styles.animeInfo}>
            <Text style={styles.animeType}>{anime.type}</Text>
            <Text style={styles.animeStatus}>{anime.status}</Text>
          </View>
          {anime.progressInfo && (
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {anime.progressInfo.totalEpisodes} épisodes
              </Text>
              {anime.progressInfo.hasFilms && (
                <View style={styles.filmBadge}>
                  <Text style={styles.filmText}>FILMS</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [handleAnimePress]);

  const displayedAnimes = (debouncedQuery.length > 2 ? searchResults : catalogueAnimes) as AnimeSamaAnime[];
  const isLoading = debouncedQuery.length > 2 ? searchLoading : catalogueLoading;

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
          <Text style={styles.headerTitle}>Anime-Sama</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un anime..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4FF" />
            <Text style={styles.loadingText}>
              {debouncedQuery.length > 2 ? 'Recherche en cours...' : 'Chargement du catalogue...'}
            </Text>
          </View>
        ) : !displayedAnimes || displayedAnimes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>
              {debouncedQuery.length > 2 ? 'Aucun résultat' : 'Catalogue vide'}
            </Text>
            <Text style={styles.emptyText}>
              {debouncedQuery.length > 2 
                ? `Aucun anime trouvé pour "${debouncedQuery}"`
                : 'Le catalogue est en cours de chargement'
              }
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {debouncedQuery.length > 2 
                  ? `Résultats pour "${debouncedQuery}" (${displayedAnimes?.length || 0})`
                  : `Catalogue Anime-Sama (${displayedAnimes?.length || 0})`
                }
              </Text>
            </View>
            
            <View style={styles.animeGrid}>
              {displayedAnimes?.map((anime, index) => renderAnimeCard(anime, index))}
            </View>
          </>
        )}
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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    color: '#00D4FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  animeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  animeCard: {
    width: (width - 30) / 2,
    marginHorizontal: 5,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardGradient: {
    position: 'relative',
  },
  animeImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  animeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 18,
  },
  animeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  animeType: {
    color: '#00D4FF',
    fontSize: 12,
    fontWeight: '600',
  },
  animeStatus: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '600',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#fff',
    fontSize: 11,
  },
  filmBadge: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filmText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});