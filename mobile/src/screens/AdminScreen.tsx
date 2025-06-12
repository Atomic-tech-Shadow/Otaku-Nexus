import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface AdminPost {
  id: number;
  title: string;
  content: string;
  type: string;
  isPublished: boolean;
  adminOnly?: boolean;
  authorId: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlatformStats {
  totalUsers: number;
  totalQuizzes: number;
  totalAnime: number;
  totalMessages: number;
  totalPosts: number;
}

export default function AdminScreen({ navigation }: any) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('news');
  const [isPublished, setIsPublished] = useState(false);
  const [adminOnly, setAdminOnly] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions d\'administrateur');
      navigation.goBack();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsData, statsData] = await Promise.all([
        apiService.getAdminPosts(),
        apiService.getPlatformStats(),
      ]);
      setPosts(postsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données d\'administration');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('news');
    setIsPublished(false);
    setAdminOnly(false);
    setEditingPost(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (post: AdminPost) => {
    setTitle(post.title);
    setContent(post.content);
    setType(post.type);
    setIsPublished(post.isPublished);
    setAdminOnly(post.adminOnly || false);
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleSavePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erreur', 'Le titre et le contenu sont requis');
      return;
    }

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        type,
        isPublished,
        adminOnly,
      };

      if (editingPost) {
        await apiService.updateAdminPost(editingPost.id, postData);
        Alert.alert('Succès', 'Article mis à jour avec succès');
      } else {
        await apiService.createAdminPost(postData);
        Alert.alert('Succès', 'Article créé avec succès');
      }

      closeModal();
      loadData();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder l\'article');
    }
  };

  const handleDeletePost = (post: AdminPost) => {
    Alert.alert(
      'Supprimer l\'article',
      `Êtes-vous sûr de vouloir supprimer "${post.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAdminPost(post.id);
              Alert.alert('Succès', 'Article supprimé avec succès');
              loadData();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'article');
            }
          }
        }
      ]
    );
  };

  const getTypeColor = (postType: string) => {
    switch (postType) {
      case 'news': return '#3498db';
      case 'announcement': return '#e74c3c';
      case 'update': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getTypeLabel = (postType: string) => {
    switch (postType) {
      case 'news': return 'Actualité';
      case 'announcement': return 'Annonce';
      case 'update': return 'Mise à jour';
      default: return postType;
    }
  };

  const renderPostItem = ({ item }: { item: AdminPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postMeta}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.typeBadgeText}>{getTypeLabel(item.type)}</Text>
          </View>
          <View style={styles.statusBadges}>
            {item.isPublished ? (
              <View style={[styles.statusBadge, styles.publishedBadge]}>
                <Text style={styles.statusBadgeText}>Publié</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.draftBadge]}>
                <Text style={styles.statusBadgeText}>Brouillon</Text>
              </View>
            )}
            {item.adminOnly && (
              <View style={[styles.statusBadge, styles.adminBadge]}>
                <Text style={styles.statusBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePost(item)}
          >
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>
      <Text style={styles.postDate}>
        Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
      </Text>
    </View>
  );

  const renderStatsCard = (title: string, value: number, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <Text style={styles.statsValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#e74c3c', '#c0392b']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Administration</Text>
        <Text style={styles.headerSubtitle}>Gestion de la plateforme</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Statistiques */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques de la plateforme</Text>
            <View style={styles.statsGrid}>
              {renderStatsCard('Utilisateurs', stats.totalUsers, '#3498db')}
              {renderStatsCard('Quiz', stats.totalQuizzes, '#9b59b6')}
              {renderStatsCard('Anime', stats.totalAnime, '#e74c3c')}
              {renderStatsCard('Messages', stats.totalMessages, '#2ecc71')}
              {renderStatsCard('Articles', stats.totalPosts, '#f39c12')}
            </View>
          </View>
        )}

        {/* Gestion des articles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Articles</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={openCreateModal}
            >
              <Text style={styles.createButtonText}>Créer</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun article trouvé</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de création/édition */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPost ? 'Modifier l\'article' : 'Créer un article'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Titre de l'article"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  {['news', 'announcement', 'update'].map((typeOption) => (
                    <TouchableOpacity
                      key={typeOption}
                      style={[
                        styles.typeOption,
                        type === typeOption && styles.typeOptionSelected
                      ]}
                      onPress={() => setType(typeOption)}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        type === typeOption && styles.typeOptionTextSelected
                      ]}>
                        {getTypeLabel(typeOption)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contenu</Text>
                <TextInput
                  style={styles.textArea}
                  value={content}
                  onChangeText={setContent}
                  placeholder="Contenu de l'article"
                  multiline
                  numberOfLines={6}
                />
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Publié</Text>
                  <Switch
                    value={isPublished}
                    onValueChange={setIsPublished}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isPublished ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Admin uniquement</Text>
                  <Switch
                    value={adminOnly}
                    onValueChange={setAdminOnly}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={adminOnly ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePost}
              >
                <Text style={styles.saveButtonText}>
                  {editingPost ? 'Mettre à jour' : 'Créer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    gap: 12,
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    color: '#666',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postMeta: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  publishedBadge: {
    backgroundColor: '#d4edda',
  },
  draftBadge: {
    backgroundColor: '#f8d7da',
  },
  adminBadge: {
    backgroundColor: '#fff3cd',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#3498db',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  switchGroup: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});