import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get('window');

interface EpisodeSource {
  url: string;
  server: string;
  serverName?: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
  embedUrl?: string;
}

interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: EpisodeSource[];
  embedUrl?: string;
  availableServers: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function VideoPlayerScreen({ navigation }: any) {
  const route = useRoute();
  const { episodeId, animeTitle, episodeTitle, episodeNumber } = route.params as {
    episodeId: string;
    animeTitle: string;
    episodeTitle: string;
    episodeNumber: number;
  };

  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [selectedServer, setSelectedServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const API_BASE = 'https://api-anime-sama.onrender.com';

  useEffect(() => {
    loadEpisodeDetails();
  }, [episodeId]);

  const loadEpisodeDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/episode/${episodeId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }).catch(fetchError => {
        console.warn('Mobile episode fetch failed:', fetchError.message);
        throw new Error(`Erreur réseau: ${fetchError.message}`);
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json().catch(jsonError => {
        console.warn('Mobile episode JSON parsing failed:', jsonError.message);
        throw new Error('Format de réponse invalide');
      });

      if (apiResponse && apiResponse.success && apiResponse.data) {
        setEpisodeDetails(apiResponse.data);
        console.log(`Mobile loaded episode details for ${episodeId}`);
      } else {
        // Fallback: utiliser l'endpoint embed comme sur le web
        const fallbackData: EpisodeDetails = {
          id: episodeId,
          title: episodeTitle,
          animeTitle: animeTitle,
          episodeNumber: episodeNumber,
          sources: [
            {
              url: `/api/embed/${episodeId}`,
              server: 'Universal',
              serverName: 'Lecteur Universel - Mobile',
              quality: 'HD',
              language: 'VOSTFR',
              type: 'embed',
              serverIndex: 0,
              embedUrl: `/api/embed/${episodeId}`
            }
          ],
          embedUrl: `/api/embed/${episodeId}`,
          availableServers: ['Universal']
        };
        
        setEpisodeDetails(fallbackData);
        console.log(`Mobile using embed fallback for ${episodeId}`);
      }

    } catch (err: any) {
      console.warn('Mobile episode details error:', err.message);
      setError('Impossible de charger la vidéo. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSource = (): EpisodeSource | null => {
    if (!episodeDetails || !episodeDetails.sources) return null;
    return episodeDetails.sources[selectedServer] || episodeDetails.sources[0] || null;
  };

  const getEmbedUrl = (): string => {
    const source = getCurrentSource();
    if (!source) return '';
    
    // Utiliser l'embedUrl si disponible, sinon construire l'URL
    const embedUrl = source.embedUrl || episodeDetails?.embedUrl || `/api/embed/${episodeId}`;
    return embedUrl.startsWith('http') ? embedUrl : `${API_BASE}${embedUrl}`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    StatusBar.setHidden(!isFullscreen);
  };

  const handleServerChange = (serverIndex: number) => {
    if (episodeDetails && serverIndex < episodeDetails.sources.length) {
      setSelectedServer(serverIndex);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4FF" />
            <Text style={styles.loadingText}>Chargement de la vidéo...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !episodeDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadEpisodeDetails}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const videoContainerStyle = isFullscreen ? styles.fullscreenContainer : styles.videoContainer;

  return (
    <SafeAreaView style={[styles.container, isFullscreen && styles.fullscreenSafeArea]}>
      <LinearGradient colors={['#0f0f0f', '#1a1a1a', '#000000']} style={styles.gradient}>
        {!isFullscreen && (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {animeTitle}
              </Text>
              <Text style={styles.headerSubtitle}>
                Épisode {episodeNumber}
              </Text>
            </View>
            <TouchableOpacity style={styles.fullscreenToggle} onPress={toggleFullscreen}>
              <Ionicons name="expand" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <View style={videoContainerStyle}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={80} color="#00D4FF" />
            <Text style={styles.videoPlaceholderText}>Lecteur Vidéo Mobile</Text>
            <Text style={styles.videoPlaceholderSubtext}>
              {animeTitle} - Épisode {episodeNumber}
            </Text>
            <TouchableOpacity 
              style={styles.openBrowserButton}
              onPress={() => {
                const embedUrl = getEmbedUrl();
                Linking.openURL(embedUrl).catch(err => {
                  console.warn('Failed to open URL:', err);
                  Alert.alert('Erreur', 'Impossible d\'ouvrir le lecteur vidéo');
                });
              }}
            >
              <Ionicons name="open-outline" size={20} color="white" />
              <Text style={styles.openBrowserText}>Ouvrir dans le navigateur</Text>
            </TouchableOpacity>
          </View>
          
          {isFullscreen && (
            <TouchableOpacity style={styles.fullscreenExit} onPress={toggleFullscreen}>
              <Ionicons name="contract" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {!isFullscreen && (
          <>
            {/* Server Selection */}
            {episodeDetails.sources && episodeDetails.sources.length > 1 && (
              <View style={styles.serverSection}>
                <Text style={styles.sectionTitle}>Serveurs disponibles</Text>
                <View style={styles.serverButtons}>
                  {episodeDetails.sources.map((source, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.serverButton,
                        selectedServer === index && styles.serverButtonActive
                      ]}
                      onPress={() => handleServerChange(index)}
                    >
                      <Text style={[
                        styles.serverButtonText,
                        selectedServer === index && styles.serverButtonTextActive
                      ]}>
                        {source.serverName || `Serveur ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Episode Info */}
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle}>{episodeDetails.title}</Text>
              <Text style={styles.episodeDescription}>
                {animeTitle} - Épisode {episodeNumber}
              </Text>
            </View>
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreenSafeArea: {
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  fullscreenToggle: {
    padding: 8,
  },
  videoContainer: {
    height: height * 0.3,
    backgroundColor: '#000000',
    position: 'relative',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  videoPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  videoPlaceholderSubtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  openBrowserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D4FF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  openBrowserText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fullscreenExit: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    marginBottom: 10,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  serverSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  serverButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serverButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  serverButtonActive: {
    backgroundColor: '#00D4FF',
  },
  serverButtonText: {
    color: '#CCC',
    fontSize: 12,
  },
  serverButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  episodeInfo: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  episodeDescription: {
    fontSize: 14,
    color: '#888',
  },
});