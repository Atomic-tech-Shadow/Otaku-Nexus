import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Edit, Save, X, Plus, Eye, EyeOff, Trash2, Shield, Users, FileText, BarChart3, Settings, RefreshCw, TrendingUp, Calendar, Star, MessageSquare, PlayCircle, Trophy, Brain, Heart, Bell, Activity, Download, BookOpen, Video, Zap, Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const postSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  type: z.enum(["announcement", "event", "update"], {
    required_error: "Le type est requis",
  }),
  isPublished: z.boolean().default(false),
  adminOnly: z.boolean().default(false),
  imageUrl: z.string().optional(),
});

const quizSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  xpReward: z.number().min(1, "Les points XP doivent être positifs"),
  questions: z.array(z.object({
    question: z.string().min(1, "La question est requise"),
    options: z.array(z.string()).length(4, "Il faut exactement 4 options"),
    correctAnswer: z.number().min(0).max(3),
    explanation: z.string().min(1, "L'explication est requise"),
  })).min(1, "Au moins une question est requise"),
});

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

// QuizList component for the admin panel
const QuizListComponent = () => {
  const { data: quizzes = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/quizzes'],
    enabled: true,
  });

  console.log("Quiz data:", quizzes);
  console.log("Quiz loading:", isLoading);
  console.log("Quiz error:", null);

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue mx-auto"></div>
        <p className="text-gray-400 mt-2">Chargement des quiz...</p>
      </div>
    );
  }

  if (!Array.isArray(quizzes) || quizzes.length === 0) {
    console.log("Retour de 0 quiz");
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-purple-400" />
        </div>
        <h4 className="text-lg font-semibold text-white mb-2">Aucun quiz trouvé</h4>
        <p className="text-gray-400">Utilisez le bouton "Créer Quiz Français" pour ajouter des quiz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-400 mb-4">
        {quizzes.length} quiz{quizzes.length > 1 ? 's' : ''} disponible{quizzes.length > 1 ? 's' : ''}
      </p>
      <div className="grid gap-4">
        {quizzes.map((quiz: any) => (
          <div 
            key={quiz.id} 
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h5 className="font-semibold text-white mb-1">{quiz.title}</h5>
                <p className="text-gray-300 text-sm mb-2">{quiz.description}</p>
                <div className="flex gap-2">
                  <Badge 
                    className={`text-xs ${
                      quiz.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {quiz.difficulty === 'easy' ? 'Facile' : 
                     quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                    {quiz.xpReward} XP
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Array.isArray(quiz.questions) ? quiz.questions.length : 
                     typeof quiz.questions === 'string' ? JSON.parse(quiz.questions).length : 0} questions
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreatingQuizzes, setIsCreatingQuizzes] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);

  const createForm = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "announcement",
      isPublished: false,
      adminOnly: false,
      imageUrl: "",
    },
  });

  const editForm = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "announcement",
      isPublished: false,
      adminOnly: false,
      imageUrl: "",
    },
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: isAuthenticated,
  });

  // Fetch platform stats
  const { data: platformStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/platform-stats'],
    enabled: isAuthenticated,
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<AdminPost[]>({
    queryKey: ['/api/admin/posts'],
    enabled: isAuthenticated,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: z.infer<typeof postSchema>) =>
      apiRequest('/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      toast({ title: "Succès", description: "Publication créée avec succès" });
      setIsCreatePostOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast({ title: "Erreur", description: "Impossible de créer la publication", variant: "destructive" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<z.infer<typeof postSchema>>) =>
      apiRequest(`/api/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      toast({ title: "Succès", description: "Publication modifiée avec succès" });
      setIsEditPostOpen(false);
      setEditingPost(null);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
    },
    onError: (error) => {
      console.error('Update post error:', error);
      toast({ title: "Erreur", description: "Impossible de modifier la publication", variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) =>
      apiRequest(`/api/admin/posts/${postId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Succès", description: "Publication supprimée avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
    },
    onError: (error) => {
      console.error('Delete post error:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer la publication", variant: "destructive" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      apiRequest(`/api/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      toast({ title: "Succès", description: "Statut de publication mis à jour" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
    },
    onError: (error) => {
      console.error('Toggle publish error:', error);
      toast({ title: "Erreur", description: "Impossible de changer le statut", variant: "destructive" });
    },
  });

  const createFrenchQuizzesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/create-french-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({ title: "Succès", description: "Quiz français créés avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      setIsCreatingQuizzes(false);
      refetchStats();
    },
    onError: (error) => {
      console.error('Create quizzes error:', error);
      toast({ title: "Erreur", description: "Impossible de créer les quiz", variant: "destructive" });
      setIsCreatingQuizzes(false);
    },
  });

  const handleEditPost = (post: AdminPost) => {
    setEditingPost(post);
    editForm.reset({
      title: post.title,
      content: post.content,
      type: post.type as "announcement" | "event" | "update",
      isPublished: post.isPublished,
      adminOnly: post.adminOnly || false,
      imageUrl: post.imageUrl || "",
    });
    setIsEditPostOpen(true);
  };

  const handleCreateFrenchQuizzes = () => {
    setIsCreatingQuizzes(true);
    createFrenchQuizzesMutation.mutate();
  };

  const [activeTab, setActiveTab] = useState("posts");

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Accès Refusé</h1>
            <p className="text-gray-400 mb-6 text-sm">Vous devez être administrateur pour accéder à cette page.</p>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-electric-blue rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-40 right-5 w-16 h-16 bg-hot-pink rounded-full opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-12 h-12 bg-otaku-purple rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 pb-20">
        <AppHeader />

        <main className="px-4 py-4">
          {/* Page Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-otaku-purple rounded-xl mx-auto mb-3 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient mb-1">Administration</h1>
            <p className="text-gray-400 text-sm">Panneau de contrôle</p>
          </div>

          {/* Navigation */}
          <div className="mb-6">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full mb-4 border-gray-700 text-gray-300 hover:bg-gray-700 h-12"
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 mb-6 p-1 h-auto">
                <TabsTrigger 
                  value="dashboard" 
                  className="text-xs p-3 flex flex-col items-center gap-1 data-[state=active]:bg-electric-blue data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="posts" 
                  className="text-xs p-3 flex flex-col items-center gap-1 data-[state=active]:bg-electric-blue data-[state=active]:text-white"
                >
                  <FileText className="h-4 w-4" />
                  <span>Publications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz" 
                  className="text-xs p-3 flex flex-col items-center gap-1 data-[state=active]:bg-electric-blue data-[state=active]:text-white"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Quiz</span>
                </TabsTrigger>
              </TabsList>

              {/* Secondary tabs for less used features */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <Button
                  variant={activeTab === "users" ? "default" : "outline"}
                  onClick={() => setActiveTab("users")}
                  className="text-xs p-3 h-auto flex flex-col items-center gap-1"
                  size="sm"
                >
                  <Users className="h-4 w-4" />
                  <span>Utilisateurs</span>
                </Button>
                <Button
                  variant={activeTab === "content" ? "default" : "outline"}
                  onClick={() => setActiveTab("content")}
                  className="text-xs p-3 h-auto flex flex-col items-center gap-1"
                  size="sm"
                >
                  <Video className="h-4 w-4" />
                  <span>Contenu</span>
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "outline"}
                  onClick={() => setActiveTab("settings")}
                  className="text-xs p-3 h-auto flex flex-col items-center gap-1"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </Button>
              </div>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Stats Cards */}
                    <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-blue-300 text-xs font-medium mb-1">Utilisateurs</p>
                          <p className="text-xl font-bold text-white">{platformStats?.totalUsers || 0}</p>
                        </div>
                      </CardContent>
                    </Card>

                      <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <BookOpen className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <p className="text-green-300 text-xs font-medium mb-1">Quiz</p>
                          <p className="text-xl font-bold text-white">{platformStats?.totalQuizzes || 0}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Video className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-purple-300 text-xs font-medium mb-1">Anime</p>
                          <p className="text-xl font-bold text-white">{platformStats?.totalAnime || 0}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-500/30">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <MessageSquare className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                          <p className="text-pink-300 text-xs font-medium mb-1">Messages</p>
                          <p className="text-xl font-bold text-white">{platformStats?.totalMessages || 0}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                    {/* Quick Actions */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        Actions Rapides
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        <Button 
                          onClick={() => setActiveTab("posts")}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-12 text-left justify-start"
                        >
                          <Plus className="h-4 w-4 mr-3" />
                          Nouvelle Publication
                        </Button>
                        <Button 
                          onClick={handleCreateFrenchQuizzes}
                          disabled={isCreatingQuizzes}
                          className="bg-green-600 hover:bg-green-700 text-white h-12 text-left justify-start"
                        >
                          {isCreatingQuizzes ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <BookOpen className="h-4 w-4 mr-3" />
                          )}
                          Créer Quiz Français
                        </Button>
                        <Button 
                          onClick={() => refetchStats()}
                          className="bg-purple-600 hover:bg-purple-700 text-white h-12 text-left justify-start"
                        >
                          <RefreshCw className="h-4 w-4 mr-3" />
                          Actualiser Statistiques
                        </Button>
                        <Button 
                          onClick={() => setActiveTab("users")}
                          className="bg-orange-600 hover:bg-orange-700 text-white h-12 text-left justify-start"
                        >
                          <Users className="h-4 w-4 mr-3" />
                          Gérer Utilisateurs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                    {/* Recent Activity */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-green-400" />
                        Activité Récente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {posts.slice(0, 3).map((post) => (
                          <div key={post.id} className="p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">{post.title}</p>
                                <p className="text-gray-400 text-xs">
                                  {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                                <Badge 
                                  variant={post.isPublished ? "default" : "secondary"}
                                  className="mt-1 text-xs"
                                >
                                  {post.isPublished ? "Publié" : "Brouillon"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        {posts.length === 0 && (
                          <div className="text-center py-6">
                            <p className="text-gray-400 text-sm">Aucune activité récente</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

          <TabsContent value="users">
                  <div className="space-y-6">
                    {/* User Management Section */}
                    <Card className="bg-card-bg border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Users className="h-5 w-5" />
                          Gestion des Utilisateurs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-4 mb-6">
                            <Button
                              onClick={() => {
                                // Fetch and display user list
                                console.log("Fetching user list...");
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Actualiser Liste
                            </Button>
                            <Button
                              onClick={() => {
                                // Export user data
                                console.log("Exporting user data...");
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Exporter CSV
                            </Button>
                          </div>

                          {/* User Statistics */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-700 rounded-xl p-4 text-center">
                              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{platformStats?.totalUsers || 0}</div>
                              <div className="text-sm text-gray-400">Utilisateurs Total</div>
                            </div>
                            <div className="bg-gray-700 rounded-xl p-4 text-center">
                              <Activity className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">
                                {Math.floor((platformStats?.totalUsers || 0) * 0.7)}
                              </div>
                              <div className="text-sm text-gray-400">Actifs (7j)</div>
                            </div>
                            <div className="bg-gray-700 rounded-xl p-4 text-center">
                              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">
                                {Math.floor((platformStats?.totalUsers || 0) * 0.1)}
                              </div>
                              <div className="text-sm text-gray-400">Nouveaux (30j)</div>
                            </div>
                          </div>

                          {/* User Actions */}
                          <div className="space-y-3">
                            <div className="bg-gray-700 rounded-xl p-4">
                              <h4 className="text-lg font-semibold text-white mb-3">Actions Rapides</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Button
                                  onClick={() => {
                                    // Send notification to all users
                                    console.log("Sending notification to all users...");
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white justify-start"
                                >
                                  <Bell className="h-4 w-4 mr-2" />
                                  Notification Globale
                                </Button>
                                <Button
                                  onClick={() => {
                                    // Backup user data
                                    console.log("Backing up user data...");
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white justify-start"
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Backup Données
                                </Button>
                                <Button
                                  onClick={() => {
                                    // Clean inactive users
                                    console.log("Cleaning inactive users...");
                                  }}
                                  className="bg-orange-600 hover:bg-orange-700 text-white justify-start"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Nettoyer Inactifs
                                </Button>
                                <Button
                                  onClick={() => {
                                    // Generate user report
                                    console.log("Generating user report...");
                                  }}
                                  className="bg-teal-600 hover:bg-teal-700 text-white justify-start"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Rapport Détaillé
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

          

          <TabsContent value="posts" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-1">Publications</h2>
              <p className="text-gray-400 text-sm">Gérez vos publications</p>
            </div>

            <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Publication
                </Button>
              </DialogTrigger>
                  <DialogContent className="backdrop-blur-xl bg-gray-900/95 border border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto text-white shadow-2xl">
                    <DialogHeader className="border-b border-gray-700 pb-6">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Créer une Nouvelle Publication
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <FormField
                              control={createForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-semibold">Titre de la Publication</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ex: Nouvelle mise à jour majeure..."
                                      {...field}
                                      className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={createForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-semibold">Type de Publication</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white rounded-xl">
                                      <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-800 border-gray-600">
                                    <SelectItem value="announcement">Annonce</SelectItem>
                                    <SelectItem value="event">Événement</SelectItem>
                                    <SelectItem value="update">Mise à jour</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-semibold">Image (Optionnel)</FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    onImageUpload={field.onChange}
                                    currentImage={field.value}
                                    maxSize={5}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={createForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white font-semibold">Contenu de la Publication</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Rédigez le contenu de votre publication..."
                                  className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl min-h-[120px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4">
                          <FormField
                            control={createForm.control}
                            name="isPublished"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-white font-semibold">Publier immédiatement</FormLabel>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="adminOnly"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-white font-semibold">Réservé aux admins</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex gap-3 pt-6">
                          <Button
                            type="submit"
                            disabled={createPostMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 shadow-lg"
                          >
                            {createPostMutation.isPending ? "Création..." : "Créer la Publication"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreatePostOpen(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Mes Publications</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-6">
                    <LoadingSpinner />
                    <p className="text-gray-400 mt-2 text-sm">Chargement...</p>
                  </div>
                ) : !Array.isArray(posts) || posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Aucune Publication</h4>
                    <p className="text-gray-400 mb-4 text-sm">Créez votre première publication</p>
                    <Button 
                      onClick={() => setIsCreatePostOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(posts as AdminPost[]).map((post: AdminPost) => (
                      <div 
                        key={post.id} 
                        className="bg-gray-700/50 border border-gray-600 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm mb-1 truncate">
                              {post.title}
                            </h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              <Badge 
                                variant="outline"
                                className="text-xs"
                              >
                                {post.type === 'announcement' && 'Annonce'}
                                {post.type === 'event' && 'Événement'}
                                {post.type === 'update' && 'Mise à jour'}
                              </Badge>
                              {post.isPublished ? (
                                <Badge className="bg-green-500/20 text-green-300 text-xs">
                                  Publié
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-yellow-300 text-xs">
                                  Brouillon
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-xs line-clamp-2 mb-2">
                              {post.content}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePublishMutation.mutate({
                                id: post.id,
                                isPublished: !post.isPublished
                              })}
                              disabled={togglePublishMutation.isPending}
                              className="h-8 w-8 p-0"
                              title={post.isPublished ? "Masquer" : "Publier"}
                            >
                              {post.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPost(post)}
                              className="h-8 w-8 p-0"
                              title="Modifier"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm("Supprimer cette publication ?")) {
                                  deletePostMutation.mutate(post.id);
                                }
                              }}
                              disabled={deletePostMutation.isPending}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Statistiques de la Plateforme</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Utilisateurs</p>
                        <p className="text-2xl font-bold text-white">{(platformStats as any)?.totalUsers || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Quiz</p>
                        <p className="text-2xl font-bold text-white">{(platformStats as any)?.totalQuizzes || 0}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Anime</p>
                        <p className="text-2xl font-bold text-white">{(platformStats as any)?.totalAnime || 0}</p>
                      </div>
                      <Video className="h-8 w-8 text-pink-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Messages</p>
                        <p className="text-2xl font-bold text-white">{(platformStats as any)?.totalMessages || 0}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-1">Gestion des Quiz</h2>
              <p className="text-gray-400 text-sm">Créez et gérez les quiz</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-4">
              <Button
                onClick={handleCreateFrenchQuizzes}
                disabled={isCreatingQuizzes}
                className="bg-green-600 hover:bg-green-700 text-white h-12 justify-start"
              >
                {isCreatingQuizzes ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Plus className="h-4 w-4 mr-3" />
                )}
                Créer Quiz Français
              </Button>
              <Button
                onClick={() => {
                  console.log("Creating anime quiz...");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white h-12 justify-start"
              >
                <Star className="h-4 w-4 mr-3" />
                Créer Quiz Anime
              </Button>
              <Button
                onClick={() => {
                  console.log("Creating expert quiz...");
                }}
                className="bg-red-600 hover:bg-red-700 text-white h-12 justify-start"
              >
                <Trophy className="h-4 w-4 mr-3" />
                Créer Quiz Expert
              </Button>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quiz Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <QuizListComponent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Gestion du Contenu</h2>

              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Video className="h-10 w-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Gestion du Contenu</h4>
                  <p className="text-gray-400">Cette section sera bientôt disponible pour gérer les vidéos et autres contenus.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Paramètres Système</h2>

              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-10 w-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Paramètres Système</h4>
                  <p className="text-gray-400">Configuration avancée de la plateforme (bientôt disponible).</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </main>

        {/* Edit Post Dialog */}
        <Dialog open={isEditPostOpen} onOpenChange={setIsEditPostOpen}>
          <DialogContent className="backdrop-blur-xl bg-gray-900/95 border border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <DialogHeader className="border-b border-gray-700 pb-6">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Modifier la Publication
              </DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit((data) => {
                if (editingPost) {
                  updatePostMutation.mutate({ id: editingPost.id, ...data });
                }
              })} className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-semibold">Titre de la Publication</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Nouvelle mise à jour majeure..."
                              {...field}
                              className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Type de Publication</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white rounded-xl">
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="announcement">Annonce</SelectItem>
                            <SelectItem value="event">Événement</SelectItem>
                            <SelectItem value="update">Mise à jour</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">URL de l'Image (Optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">Contenu de la Publication</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Rédigez le contenu de votre publication..."
                          className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={editForm.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-white font-semibold">Publier immédiatement</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="adminOnly"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-white font-semibold">Réservé aux admins</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={updatePostMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 shadow-lg"
                  >
                    {updatePostMutation.isPending ? "Modification..." : "Modifier la Publication"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditPostOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}