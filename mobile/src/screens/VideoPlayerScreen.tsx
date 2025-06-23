import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';

interface EpisodeSource {
  url: string;
  proxyUrl?: string;
  embedUrl?: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  language: string;
  sources: EpisodeSource[];
  embedUrl?: string;
  corsInfo?: {
    note: string;
    proxyEndpoint: string;
    embedEndpoint: string;
  };
  availableServers: string[];
  url: string;
}

export default function VideoPlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { episodeId, animeTitle, episodeNumber, episodeTitle, language } = route.params as {
    episodeId: string;
    animeTitle: string;
    episodeNumber: number;
    episodeTitle: string;
    language: 'vf' | 'vostfr';
  };

  const [selectedServer, setSelectedServer] = useState(0);

  // Détails de l'épisode avec sources de lecture
  const { data: episodeDetails, isLoading, error } = useQuery<EpisodeDetails>({
    queryKey: ['/api/anime-sama/episode', episodeId],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handlePlayVideo = useCallback(async () => {
    if (!episodeDetails?.sources?.length) {
      Alert.alert('Erreur', 'Aucune source vidéo disponible pour cet épisode.');
      return;
    }

    const source = episodeDetails.sources[selectedServer];
    if (!source) {
      Alert.alert('Erreur', 'Source vidéo sélectionnée non disponible.');
      return;
    }

    try {
      // Utilisation de l'URL embed ou proxy selon la disponibilité
      const playUrl = source.embedUrl || source.proxyUrl || source.url;
      
      // Ouverture dans le navigateur web externe
      const canOpen = await Linking.canOpenURL(playUrl);
      if (canOpen) {
        await Linking.openURL(playUrl);
      } else {
        throw new Error('Impossible d\'ouvrir l\'URL');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du lecteur:', error);
      Alert.alert(
        'Erreur de lecture',
        'Impossible d\'ouvrir le lecteur vidéo. Vérifiez votre connexion internet.'
      );
    }
  }, [episodeDetails, selectedServer]);

  const handleServerChange = useCallback((serverIndex: number) => {
    setSelectedServer(serverIndex);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#1e40af', '#000000']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00D4FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chargement...</Text>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.loadingText}>Préparation de la lecture...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !episodeDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#1e40af', '#000000']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00D4FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#ec4899" />
          <Text style={styles.errorTitle}>Épisode indisponible</Text>
          <Text style={styles.errorText}>
            Impossible de charger cet épisode. Il est peut-être temporairement indisponible.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {animeTitle}
            </Text>
            <Text style={styles.headerSubtitle}>
              Épisode {episodeNumber} • {language.toUpperCase()}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Informations de l'épisode */}
        <View style={styles.episodeInfo}>
          <Text style={styles.episodeTitle}>
            {episodeTitle || `Épisode ${episodeNumber}`}
          </Text>
          <Text style={styles.animeTitle}>{animeTitle}</Text>
        </View>

        {/* Sélection du serveur */}
        {episodeDetails.sources && episodeDetails.sources.length > 1 && (
          <View style={styles.serverSelection}>
            <Text style={styles.sectionTitle}>Serveurs disponibles</Text>
            <View style={styles.serverList}>
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
                    {source.server} ({source.quality})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bouton de lecture */}
        <View style={styles.playerContainer}>
          <LinearGradient
            colors={['#00D4FF', '#1e40af']}
            style={styles.playButton}
          >
            <TouchableOpacity
              style={styles.playButtonInner}
              onPress={handlePlayVideo}
            >
              <Ionicons name="play" size={32} color="#fff" />
              <Text style={styles.playButtonText}>Regarder l'épisode</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Informations CORS si disponibles */}
        {episodeDetails.corsInfo && (
          <View style={styles.corsInfo}>
            <View style={styles.corsHeader}>
              <Ionicons name="information-circle" size={20} color="#00D4FF" />
              <Text style={styles.corsTitle}>Information</Text>
            </View>
            <Text style={styles.corsNote}>{episodeDetails.corsInfo.note}</Text>
          </View>
        )}

        {/* Informations sur la source actuelle */}
        {episodeDetails.sources && episodeDetails.sources[selectedServer] && (
          <View style={styles.sourceInfo}>
            <Text style={styles.sectionTitle}>Source sélectionnée</Text>
            <View style={styles.sourceDetails}>
              <View style={styles.sourceRow}>
                <Text style={styles.sourceLabel}>Serveur:</Text>
                <Text style={styles.sourceValue}>
                  {episodeDetails.sources[selectedServer].server}
                </Text>
              </View>
              <View style={styles.sourceRow}>
                <Text style={styles.sourceLabel}>Qualité:</Text>
                <Text style={styles.sourceValue}>
                  {episodeDetails.sources[selectedServer].quality}
                </Text>
              </View>
              <View style={styles.sourceRow}>
                <Text style={styles.sourceLabel}>Type:</Text>
                <Text style={styles.sourceValue}>
                  {episodeDetails.sources[selectedServer].type}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeInfo: {
    marginBottom: 30,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 28,
  },
  animeTitle: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: '600',
  },
  serverSelection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#00D4FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  serverList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serverButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  serverButtonActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
  },
  serverButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  serverButtonTextActive: {
    color: '#000',
  },
  playerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  playButton: {
    borderRadius: 50,
    overflow: 'hidden',
    width: '100%',
  },
  playButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  corsInfo: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  corsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  corsTitle: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  corsNote: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  sourceInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sourceDetails: {
    gap: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceLabel: {
    color: '#666',
    fontSize: 14,
  },
  sourceValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});