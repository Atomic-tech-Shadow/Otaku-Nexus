
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
  const { data: platformStats = {
    totalUsers: "∞",
    totalQuizzes: "∞", 
    totalAnime: "∞",
    totalMessages: "∞"
  } } = useQuery({
    queryKey: ["/api/admin/platform-stats"],
    enabled: isAuthenticated && user?.email === ADMIN_EMAIL,
    queryFn: async () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/"}
                className="text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 rounded-xl backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="h-8 w-px bg-gradient-to-b from-blue-400 to-purple-400 opacity-50"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Panneau Admin</h2>
                  <p className="text-xs text-white/60">Contrôle total</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-100">En ligne</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-6 relative z-10">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Settings className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-100">Espace Administrateur</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tableau de Bord Admin
          </h1>
          <p className="text-xl text-white/70 mb-8">Gérez votre plateforme Otaku avec style et efficacité</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{platformStats?.totalUsers || "∞"}</p>
                  <p className="text-sm text-white/60">Utilisateurs</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{posts.length}</p>
                  <p className="text-sm text-white/60">Publications</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{platformStats?.totalQuizzes || "∞"}</p>
                  <p className="text-sm text-white/60">Quiz</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{platformStats?.totalAnime || "∞"}</p>
                  <p className="text-sm text-white/60">Anime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="space-y-8">
          <TabsList className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-3 shadow-2xl grid w-full grid-cols-4 h-auto">
            <TabsTrigger 
              value="posts" 
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Publications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Statistiques</span>
            </TabsTrigger>
            <TabsTrigger 
              value="quizzes" 
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Quiz</span>
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Contenu</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-8">
              {/* Header with Create Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Gestion des Publications</h2>
                  <p className="text-white/60">Créez et gérez les publications de votre plateforme</p>
                </div>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 shadow-lg transition-all duration-300 hover:scale-105">
                      <Plus className="h-5 w-5 mr-2" />
                      Nouvelle Publication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="backdrop-blur-xl bg-slate-900/95 border border-white/20 max-w-3xl max-h-[90vh] overflow-y-auto text-white shadow-2xl">
                    <DialogHeader className="pb-6">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Créer une Nouvelle Publication
                      </DialogTitle>
                      <p className="text-white/60 mt-2">Partagez du contenu avec votre communauté Otaku</p>
                    </DialogHeader>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-6">
                        <div className="space-y-6">
                          <FormField
                            control={createForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-semibold">Titre de la Publication</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Donnez un titre accrocheur..." 
                                    {...field} 
                                    className="backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-semibold">Type de Contenu</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-xl py-3">
                                        <SelectValue placeholder="Sélectionner un type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="backdrop-blur-xl bg-slate-900/95 border border-white/20 text-white">
                                      <SelectItem value="announcement" className="hover:bg-white/10">
                                        📢 Annonce
                                      </SelectItem>
                                      <SelectItem value="event" className="hover:bg-white/10">
                                        🎉 Événement
                                      </SelectItem>
                                      <SelectItem value="update" className="hover:bg-white/10">
                                        🔄 Mise à jour
                                      </SelectItem>
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
                                  <FormLabel className="text-white font-semibold">Image (optionnel)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="https://exemple.com/image.jpg" 
                                      {...field} 
                                      className="backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl py-3 focus:ring-2 focus:ring-blue-500" 
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
                                    placeholder="Rédigez votre contenu ici... Partagez vos pensées, actualités ou informations avec la communauté." 
                                    className="min-h-[150px] backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <div className="text-xs text-white/50 mt-1">
                                  {field.value?.length || 0} / 2000 caractères
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="isPublished"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-white font-semibold">Publication Immédiate</FormLabel>
                                    <p className="text-xs text-white/60">
                                      Publier dès maintenant
                                    </p>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-blue-500"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="adminOnly"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between backdrop-blur-xl bg-white/5 rounded-xl border border-white/20 p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-white font-semibold">Admin Uniquement</FormLabel>
                                    <p className="text-xs text-white/60">
                                      Visible seulement pour les admins
                                    </p>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-purple-500"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex gap-4 pt-6">
                            <Button 
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsCreatePostOpen(false);
                                createForm.reset();
                              }}
                              className="flex-1 backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl py-3"
                              disabled={createPostMutation.isPending}
                            >
                              Annuler
                            </Button>
                            <Button 
                              type="submit" 
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 shadow-lg transition-all duration-300 hover:scale-105"
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

              {/* Modern Posts List */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Publications Existantes</h3>
                    <p className="text-white/60">Gérez vos publications et leur visibilité</p>
                  </div>
                </div>

                {postsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white/70">Chargement des publications...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="h-10 w-10 text-white/50" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Aucune Publication</h4>
                    <p className="text-white/60 mb-6">Commencez par créer votre première publication pour engager votre communauté</p>
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
                    {posts.map((post: AdminPost, index) => (
                      <div 
                        key={post.id} 
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {post.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  post.type === 'announcement' ? 'bg-blue-500/20 text-blue-300' :
                                  post.type === 'event' ? 'bg-purple-500/20 text-purple-300' :
                                  'bg-green-500/20 text-green-300'
                                }`}>
                                  {post.type === 'announcement' ? '📢 Annonce' :
                                   post.type === 'event' ? '🎉 Événement' :
                                   '🔄 Mise à jour'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                  post.isPublished ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                  {post.isPublished ? (
                                    <>
                                      <Eye className="h-3 w-3" />
                                      Publié
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-3 w-3" />
                                      Brouillon
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                            <p className="text-white/70 text-sm mb-3 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="text-xs text-white/50">
                              Créé le {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePublishMutation.mutate({
                                id: post.id,
                                isPublished: !post.isPublished
                              })}
                              disabled={togglePublishMutation.isPending}
                              className="backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl"
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
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Statistiques de la Plateforme</h3>
                  <p className="text-white/60">Aperçu complet de votre communauté Otaku</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 hover:bg-blue-500/30 transition-all duration-300 group">
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
            </div>
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
