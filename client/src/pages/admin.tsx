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
import { ImageUpload } from "@/components/ui/image-upload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings, Plus, Edit, Trash2, Eye, EyeOff, Users, MessageSquare, Video, BookOpen, 
  ArrowLeft, Home, Shield, BarChart3, Database, Upload, Download, RefreshCw,
  Calendar, Clock, TrendingUp, Activity, FileText, Image as ImageIcon,
  Zap, Star, Trophy, Target, Gamepad2, Play, PlusCircle, Settings2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Accès Refusé</h1>
            <p className="text-gray-400 mb-6">Vous devez être administrateur pour accéder à cette page.</p>
            <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-20 h-20 bg-otaku-purple rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <AppHeader />

        <main className="px-4 pb-6">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-otaku-purple rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient mb-2">Administration</h1>
            <p className="text-gray-400">Panneau de contrôle de la plateforme</p>
          </div>

          {/* Navigation */}
          <Card className="bg-card-bg border-gray-800 mb-6">
            <CardContent className="p-4">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full mb-4 border-gray-700 text-gray-300 hover:bg-gray-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-gray-800 mb-4">
                  <TabsTrigger value="dashboard" className="text-xs px-1">Dashboard</TabsTrigger>
                  <TabsTrigger value="posts" className="text-xs px-1">Publications</TabsTrigger>
                  <TabsTrigger value="users" className="text-xs px-1">Utilisateurs</TabsTrigger>
                  <TabsTrigger value="quiz" className="text-xs px-1">Quiz</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs px-1">Contenu</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs px-1">Paramètres</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Stats Cards */}
                      <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-300 text-sm font-medium">Total Utilisateurs</p>
                              <p className="text-3xl font-bold text-white">{platformStats?.totalUsers || 0}</p>
                            </div>
                            <Users className="h-12 w-12 text-blue-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-300 text-sm font-medium">Quiz Disponibles</p>
                              <p className="text-3xl font-bold text-white">{platformStats?.totalQuizzes || 0}</p>
                            </div>
                            <BookOpen className="h-12 w-12 text-green-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-300 text-sm font-medium">Anime Database</p>
                              <p className="text-3xl font-bold text-white">{platformStats?.totalAnime || 0}</p>
                            </div>
                            <Video className="h-12 w-12 text-purple-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-pink-300 text-sm font-medium">Messages Chat</p>
                              <p className="text-3xl font-bold text-white">{platformStats?.totalMessages || 0}</p>
                            </div>
                            <MessageSquare className="h-12 w-12 text-pink-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-400" />
                          Actions Rapides
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Button 
                            onClick={() => setActiveTab("posts")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle Publication
                          </Button>
                          <Button 
                            onClick={handleCreateFrenchQuizzes}
                            disabled={isCreatingQuizzes}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Créer Quiz
                          </Button>
                          <Button 
                            onClick={() => refetchStats()}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualiser Stats
                          </Button>
                          <Button 
                            onClick={() => setActiveTab("users")}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Gérer Utilisateurs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Activity className="h-5 w-5 text-green-400" />
                          Activité Récente
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {posts.slice(0, 5).map((post) => (
                            <div key={post.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <div>
                                  <p className="text-white font-medium">{post.title}</p>
                                  <p className="text-gray-400 text-sm">
                                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={post.isPublished ? "default" : "secondary"}>
                                {post.isPublished ? "Publié" : "Brouillon"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

          <TabsContent value="posts">
            <div className="space-y-8">
              {/* Header with Create Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Gestion des Publications</h2>
                  <p className="text-gray-400">Créez et gérez les publications de votre plateforme</p>
                </div>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 shadow-lg transition-all duration-300 hover:scale-105">
                      <Plus className="h-5 w-5 mr-2" />
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

              {/* Posts List */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement des publications...</p>
                  </div>
                ) : !Array.isArray(posts) || posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Aucune Publication</h4>
                    <p className="text-gray-400 mb-6">Commencez par créer votre première publication pour engager votre communauté</p>
                    <Button 
                      onClick={() => setIsCreatePostOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer ma première publication
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(posts as AdminPost[]).map((post: AdminPost, index: number) => (
                      <div 
                        key={post.id} 
                        className="backdrop-blur-xl bg-gray-700/50 border border-gray-600 rounded-2xl p-6 hover:bg-gray-700/80 transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {post.title}
                              </h4>
                              <Badge 
                                variant={post.type === 'announcement' ? 'default' : post.type === 'event' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {post.type === 'announcement' && 'Annonce'}
                                {post.type === 'event' && 'Événement'}
                                {post.type === 'update' && 'Mise à jour'}
                              </Badge>
                              {post.isPublished ? (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  Publié
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                                  Brouillon
                                </Badge>
                              )}
                              {post.adminOnly && (
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                              {post.content}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Créé le {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePublishMutation.mutate({
                                id: post.id,
                                isPublished: !post.isPublished
                              })}
                              disabled={togglePublishMutation.isPending}
                              className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 rounded-xl"
                              title={post.isPublished ? "Masquer" : "Publier"}
                            >
                              {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPost(post)}
                              className="backdrop-blur-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 rounded-xl"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
                                  deletePostMutation.mutate(post.id);
                                }
                              }}
                              disabled={deletePostMutation.isPending}
                              className="backdrop-blur-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 rounded-xl"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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

          <TabsContent value="quizzes">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Gestion des Quiz</h2>
                  <p className="text-gray-400">Créez et gérez les quiz de votre plateforme</p>
                </div>
                <Button
                  onClick={handleCreateFrenchQuizzes}
                  disabled={isCreatingQuizzes}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6 py-3 shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {isCreatingQuizzes ? "Création..." : "Créer Quiz Français"}
                </Button>
              </div>

              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <QuizListComponent />
              </div>
            </div>
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
        </Tabs>
        </CardContent>
      </Card>
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