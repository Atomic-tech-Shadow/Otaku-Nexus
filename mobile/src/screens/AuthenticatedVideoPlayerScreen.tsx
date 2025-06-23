import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService, AnimeSamaEpisodeDetail } from '../services/api';
import * as WebBrowser from 'expo-web-browser';

const { width: screenWidth } = Dimensions.get('window');

const AuthenticatedVideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { episodeId, episodeTitle, animeTitle, episodeNumber } = route.params as {
    episodeId: string;
    episodeTitle: string;
    animeTitle: string;
    episodeNumber: number;
  };

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [selectedServer, setSelectedServer] = useState(0);

  const { data: episodeData, isLoading: episodeLoading, error } = useQuery({
    queryKey: ["episodeDetail", episodeId],
    queryFn: () => apiService.getEpisodeDetails(episodeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });

  const handlePlayVideo = useCallback(async (sourceIndex = 0) => {
    if (!episodeData?.sources?.length) {
      Alert.alert('Erreur', 'Aucune source vidéo disponible');
      return;
    }

    setIsPlayingVideo(true);
    try {
      // Utiliser l'embed URL en priorité pour reproduire le comportement anime-sama.fr
      const source = episodeData.sources[sourceIndex];
      const videoUrl = episodeData.embedUrl || source.embedUrl || source.url;
      
      if (!videoUrl) {
        Alert.alert('Erreur', 'URL vidéo non disponible pour cette source');
        return;
      }

      // Ouvrir dans le navigateur intégré avec les paramètres optimisés
      await WebBrowser.openBrowserAsync(videoUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: false,
        toolbarColor: '#000000',
        controlsColor: '#00D4FF',
        enableBarCollapsing: true,
        showInRecents: false,
      });
    } catch (error) {
      console.error('Error playing video:', error);
      Alert.alert(
        'Erreur de lecture',
        'Impossible de lire la vidéo. Vérifiez votre connexion internet.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPlayingVideo(false);
    }
  }, [episodeData]);

  const handleServerChange = useCallback((serverIndex: number) => {
    setSelectedServer(serverIndex);
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

  if (error || !episodeData) {
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
          <Ionicons name="alert-circle" size={64} color="#ff4444" />
          <Text style={styles.errorText}>
            Impossible de charger cet épisode
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
        colors={['rgba(0, 0, 0, 0.95)', 'rgba(30, 64, 175, 0.95)']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {animeTitle}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Épisode {episodeNumber} • {episodeData.language?.toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lecteur vidéo authentique */}
        <View style={styles.playerSection}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
            style={styles.playerCard}
          >
            <View style={styles.playerHeader}>
              <Ionicons name="play-circle" size={24} color="#00D4FF" />
              <Text style={styles.playerTitle}>
                {episodeData.title || `Épisode ${episodeNumber}`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.playButton, isPlayingVideo && styles.playButtonDisabled]}
              onPress={() => handlePlayVideo(selectedServer)}
              disabled={isPlayingVideo}
            >
              {isPlayingVideo ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="play" size={32} color="#fff" />
              )}
              <Text style={styles.playButtonText}>
                {isPlayingVideo ? 'Ouverture...' : 'Regarder l\'épisode'}
              </Text>
            </TouchableOpacity>

            {/* Sélection de serveur */}
            {episodeData.sources && episodeData.sources.length > 1 && (
              <View style={styles.serverSection}>
                <Text style={styles.serverTitle}>Serveurs disponibles:</Text>
                <View style={styles.serverList}>
                  {episodeData.sources.map((source, index) => (
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
                        {source.server || `Serveur ${index + 1}`}
                      </Text>
                      <Text style={styles.serverQuality}>
                        {source.quality || 'HD'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Informations de l'épisode */}
        <View style={styles.infoSection}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.05)', 'rgba(30, 64, 175, 0.05)']}
            style={styles.infoCard}
          >
            <Text style={styles.infoTitle}>Informations</Text>
            <View style={styles.infoRow}>
              <Ionicons name="tv" size={16} color="#00D4FF" />
              <Text style={styles.infoText}>Anime: {animeTitle}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="play-circle" size={16} color="#00D4FF" />
              <Text style={styles.infoText}>Épisode: {episodeNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="language" size={16} color="#00D4FF" />
              <Text style={styles.infoText}>
                Langue: {episodeData.language === 'vf' ? 'Français (VF)' : 'Japonais (VOSTFR)'}
              </Text>
            </View>
            {episodeData.sources && (
              <View style={styles.infoRow}>
                <Ionicons name="server" size={16} color="#00D4FF" />
                <Text style={styles.infoText}>
                  {episodeData.sources.length} serveur{episodeData.sources.length > 1 ? 's' : ''} disponible{episodeData.sources.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Note mobile */}
        <View style={styles.noteSection}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
            style={styles.noteCard}
          >
            <Ionicons name="phone-portrait" size={24} color="#00D4FF" />
            <Text style={styles.noteText}>
              Le lecteur vidéo s'ouvre dans le navigateur intégré pour une expérience optimisée similaire à anime-sama.fr
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#00D4FF',
    fontSize: 14,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerSection: {
    padding: 16,
  },
  playerCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  playerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  playButton: {
    backgroundColor: '#00D4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 16,
  },
  playButtonDisabled: {
    backgroundColor: 'rgba(0, 212, 255, 0.5)',
  },
  playButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  serverSection: {
    marginTop: 16,
  },
  serverTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serverList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serverButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  serverButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderColor: '#00D4FF',
  },
  serverButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  serverButtonTextActive: {
    color: '#00D4FF',
  },
  serverQuality: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  noteSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  noteText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default AuthenticatedVideoPlayerScreen;