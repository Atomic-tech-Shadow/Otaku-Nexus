import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { Video } from '../types';

export default function VideosScreen({ navigation }: any) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const [videosData, popularData] = await Promise.all([
        apiService.getVideos(20),
        apiService.getPopularVideos(),
      ]);
      setVideos(videosData);
      setPopularVideos(popularData);
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Erreur', 'Impossible de charger les vidéos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const openVideo = async (video: Video) => {
    try {
      const supported = await Linking.canOpenURL(video.videoUrl);
      if (supported) {
        await Linking.openURL(video.videoUrl);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir cette vidéo');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la vidéo');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M vues`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K vues`;
    }
    return `${views} vues`;
  };

  const renderVideoItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => openVideo(item)}
    >
      {item.thumbnailUrl && (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      )}
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.videoDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}
        <View style={styles.videoMeta}>
          <Text style={styles.videoCategory}>{item.category}</Text>
          <Text style={styles.videoViews}>
            {formatViewCount(item.viewCount)}
          </Text>
          {item.duration && (
            <Text style={styles.videoDuration}>
              {formatDuration(item.duration)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPopularVideoItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.popularVideoCard}
      onPress={() => openVideo(item)}
    >
      {item.thumbnailUrl && (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.popularThumbnail} />
      )}
      <Text style={styles.popularVideoTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.popularVideoViews}>
        {formatViewCount(item.viewCount)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9b59b6', '#8e44ad']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Vidéos</Text>
        <Text style={styles.headerSubtitle}>AMVs, openings et contenus anime</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Vidéos populaires */}
        {popularVideos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vidéos populaires</Text>
            <FlatList
              data={popularVideos.slice(0, 5)}
              renderItem={renderPopularVideoItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularVideosList}
            />
          </View>
        )}

        {/* Toutes les vidéos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toutes les vidéos</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : videos.length > 0 ? (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.videosList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune vidéo disponible</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  popularVideosList: {
    paddingLeft: 4,
  },
  popularVideoCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularThumbnail: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  popularVideoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    padding: 8,
    paddingBottom: 4,
  },
  popularVideoViews: {
    fontSize: 10,
    color: '#666',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  videosList: {
    paddingBottom: 20,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 120,
    height: 90,
    resizeMode: 'cover',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  videoDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  videoCategory: {
    fontSize: 12,
    color: '#9b59b6',
    fontWeight: '600',
    backgroundColor: '#f8f4ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoViews: {
    fontSize: 12,
    color: '#666',
  },
  videoDuration: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});