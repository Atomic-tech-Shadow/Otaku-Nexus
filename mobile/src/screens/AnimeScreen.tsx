import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { Anime, AnimeFavorite } from '../types';

export default function AnimeScreen({ navigation, route }: any) {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [favorites, setFavorites] = useState<AnimeFavorite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [animesData, favoritesData] = await Promise.all([
        apiService.getTrendingAnimes(),
        apiService.getUserFavorites(),
      ]);
      setAnimes(animesData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading anime data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchMode(false);
      loadData();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await apiService.searchAnimes(searchQuery);
      setAnimes(searchResults);
      setSearchMode(true);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rechercher les anime');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (anime: Anime) => {
    try {
      const isFavorite = favorites.some(fav => fav.animeId === anime.id);
      
      if (isFavorite) {
        await apiService.removeFromFavorites(anime.id);
        setFavorites(favorites.filter(fav => fav.animeId !== anime.id));
      } else {
        const newFavorite = await apiService.addToFavorites(anime.id);
        setFavorites([...favorites, newFavorite]);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const isFavorite = (animeId: number) => {
    return favorites.some(fav => fav.animeId === animeId);
  };

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <View style={styles.animeCard}>
      <TouchableOpacity
        style={styles.animeContent}
        onPress={() => navigation.navigate('AnimeDetail', { anime: item })}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.animeImage} />
        )}
        <View style={styles.animeInfo}>
          <Text style={styles.animeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.synopsis && (
            <Text style={styles.animeSynopsis} numberOfLines={3}>
              {item.synopsis}
            </Text>
          )}
          <View style={styles.animeDetails}>
            {item.score && (
              <Text style={styles.animeScore}>★ {item.score}</Text>
            )}
            {item.year && (
              <Text style={styles.animeYear}>{item.year}</Text>
            )}
            {item.episodes && (
              <Text style={styles.animeEpisodes}>{item.episodes} épisodes</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.favoriteButton,
          isFavorite(item.id) && styles.favoriteButtonActive
        ]}
        onPress={() => toggleFavorite(item)}
      >
        <Text style={styles.favoriteButtonText}>
          {isFavorite(item.id) ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#e74c3c', '#c0392b']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Anime</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un anime..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {searchMode && (
          <View style={styles.searchInfo}>
            <Text style={styles.searchInfoText}>
              Résultats pour "{searchQuery}"
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchMode(false);
                loadData();
              }}
            >
              <Text style={styles.clearSearchText}>Effacer</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={animes}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.animeList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  searchButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  searchInfoText: {
    fontSize: 14,
    color: '#666',
  },
  clearSearchText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  animeList: {
    paddingBottom: 20,
  },
  animeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  animeContent: {
    flexDirection: 'row',
    padding: 12,
  },
  animeImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  animeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  animeSynopsis: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  animeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  animeScore: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '600',
  },
  animeYear: {
    fontSize: 12,
    color: '#666',
  },
  animeEpisodes: {
    fontSize: 12,
    color: '#666',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  favoriteButtonText: {
    fontSize: 16,
  },
});