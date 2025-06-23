import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService, AnimeSamaEpisodeDetail } from '../services/api';
import * as WebBrowser from 'expo-web-browser';

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { episodeId, episodeTitle, animeTitle, episodeNumber } = route.params as {
    episodeId: string;
    episodeTitle: string;
    animeTitle: string;
    episodeNumber: number;
  };

  const [isLoading, setIsLoading] = useState(false);

  const { data: episodeData, isLoading: episodeLoading } = useQuery({
    queryKey: ["episodeDetail", episodeId],
    queryFn: () => apiService.getEpisodeDetails(episodeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });

  const handlePlayVideo = useCallback(async (source?: any) => {
    setIsLoading(true);
    try {
      // Priorité aux sources embed pour une meilleure compatibilité
      let videoUrl = episodeData?.embedUrl;
      
      if (!videoUrl && source) {
        videoUrl = source.embedUrl || source.url;
      }
      
      if (!videoUrl && episodeData?.sources?.length > 0) {
        const bestSource = episodeData.sources.find(s => s.embedUrl) || episodeData.sources[0];
        videoUrl = bestSource.embedUrl || bestSource.url;
      }
      
      if (!videoUrl) {
        Alert.alert('Erreur', 'Aucune source vidéo disponible pour cet épisode');
        return;
      }

      // Lecture directe dans le navigateur pour reproduire le comportement anime-sama.fr
      await WebBrowser.openBrowserAsync(videoUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: '#000000',
        controlsColor: '#00D4FF',
      });
    } catch (error) {
      console.error('Error opening video:', error);
      Alert.alert(
        'Erreur de lecture',
        'Impossible d\'ouvrir le lecteur vidéo. Veuillez vérifier votre connexion.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [episodeData]);

  const handleExternalLink = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
    }
  }, []);

  if (episodeLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 64, 175, 0.95)']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Chargement...
          </Text>
          <View style={styles.headerSpacer} />
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Chargement de l'épisode...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!episodeData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 64, 175, 0.95)']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Erreur
          </Text>
          <View style={styles.headerSpacer} />
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Épisode non trouvé</Text>
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
          Épisode {episodeNumber}
        </Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.content}>
        {/* Episode Info */}
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
          style={styles.infoCard}
        >
          <View style={styles.episodeInfo}>
            <Text style={styles.animeTitle}>{animeTitle}</Text>
            <Text style={styles.episodeTitle}>
              {episodeData.title || `Épisode ${episodeNumber}`}
            </Text>
            <Text style={styles.episodeLanguage}>
              Langue: {episodeData.language.toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        {/* Video Sources */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="play-circle" size={20} color="#00D4FF" /> Sources vidéo
          </Text>
          
          {episodeData.sources && episodeData.sources.length > 0 ? (
            episodeData.sources.map((source, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sourceCard}
                onPress={() => handlePlayVideo(source)}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
                  style={styles.sourceGradient}
                >
                  <View style={styles.sourceInfo}>
                    <View style={styles.sourceHeader}>
                      <Text style={styles.serverName}>{source.server}</Text>
                      <Text style={styles.qualityBadge}>{source.quality}</Text>
                    </View>
                    <Text style={styles.sourceType}>
                      {source.type} • {source.language.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.playButton}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#00D4FF" />
                    ) : (
                      <Ionicons name="play" size={24} color="#00D4FF" />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noSourcesContainer}>
              <Ionicons name="videocam-off" size={48} color="#666" />
              <Text style={styles.noSourcesText}>
                Aucune source vidéo disponible pour cet épisode
              </Text>
            </View>
          )}
        </View>

        {/* Embed URL Fallback */}
        {episodeData.embedUrl && (
          <View style={styles.embedSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="link" size={20} color="#00D4FF" /> Lecteur intégré
            </Text>
            <TouchableOpacity
              style={styles.embedCard}
              onPress={() => handleExternalLink(episodeData.embedUrl!)}
            >
              <LinearGradient
                colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
                style={styles.embedGradient}
              >
                <Ionicons name="open-outline" size={24} color="#00D4FF" />
                <Text style={styles.embedText}>Ouvrir dans le navigateur</Text>
                <Ionicons name="chevron-forward" size={20} color="#00D4FF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* CORS Info */}
        {episodeData.corsInfo && (
          <View style={styles.corsSection}>
            <LinearGradient
              colors={['rgba(255, 193, 7, 0.1)', 'rgba(255, 152, 0, 0.1)']}
              style={styles.corsCard}
            >
              <Ionicons name="information-circle" size={24} color="#FFC107" />
              <View style={styles.corsInfo}>
                <Text style={styles.corsTitle}>Information technique</Text>
                <Text style={styles.corsText}>{episodeData.corsInfo.note}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Available Servers */}
        {episodeData.availableServers && episodeData.availableServers.length > 0 && (
          <View style={styles.serversSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="server" size={20} color="#00D4FF" /> Serveurs disponibles
            </Text>
            <View style={styles.serversList}>
              {episodeData.availableServers.map((server, index) => (
                <View key={index} style={styles.serverTag}>
                  <Text style={styles.serverText}>{server}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mobile Optimization Note */}
        <View style={styles.noteSection}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
            style={styles.noteCard}
          >
            <Ionicons name="phone-portrait" size={24} color="#00D4FF" />
            <Text style={styles.noteText}>
              Le lecteur vidéo s'ouvre dans le navigateur pour une meilleure compatibilité mobile et une expérience de visionnage optimisée.
            </Text>
          </LinearGradient>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  episodeInfo: {
    alignItems: 'center',
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00D4FF',
    textAlign: 'center',
    marginBottom: 8,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  episodeLanguage: {
    fontSize: 14,
    color: '#ccc',
  },
  sourcesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceCard: {
    marginBottom: 10,
  },
  sourceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  serverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  qualityBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    color: '#00D4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sourceType: {
    fontSize: 12,
    color: '#ccc',
  },
  playButton: {
    marginLeft: 15,
  },
  noSourcesContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noSourcesText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  embedSection: {
    marginBottom: 20,
  },
  embedCard: {
    marginBottom: 10,
  },
  embedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  embedText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
  },
  corsSection: {
    marginBottom: 20,
  },
  corsCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  corsInfo: {
    flex: 1,
    marginLeft: 15,
  },
  corsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 5,
  },
  corsText: {
    fontSize: 12,
    color: '#FFC107',
    lineHeight: 16,
  },
  serversSection: {
    marginBottom: 20,
  },
  serversList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serverTag: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  serverText: {
    fontSize: 12,
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  noteSection: {
    marginTop: 20,
  },
  noteCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#00D4FF',
    marginLeft: 15,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#ccc',
    marginTop: 15,
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
});

export default VideoPlayerScreen;