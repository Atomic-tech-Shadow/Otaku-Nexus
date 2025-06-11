
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
import { Settings, Plus, Edit, Trash2, Eye, EyeOff, Users, MessageSquare, Video, BookOpen, ArrowLeft, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const postSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  type: z.enum(["announcement", "event", "update"], {
    required_error: "Le type est requis",
  }),
  isPublished: z.boolean().default(false),
  adminOnly: z.boolean().default(false),
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
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

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);

  // Redirect if not authenticated or not the specific admin user
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté. Redirection...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    
    // Vérifier si l'utilisateur est l'admin spécifique
    const ADMIN_EMAIL = "sorokomarco@gmail.com";
    if (user && user.email !== ADMIN_EMAIL) {
      toast({
        title: "Accès refusé",
        description: "Cette section est réservée au créateur de l'application.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }
  }, [isAuthenticated, user, toast]);

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

  // Fetch admin posts
  const ADMIN_EMAIL = "sorokomarco@gmail.com";
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery<AdminPost[]>({
    queryKey: ["/api/admin/posts"],
    enabled: isAuthenticated && user?.email === ADMIN_EMAIL,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated && user?.email === ADMIN_EMAIL,
    staleTime: 30 * 1000,
  });

  // Fetch global platform stats
  const { data: platformStats } = useQuery({
    queryKey: ["/api/admin/platform-stats"],
    enabled: isAuthenticated && user?.email === ADMIN_EMAIL,
    queryFn: async () => {
      // Pour l'instant, retourner des stats statiques
      // TODO: Implémenter les vraies stats dans le backend
      return {
        totalUsers: "∞",
        totalQuizzes: "∞",
        totalAnime: "∞",
        totalMessages: "∞"
      };
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      return await apiRequest("/api/admin/posts", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsCreatePostOpen(false);
      createForm.reset();
      refetchPosts();
      toast({
        title: "✅ Publication réussie",
        description: "Le contenu a été publié avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de créer le post.",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof postSchema> }) => {
      return await apiRequest(`/api/admin/posts/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsEditPostOpen(false);
      setSelectedPost(null);
      editForm.reset();
      refetchPosts();
      toast({
        title: "✅ Modification réussie",
        description: "Le contenu a été modifié avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le post.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      refetchPosts();
      toast({
        title: "🗑️ Suppression réussie",
        description: "Le contenu a été supprimé définitivement.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le post.",
        variant: "destructive",
      });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      return await apiRequest(`/api/admin/posts/${id}`, {
        method: "PUT",
        body: { isPublished },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de modifier la publication.",
        variant: "destructive",
      });
    },
  });

  const handleEditPost = (post: AdminPost) => {
    setSelectedPost(post);
    editForm.setValue("title", post.title);
    editForm.setValue("content", post.content);
    editForm.setValue("type", post.type as "announcement" | "event" | "update");
    editForm.setValue("isPublished", post.isPublished);
    editForm.setValue("adminOnly", post.adminOnly || false);
    editForm.setValue("imageUrl", post.imageUrl || "");
    setIsEditPostOpen(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement": return "Annonce";
      case "event": return "Événement";
      case "update": return "Mise à jour";
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "announcement": return "default";
      case "event": return "secondary";
      case "update": return "outline";
      default: return "default";
    }
  };

  // Vérification d'accès admin - seul votre email peut accéder
  if (!isAuthenticated || (user && user.email !== "sorokomarco@gmail.com")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-animated text-text-primary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-electric-blue/20 to-hot-pink/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-otaku-purple/20 to-anime-red/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-hot-pink/20 to-electric-blue/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-anime-red/20 to-otaku-purple/20 rounded-full animate-bounce-in" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-card-bg/95 backdrop-blur-lg border-b border-electric-blue/20 shadow-lg shadow-electric-blue/10">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/"}
                className="text-text-primary hover:bg-gradient-to-r hover:from-electric-blue/10 hover:to-hot-pink/10 hover:text-electric-blue transition-all duration-300 btn-hover"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-gradient-to-b from-electric-blue to-hot-pink animate-pulse"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/"}
                className="text-text-primary hover:bg-gradient-to-r hover:from-hot-pink/10 hover:to-otaku-purple/10 hover:text-hot-pink transition-all duration-300 btn-hover"
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-electric-blue to-hot-pink rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-electric-blue to-hot-pink rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm bg-gradient-to-r from-electric-blue to-hot-pink bg-clip-text text-transparent font-semibold animate-shimmer">
                Admin connecté
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4 relative z-10">
        <div className="mb-8 text-center animate-slide-up">
          <div className="relative inline-block">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-electric-blue via-hot-pink to-otaku-purple bg-clip-text text-transparent animate-shimmer">
              ⚙️ Administration
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-hot-pink to-otaku-purple opacity-20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-xl text-text-secondary mb-4 animate-glow">Gestion de la communauté Otaku</p>
          <div className="w-32 h-1 bg-gradient-to-r from-electric-blue to-hot-pink mx-auto rounded-full animate-pulse"></div>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-gradient-to-r from-card-bg/90 to-card-bg/70 border border-electric-blue/30 backdrop-blur-lg rounded-2xl p-2 shadow-xl shadow-electric-blue/10">
            <TabsTrigger 
              value="posts" 
              className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-electric-blue/20 hover:to-hot-pink/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-electric-blue data-[state=active]:to-hot-pink data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
            >
              <MessageSquare className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-hot-pink/20 hover:to-otaku-purple/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-hot-pink data-[state=active]:to-otaku-purple data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
            >
              <Users className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger 
              value="quizzes" 
              className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-otaku-purple/20 hover:to-anime-red/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-otaku-purple data-[state=active]:to-anime-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
            >
              <BookOpen className="h-4 w-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-anime-red/20 hover:to-electric-blue/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-anime-red data-[state=active]:to-electric-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105"
            >
              <Video className="h-4 w-4" />
              Contenu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-6">
              {/* Header with Create Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-blue to-hot-pink bg-clip-text text-transparent">
                  Gestion des posts
                </h2>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="relative bg-gradient-to-r from-electric-blue to-hot-pink hover:from-hot-pink hover:to-otaku-purple text-white rounded-xl px-6 py-3 shadow-lg shadow-electric-blue/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-hot-pink/40 btn-hover group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Plus className="h-5 w-5 mr-2 relative z-10" />
                      <span className="relative z-10 font-semibold">Nouveau post</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card-bg text-text-primary border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau post</DialogTitle>
                    </DialogHeader>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
                        <div className="space-y-4 pb-4">
                          <FormField
                            control={createForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Titre</FormLabel>
                                <FormControl>
                                  <Input placeholder="Titre du post" {...field} className="bg-app-bg border-border text-text-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-app-bg border-border text-text-primary">
                                      <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-card-bg border-border">
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
                                <FormLabel>URL de l'image (optionnel)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} className="bg-app-bg border-border text-text-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contenu</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Contenu du post..." 
                                    className="min-h-[120px] bg-app-bg border-border text-text-primary"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name="isPublished"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Publier immédiatement</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name="adminOnly"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Admin uniquement</FormLabel>
                                  <p className="text-xs text-text-secondary">
                                    Visible seulement dans l'espace admin
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2 pt-4">
                            <Button 
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsCreatePostOpen(false);
                                createForm.reset();
                              }}
                              className="flex-1 border-border hover:bg-accent-hover/10"
                              disabled={createPostMutation.isPending}
                            >
                              Annuler
                            </Button>
                            <Button 
                              type="submit" 
                              className="flex-1 bg-accent-primary hover:bg-accent-hover text-white"
                              disabled={createPostMutation.isPending}
                            >
                              {createPostMutation.isPending ? "Création..." : "Créer"}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Posts List */}
              <Card className="bg-gradient-to-br from-card-bg/90 to-card-bg/70 border border-electric-blue/20 backdrop-blur-lg rounded-2xl shadow-xl shadow-electric-blue/10 card-hover">
                <CardHeader className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-hot-pink/20 to-transparent rounded-full"></div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-hot-pink to-otaku-purple bg-clip-text text-transparent relative z-10">
                    Posts existants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="text-text-secondary">Chargement des posts...</div>
                  ) : posts.length === 0 ? (
                    <div className="text-text-secondary text-center py-8">
                      Aucun post créé. Commencez par créer votre premier post !
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {posts.map((post: AdminPost, index) => (
                        <Card 
                          key={post.id} 
                          className="bg-gradient-to-r from-app-bg/90 to-card-bg/50 border border-electric-blue/20 rounded-xl shadow-lg shadow-electric-blue/5 card-hover transition-all duration-300 hover:shadow-xl hover:shadow-hot-pink/20 hover:scale-[1.02] animate-slide-up group"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardContent className="p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-electric-blue/10 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-text-primary font-semibold">{post.title}</h3>
                                <Badge variant={getTypeBadgeVariant(post.type)}>
                                  {getTypeLabel(post.type)}
                                </Badge>
                                {post.isPublished ? (
                                  <Badge variant="outline" className="text-accent-hover border-accent-hover">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Publié
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-text-secondary border-text-secondary">
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Brouillon
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => togglePublishMutation.mutate({
                                    id: post.id,
                                    isPublished: !post.isPublished
                                  })}
                                  disabled={togglePublishMutation.isPending}
                                  className="border-electric-blue/30 hover:bg-gradient-to-r hover:from-electric-blue/20 hover:to-hot-pink/20 hover:border-electric-blue/50 transition-all duration-300 hover:scale-110 relative z-10"
                                >
                                  {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPost(post)}
                                  className="border-hot-pink/30 hover:bg-gradient-to-r hover:from-hot-pink/20 hover:to-otaku-purple/20 hover:border-hot-pink/50 transition-all duration-300 hover:scale-110 relative z-10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
                                      deletePostMutation.mutate(post.id);
                                    }
                                  }}
                                  disabled={deletePostMutation.isPending}
                                  className="bg-gradient-to-r from-anime-red to-red-600 hover:from-red-600 hover:to-anime-red shadow-lg shadow-anime-red/30 transition-all duration-300 hover:scale-110 relative z-10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="text-xs text-text-secondary">
                              Créé le {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="bg-gradient-to-br from-card-bg/90 to-card-bg/70 border border-hot-pink/20 backdrop-blur-lg rounded-2xl shadow-xl shadow-hot-pink/10 card-hover">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-otaku-purple/20 to-transparent rounded-full"></div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-otaku-purple to-anime-red bg-clip-text text-transparent relative z-10">
                  Statistiques de la plateforme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-electric-blue/20 to-electric-blue/10 rounded-2xl p-6 border border-electric-blue/30 card-hover relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <h3 className="text-electric-blue font-bold mb-3 text-lg relative z-10">👥 Utilisateurs</h3>
                    <p className="text-4xl font-black text-text-primary mb-2 relative z-10 animate-glow">
                      {platformStats?.totalUsers || userStats?.totalUsers || "0"}
                    </p>
                    <p className="text-sm text-text-secondary relative z-10">Total des inscrits</p>
                  </div>
                  <div className="bg-gradient-to-br from-hot-pink/20 to-hot-pink/10 rounded-2xl p-6 border border-hot-pink/30 card-hover relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-hot-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <h3 className="text-hot-pink font-bold mb-3 text-lg relative z-10">🧠 Quiz</h3>
                    <p className="text-4xl font-black text-text-primary mb-2 relative z-10 animate-glow">
                      {platformStats?.totalQuizzes || "0"}
                    </p>
                    <p className="text-sm text-text-secondary relative z-10">Quiz créés</p>
                  </div>
                  <div className="bg-gradient-to-br from-otaku-purple/20 to-otaku-purple/10 rounded-2xl p-6 border border-otaku-purple/30 card-hover relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-otaku-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <h3 className="text-otaku-purple font-bold mb-3 text-lg relative z-10">🎌 Anime</h3>
                    <p className="text-4xl font-black text-text-primary mb-2 relative z-10 animate-glow">
                      {platformStats?.totalAnime || "0"}
                    </p>
                    <p className="text-sm text-text-secondary relative z-10">Dans la base</p>
                  </div>
                  <div className="bg-gradient-to-br from-anime-red/20 to-anime-red/10 rounded-2xl p-6 border border-anime-red/30 card-hover relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-anime-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <h3 className="text-anime-red font-bold mb-3 text-lg relative z-10">💬 Messages</h3>
                    <p className="text-4xl font-black text-text-primary mb-2 relative z-10 animate-glow">
                      {platformStats?.totalMessages || "0"}
                    </p>
                    <p className="text-sm text-text-secondary relative z-10">Messages envoyés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-otaku-purple to-anime-red bg-clip-text text-transparent">
                  Gestion des Quiz
                </h2>
                <Button className="relative bg-gradient-to-r from-otaku-purple to-anime-red hover:from-anime-red hover:to-otaku-purple text-white rounded-xl px-6 py-3 shadow-lg shadow-otaku-purple/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-anime-red/40 btn-hover group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Plus className="h-5 w-5 mr-2 relative z-10" />
                  <span className="relative z-10 font-semibold">Nouveau Quiz</span>
                </Button>
              </div>

              <Card className="bg-gradient-to-br from-card-bg/90 to-card-bg/70 border border-otaku-purple/20 backdrop-blur-lg rounded-2xl shadow-xl shadow-otaku-purple/10 card-hover">
                <CardHeader className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-anime-red/20 to-transparent rounded-full"></div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-anime-red to-electric-blue bg-clip-text text-transparent relative z-10">
                    Guide de création de quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-otaku-purple/20 to-anime-red/10 rounded-2xl p-6 border border-otaku-purple/30">
                    <h3 className="text-xl font-bold text-otaku-purple mb-4">📝 Comment créer un quiz</h3>
                    <div className="space-y-4 text-text-secondary">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-electric-blue to-hot-pink rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                        <div>
                          <p className="font-semibold text-text-primary">Utilisez l'API directement</p>
                          <p className="text-sm">Envoyez une requête POST à <code className="bg-app-bg px-2 py-1 rounded text-electric-blue">/api/quizzes</code></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-hot-pink to-otaku-purple rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                        <div>
                          <p className="font-semibold text-text-primary">Modifiez le seed.ts</p>
                          <p className="text-sm">Ajoutez vos quiz dans <code className="bg-app-bg px-2 py-1 rounded text-hot-pink">server/seed.ts</code> et redémarrez</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-otaku-purple to-anime-red rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                        <div>
                          <p className="font-semibold text-text-primary">Interface admin (bientôt)</p>
                          <p className="text-sm">Une interface complète sera ajoutée prochainement</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-gradient-to-r from-electric-blue/20 to-hot-pink/10 rounded-2xl p-6 border border-electric-blue/30">
                    <h4 className="text-lg font-bold text-electric-blue mb-3">🎯 Format d'un quiz</h4>
                    <pre className="bg-app-bg rounded-lg p-4 text-sm overflow-x-auto">
<code className="text-text-secondary">{`{
  "title": "Mon Quiz Anime",
  "description": "Testez vos connaissances !",
  "difficulty": "medium", // easy, medium, hard
  "xpReward": 20,
  "questions": [
    {
      "question": "Qui est le protagoniste de Naruto ?",
      "options": ["Sasuke", "Naruto", "Sakura", "Kakashi"],
      "correctAnswer": 1,
      "explanation": "Naruto Uzumaki est le héros principal."
    }
  ]
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <Card className="bg-card-bg border-border">
              <CardHeader>
                <CardTitle className="text-text-primary">Gestion du contenu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-text-secondary text-center py-8">
                  Section en cours de développement
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={isEditPostOpen} onOpenChange={setIsEditPostOpen}>
        <DialogContent className="bg-card-bg text-text-primary border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le post</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => 
              selectedPost && updatePostMutation.mutate({ id: selectedPost.id, data })
            )} className="space-y-4">
              <div className="space-y-4 pb-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre du post" {...field} className="bg-app-bg border-border text-text-primary" />
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
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-app-bg border-border text-text-primary">
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card-bg border-border">
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
                      <FormLabel>URL de l'image (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} className="bg-app-bg border-border text-text-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Contenu du post..." 
                          className="min-h-[120px] bg-app-bg border-border text-text-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Publier</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="adminOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Admin uniquement</FormLabel>
                        <p className="text-xs text-text-secondary">
                          Visible seulement dans l'espace admin
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditPostOpen(false);
                      setSelectedPost(null);
                      editForm.reset();
                    }}
                    className="flex-1 border-border hover:bg-accent-hover/10"
                    disabled={updatePostMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-accent-primary hover:bg-accent-hover text-white"
                    disabled={updatePostMutation.isPending}
                  >
                    {updatePostMutation.isPending ? "Modification..." : "Modifier"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
