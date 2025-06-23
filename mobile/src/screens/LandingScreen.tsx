import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    (navigation as any).navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1e40af', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo et titre */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#00D4FF', '#a855f7']}
                style={styles.logoGradient}
              >
                <Ionicons name="tv" size={64} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Otaku Nexus</Text>
            <Text style={styles.subtitle}>Votre plateforme anime ultime</Text>
          </View>

          {/* Fonctionnalités */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="play-circle" size={32} color="#00D4FF" />
              <Text style={styles.featureTitle}>Streaming</Text>
              <Text style={styles.featureText}>
                Regardez vos animes préférés en VF et VOSTFR
              </Text>
            </View>

            <View style={styles.feature}>
              <Ionicons name="help-circle" size={32} color="#a855f7" />
              <Text style={styles.featureTitle}>Quiz Otaku</Text>
              <Text style={styles.featureText}>
                Testez vos connaissances et gagnez de l'XP
              </Text>
            </View>

            <View style={styles.feature}>
              <Ionicons name="chatbubbles" size={32} color="#ec4899" />
              <Text style={styles.featureTitle}>Communauté</Text>
              <Text style={styles.featureText}>
                Discutez avec d'autres fans d'anime
              </Text>
            </View>
          </View>

          {/* Bouton d'action */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00D4FF', '#1e40af']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Commencer</Text>
                <Ionicons name="arrow-forward" size={24} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Rejoignez la communauté otaku la plus active
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#00D4FF',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 30,
  },
  feature: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  actionContainer: {
    paddingVertical: 30,
  },
  getStartedButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});