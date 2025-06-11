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

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: isAuthenticated,
  });

  // Fetch platform stats
  const { data: platformStats } = useQuery({
    queryKey: ['/api/admin/platform-stats'],
    enabled: isAuthenticated,
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/posts'] });
    },
    onError: (error) => {
      console.error('Toggle publish error:', error);
      toast({ title: "Erreur", description: "Impossible de changer le statut de publication", variant: "destructive" });
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-app-bg via-app-bg to-electric-blue/5 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card-bg border-border">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-text-primary mb-2">Accès Refusé</h2>
            <p className="text-text-secondary mb-4">Vous devez être connecté pour accéder à cette page.</p>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-bg via-app-bg to-electric-blue/5 text-text-primary">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-electric-blue to-hot-pink flex items-center justify-center shadow-lg">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-electric-blue via-hot-pink to-otaku-purple bg-clip-text text-transparent">
                Administration
              </h1>
              <p className="text-text-secondary mt-1">Panneau de contrôle de la plateforme</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="border-border bg-card-bg text-text-primary hover:bg-card-bg/80"
            >
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="posts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card-bg border border-border rounded-2xl p-2">
            <TabsTrigger value="posts" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-electric-blue data-[state=active]:to-hot-pink data-[state=active]:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-electric-blue/20 to-hot-pink/20">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Publications</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-otaku-purple data-[state=active]:to-anime-red data-[state=active]:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-otaku-purple/20 to-anime-red/20">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Statistiques</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-hot-pink data-[state=active]:to-otaku-purple data-[state=active]:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-hot-pink/20 to-otaku-purple/20">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-anime-red data-[state=active]:to-electric-blue data-[state=active]:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-anime-red/20 to-electric-blue/20">
                <Video className="h-4 w-4" />
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
                    <DialogHeader className="border-b border-white/10 pb-6">
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
                                      className="backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl"
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
                                    <SelectTrigger className="backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-xl">
                                      <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-800 border-white/20">
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
                                <FormLabel className="text-white font-semibold">URL de l'Image (Optionnel)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/image.jpg"
                                    {...field}
                                    className="backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl"
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
                                  className="backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl min-h-[120px] resize-none"
                                  {...field}
                                />
                              </FormControl>
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
                              <Badge 
                                variant={post.type === 'announcement' ? 'default' : post.type === 'event' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {post.type === 'announcement' && '📢 Annonce'}
                                {post.type === 'event' && '🎉 Événement'}
                                {post.type === 'update' && '🔄 Mise à jour'}
                              </Badge>
                              {post.isPublished ? (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  ✅ Publié
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                                  ⏳ Brouillon
                                </Badge>
                              )}
                              {post.adminOnly && (
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                  👨‍💼 Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/70 text-sm line-clamp-2 mb-3">
                              {post.content}
                            </p>
                            <p className="text-white/50 text-xs">
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
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
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
                <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 hover:bg-blue-500/30 transition-all duration-300 group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h3 className="text-electric-blue font-bold mb-3 text-lg relative z-10">👥 Utilisateurs</h3>
                  <p className="text-4xl font-black text-text-primary mb-2 relative z-10 animate-glow">
                    {platformStats?.totalUsers || "0"}
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
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-otaku-purple to-anime-red bg-clip-text text-transparent">
                  Gestion des Quiz
                </h2>
                <div className="flex gap-3">
                  <Button 
                    onClick={async () => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer TOUS les quiz ? Cette action est irréversible.')) {
                        try {
                          const response = await apiRequest('/api/quizzes/all', { method: 'DELETE' });
                          toast({ title: "Succès", description: "Tous les quiz ont été supprimés" });
                          window.location.reload();
                        } catch (error) {
                          console.error('Delete error:', error);
                          toast({ title: "Erreur", description: "Impossible de supprimer les quiz", variant: "destructive" });
                        }
                      }
                    }}
                    variant="destructive" 
                    className="px-4 py-2 text-sm"
                  >
                    🗑️ Supprimer tous les quiz
                  </Button>
                  <Button className="relative bg-gradient-to-r from-otaku-purple to-anime-red hover:from-anime-red hover:to-otaku-purple text-white rounded-xl px-6 py-3 shadow-lg shadow-otaku-purple/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-anime-red/40 btn-hover group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Plus className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10 font-semibold">Nouveau Quiz</span>
                  </Button>
                </div>
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
            <DialogTitle>Modifier la Publication</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (editingPost) {
                updatePostMutation.mutate({ id: editingPost.id, ...data });
              }
            })} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'Image</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Textarea {...field} className="min-h-[100px]" />
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publié</FormLabel>
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Admin uniquement</FormLabel>
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
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditPostOpen(false);
                      setEditingPost(null);
                      editForm.reset();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={updatePostMutation.isPending}>
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