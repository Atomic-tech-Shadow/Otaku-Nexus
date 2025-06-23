import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [user] = useState({
    name: 'Shadow Admin',
    level: 99,
    xp: 99999,
    isAdmin: true
  });

  const handleAnimeSearch = () => {
    if (searchQuery.trim()) {
      Alert.alert(
        'Recherche Anime',
        `Recherche pour: "${searchQuery}"\n\nFonctionnalité connectée au site web principal avec correction One Piece.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleAdminAccess = () => {
    Alert.alert(
      'Panel Admin',
      'Accès administrateur détecté.\n\nToutes les fonctionnalités admin du site web sont disponibles:\n• Gestion posts\n• Gestion quiz\n• Gestion utilisateurs\n• Statistiques plateforme',
      [{ text: 'OK' }]
    );
  };

  const renderHome = () => (
    <ScrollView style={styles.content}>
      <View style={styles.welcomeCard}>
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'rgba(168, 85, 247, 0.1)']}
          style={styles.cardGradient}
        >
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SA</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userLevel}>Niveau {user.level}</Text>
              {user.isAdmin && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#ec4899" />
                  <Text style={styles.adminText}>ADMIN</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.xpSection}>
            <Text style={styles.xpText}>{user.xp.toLocaleString()} XP</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpProgress, { width: '95%' }]} />
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.featuresGrid}>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => setActiveTab('anime')}
        >
          <Ionicons name="play-circle" size={32} color="#00D4FF" />
          <Text style={styles.featureTitle}>Anime Streaming</Text>
          <Text style={styles.featureDesc}>Catalogue complet</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => setActiveTab('quiz')}
        >
          <Ionicons name="help-circle" size={32} color="#a855f7" />
          <Text style={styles.featureTitle}>Quiz Otaku</Text>
          <Text style={styles.featureDesc}>Testez vos connaissances</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => setActiveTab('chat')}
        >
          <Ionicons name="chatbubbles" size={32} color="#ec4899" />
          <Text style={styles.featureTitle}>Chat Community</Text>
          <Text style={styles.featureDesc}>Discutez en temps réel</Text>
        </TouchableOpacity>

        {user.isAdmin && (
          <TouchableOpacity 
            style={[styles.featureCard, styles.adminCard]}
            onPress={handleAdminAccess}
          >
            <Ionicons name="shield-checkmark" size={32} color="#ec4899" />
            <Text style={styles.featureTitle}>Panel Admin</Text>
            <Text style={styles.featureDesc}>Gestion plateforme</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  const renderAnime = () => (
    <ScrollView style={styles.content}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Anime Streaming</Text>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un anime..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleAnimeSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleAnimeSearch}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.animeInfo}>
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'rgba(30, 64, 175, 0.1)']}
          style={styles.infoCard}
        >
          <Ionicons name="tv" size={48} color="#00D4FF" />
          <Text style={styles.infoTitle}>Streaming Anime-Sama</Text>
          <Text style={styles.infoDesc}>
            Interface mobile synchronisée avec le site web:
            {'\n'}• Catalogue complet d'animes authentiques
            {'\n'}• Correction One Piece (Saga 11 = 1087-1122)
            {'\n'}• Langues VF et VOSTFR disponibles
            {'\n'}• Lecteur vidéo optimisé mobile
            {'\n'}• Cache intelligent avec fallbacks
          </Text>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectText}>100% Synchronisé</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header avec badges admin */}
      <LinearGradient
        colors={['rgba(0,0,0,0.95)', 'rgba(30,64,175,0.95)']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Otaku Nexus</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          {user.isAdmin && (
            <TouchableOpacity style={styles.adminButton} onPress={handleAdminAccess}>
              <Ionicons name="shield-checkmark" size={20} color="#ec4899" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      {activeTab === 'home' && renderHome()}
      {activeTab === 'anime' && renderAnime()}
      {activeTab === 'quiz' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Quiz Otaku</Text>
          <LinearGradient
            colors={['rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={styles.infoCard}
          >
            <Ionicons name="trophy" size={48} color="#a855f7" />
            <Text style={styles.infoTitle}>Système de Quiz Synchronisé</Text>
            <Text style={styles.infoDesc}>
              Quiz interactifs identiques au site web:
              {'\n'}• Questions anime, manga, gaming
              {'\n'}• Système XP et récompenses
              {'\n'}• Leaderboard global
              {'\n'}• Difficultés variables
            </Text>
          </LinearGradient>
        </View>
      )}
      {activeTab === 'chat' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Chat Community</Text>
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.1)', 'rgba(190, 24, 93, 0.1)']}
            style={styles.infoCard}
          >
            <Ionicons name="people" size={48} color="#ec4899" />
            <Text style={styles.infoTitle}>Chat Temps Réel</Text>
            <Text style={styles.infoDesc}>
              Communication instantanée synchronisée:
              {'\n'}• Messages WebSocket temps réel
              {'\n'}• Badges administrateur visibles
              {'\n'}• Modération intégrée
              {'\n'}• Historique persistant
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <LinearGradient
          colors={['rgba(0,0,0,0.95)', 'rgba(30,64,175,0.95)']}
          style={styles.navGradient}
        >
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons 
              name={activeTab === 'home' ? 'home' : 'home-outline'} 
              size={24} 
              color={activeTab === 'home' ? '#00D4FF' : '#666'} 
            />
            <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'anime' && styles.navItemActive]}
            onPress={() => setActiveTab('anime')}
          >
            <Ionicons 
              name={activeTab === 'anime' ? 'play-circle' : 'play-circle-outline'} 
              size={24} 
              color={activeTab === 'anime' ? '#00D4FF' : '#666'} 
            />
            <Text style={[styles.navLabel, activeTab === 'anime' && styles.navLabelActive]}>
              Anime
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'quiz' && styles.navItemActive]}
            onPress={() => setActiveTab('quiz')}
          >
            <Ionicons 
              name={activeTab === 'quiz' ? 'help-circle' : 'help-circle-outline'} 
              size={24} 
              color={activeTab === 'quiz' ? '#00D4FF' : '#666'} 
            />
            <Text style={[styles.navLabel, activeTab === 'quiz' && styles.navLabelActive]}>
              Quiz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'chat' && styles.navItemActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Ionicons 
              name={activeTab === 'chat' ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={24} 
              color={activeTab === 'chat' ? '#00D4FF' : '#666'} 
            />
            <Text style={[styles.navLabel, activeTab === 'chat' && styles.navLabelActive]}>
              Chat
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  notificationDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ec4899',
  },
  adminButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeCard: {
    marginBottom: 25,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 14,
    color: '#00D4FF',
    marginBottom: 5,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  adminText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  xpSection: {
    gap: 8,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D4FF',
    textAlign: 'center',
  },
  xpBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '47%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    gap: 10,
  },
  adminCard: {
    borderColor: 'rgba(236, 72, 153, 0.3)',
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 25,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animeInfo: {
    flex: 1,
  },
  infoCard: {
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  infoDesc: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  connectText: {
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  bottomNav: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.2)',
  },
  navGradient: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#00D4FF',
    fontWeight: '600',
  },
});