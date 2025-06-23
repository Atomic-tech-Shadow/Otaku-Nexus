import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NotFoundScreen() {
  const navigation = useNavigation();

  const handleGoHome = () => {
    navigation.navigate('Home' as never);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1e40af', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle-outline" size={120} color="#00D4FF" />
          </View>
          
          <Text style={styles.title}>Page introuvable</Text>
          <Text style={styles.subtitle}>404</Text>
          <Text style={styles.description}>
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00D4FF', '#1e40af']}
                style={styles.buttonGradient}
              >
                <Ionicons name="home" size={20} color="#000" />
                <Text style={styles.primaryButtonText}>Retour à l'accueil</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#00D4FF" />
              <Text style={styles.secondaryButtonText}>Page précédente</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions :</Text>
            <View style={styles.suggestionsList}>
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => navigation.navigate('AnimeSama' as never)}
              >
                <Ionicons name="play-circle" size={16} color="#a855f7" />
                <Text style={styles.suggestionText}>Regarder des animes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => navigation.navigate('Quiz' as never)}
              >
                <Ionicons name="help-circle" size={16} color="#ec4899" />
                <Text style={styles.suggestionText}>Faire un quiz</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => navigation.navigate('Chat' as never)}
              >
                <Ionicons name="chatbubbles" size={16} color="#00D4FF" />
                <Text style={styles.suggestionText}>Rejoindre le chat</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 40,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    gap: 10,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  suggestionsList: {
    gap: 10,
    alignItems: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    gap: 8,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});