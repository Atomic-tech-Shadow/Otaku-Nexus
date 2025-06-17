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
  Edit, Save, X, Plus, Eye, EyeOff, Trash2, Shield, Users, FileText, BarChart3, Settings, RefreshCw, TrendingUp, Calendar, Star, MessageSquare, PlayCircle, Trophy, Brain, Heart, Bell, Activity, Download, BookOpen, Video, Zap, Home, ExternalLink
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

interface AdminPost {
  id: number;
  title: string;
  content: string;
  type: "announcement" | "event" | "update";
  isPublished: boolean;
  adminOnly: boolean;
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

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
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

  // Stats query
  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  // Posts query
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery<AdminPost[]>({
    queryKey: ["/api/admin/posts"],
    enabled: !!user?.isAdmin,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      return await apiRequest("/api/admin/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Publication créée",
        description: "Votre publication a été créée avec succès.",
      });
      createForm.reset();
      setIsCreatePostOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      if (!editingPost) throw new Error("Aucune publication sélectionnée");
      return await apiRequest(`/api/admin/posts/${editingPost.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Publication modifiée",
        description: "Votre publication a été modifiée avec succès.",
      });
      setIsEditPostOpen(false);
      setEditingPost(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Publication supprimée",
        description: "La publication a été supprimée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const onEditPost = (data: z.infer<typeof postSchema>) => {
    editPostMutation.mutate(data);
  };

  const handleEditPost = (post: AdminPost) => {
    setEditingPost(post);
    editForm.reset({
      title: post.title,
      content: post.content,
      type: post.type,
      isPublished: post.isPublished,
      adminOnly: post.adminOnly,
      imageUrl: post.imageUrl || "",
    });
    setIsEditPostOpen(true);
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement": return "Annonce";
      case "event": return "Événement";
      case "update": return "Mise à jour";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "event": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "update": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès refusé</h1>
          <p className="text-gray-400">Vous n'avez pas les permissions nécessaires.</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-electric-blue rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-20 h-20 bg-otaku-purple rounded-full opacity-15 animate-float"></div>
        <div className="absolute top-1/3 left-10 w-16 h-16 bg-electric-blue rounded-full opacity-10 animate-bounce"></div>
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
              className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl mb-4"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700 rounded-xl p-1">
              <TabsTrigger 
                value="dashboard" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                Contenu
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Publications
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Statistiques
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Tableau de bord</h2>
                <p className="text-gray-400 text-sm">Vue d'ensemble de la plateforme</p>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Créateur de Quiz</h3>
                        <p className="text-gray-300 text-sm mb-4">Créez et publiez des quiz pour votre communauté</p>
                        <Button 
                          onClick={() => window.location.href = '/admin/quiz-creator'}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Créer un Quiz
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                      <Brain className="h-12 w-12 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-600/20 to-blue-600/20 border-green-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Gestion Manga</h3>
                        <p className="text-gray-300 text-sm mb-4">API MangaDx intégrée pour les scans</p>
                        <Button 
                          onClick={() => window.location.href = '/manga'}
                          variant="outline"
                          className="border-green-500/50 text-green-400 hover:bg-green-600/20"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Voir les Manga
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                      <BookOpen className="h-12 w-12 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {statsLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-gray-400 mt-2">Chargement des statistiques...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Utilisateurs</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Quiz</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalQuizzes || 0}</p>
                        </div>
                        <Brain className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Anime</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalAnime || 0}</p>
                        </div>
                        <Star className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Messages</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalMessages || 0}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Gestion du Contenu</h2>
                <p className="text-gray-400 text-sm">Créez et publiez du contenu pour votre communauté</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Quiz Creator */}
                <Card className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-500/50 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Quiz Creator</h3>
                      <p className="text-gray-300 text-sm mb-4">Créez des quiz interactifs avec questions multiples et explications</p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => window.location.href = '/admin/quiz-creator'}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un Quiz
                        </Button>
                        <div className="text-xs text-gray-400">
                          {stats?.totalQuizzes || 0} quiz publiés
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Video Content */}
                <Card className="bg-gradient-to-br from-orange-600/30 to-red-600/30 border-orange-500/50 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Vidéos</h3>
                      <p className="text-gray-300 text-sm mb-4">Gérez les vidéos et contenus multimédia</p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => window.location.href = '/videos'}
                          variant="outline"
                          className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-600/20"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Voir les Vidéos
                        </Button>
                        <div className="text-xs text-gray-400">
                          Contenu multimédia
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Management */}
                <Card className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-500/50 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Chat</h3>
                      <p className="text-gray-300 text-sm mb-4">Modérez les discussions communautaires</p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => window.location.href = '/chat'}
                          variant="outline"
                          className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-600/20"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Modérer le Chat
                        </Button>
                        <div className="text-xs text-gray-400">
                          {stats?.totalMessages || 0} messages
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Management */}
                <Card className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border-indigo-500/50 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Utilisateurs</h3>
                      <p className="text-gray-300 text-sm mb-4">Gérez les comptes et permissions</p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => window.location.href = '/profile'}
                          variant="outline"
                          className="w-full border-indigo-500/50 text-indigo-400 hover:bg-indigo-600/20"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Gérer Utilisateurs
                        </Button>
                        <div className="text-xs text-gray-400">
                          {stats?.totalUsers || 0} utilisateurs
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gray-800/50 border-gray-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      onClick={() => window.location.href = '/admin/quiz-creator'}
                      className="bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau Quiz
                    </Button>
                    <Button 
                      onClick={() => setIsCreatePostOpen(true)}
                      className="bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Nouvelle Publication
                    </Button>

                    <Button 
                      onClick={() => window.location.href = '/chat'}
                      className="bg-orange-600/20 border border-orange-500/30 text-orange-400 hover:bg-orange-600/30"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Modérer Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Posts Tab */}
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
                                    placeholder="Entrez le titre de votre publication..."
                                    className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl h-12"
                                    {...field}
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
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white rounded-xl h-12">
                                    <SelectValue placeholder="Sélectionnez un type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border border-gray-600">
                                  <SelectItem value="announcement">📢 Annonce</SelectItem>
                                  <SelectItem value="event">🎉 Événement</SelectItem>
                                  <SelectItem value="update">🔄 Mise à jour</SelectItem>
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
                              <FormLabel className="text-white font-semibold">URL de l'Image (optionnel)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://exemple.com/image.jpg"
                                  className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl h-12"
                                  {...field}
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
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white text-sm">{post.title}</h4>
                                <Badge className={`text-xs px-2 py-1 rounded-full ${getTypeColor(post.type)}`}>
                                  {getTypeLabel(post.type)}
                                </Badge>
                                {post.isPublished ? (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1 rounded-full">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Publié
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-2 py-1 rounded-full">
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Brouillon
                                  </Badge>
                                )}
                                {post.adminOnly && (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-2 py-1 rounded-full">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs mb-2 line-clamp-2">{post.content}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditPost(post)}
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeletePost(post.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-700/20 h-8 w-8 p-0"
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

            {/* Stats Tab */}
            <TabsContent value="stats">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6">Statistiques de la Plateforme</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Utilisateurs</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Quiz</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalQuizzes || 0}</p>
                        </div>
                        <Brain className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Anime</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalAnime || 0}</p>
                        </div>
                        <Star className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Messages</p>
                          <p className="text-2xl font-bold text-white">{stats?.totalMessages || 0}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Edit Post Dialog */}
        <Dialog open={isEditPostOpen} onOpenChange={setIsEditPostOpen}>
          <DialogContent className="backdrop-blur-xl bg-gray-900/95 border border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Modifier la Publication</DialogTitle>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditPost)} className="space-y-6">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">Titre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Titre de la publication"
                          className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-xl bg-gray-800 border border-gray-600 text-white rounded-xl">
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-semibold">Contenu</FormLabel>
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
                        <FormLabel className="text-white font-semibold">Publier</FormLabel>
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
                    disabled={editPostMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 shadow-lg"
                  >
                    {editPostMutation.isPending ? "Modification..." : "Modifier"}
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