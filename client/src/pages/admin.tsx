
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
  const { data: posts = [], isLoading: postsLoading } = useQuery<AdminPost[]>({
    queryKey: ["/api/admin/posts"],
    enabled: isAuthenticated && user?.email === ADMIN_EMAIL,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      return await apiRequest("/api/admin/posts", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      setIsCreatePostOpen(false);
      createForm.reset();
      toast({
        title: "Post créé",
        description: "Le post a été créé avec succès.",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      setIsEditPostOpen(false);
      setSelectedPost(null);
      editForm.reset();
      toast({
        title: "Post mis à jour",
        description: "Le post a été modifié avec succès.",
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
      toast({
        title: "Post supprimé",
        description: "Le post a été supprimé avec succès.",
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
      return await apiRequest("PUT", `/api/admin/posts/${id}`, { isPublished });
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
    <div className="min-h-screen bg-app-bg text-text-primary">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-card-bg/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/"}
                className="text-text-primary hover:bg-accent-hover/10 hover:text-accent-hover"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/"}
                className="text-text-primary hover:bg-accent-hover/10 hover:text-accent-hover"
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-hover rounded-full animate-pulse"></div>
              <span className="text-sm text-accent-hover">Admin connecté</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">⚙️ Administration</h1>
          <p className="text-text-secondary">Gestion de la communauté Otaku</p>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-card-bg border-border">
            <TabsTrigger value="posts" className="flex items-center gap-2 data-[state=active]:bg-accent-primary data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-accent-primary data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-accent-primary data-[state=active]:text-white">
              <Video className="h-4 w-4" />
              Contenu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-6">
              {/* Header with Create Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-primary">Gestion des posts</h2>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent-primary hover:bg-accent-hover text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card-bg text-text-primary border-border max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau post</DialogTitle>
                    </DialogHeader>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit((data) => createPostMutation.mutate(data))}>
                        <div className="space-y-4">
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
                          <div className="flex gap-2">
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
              <Card className="bg-card-bg border-border">
                <CardHeader>
                  <CardTitle className="text-text-primary">Posts existants</CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="text-text-secondary">Chargement des posts...</div>
                  ) : posts.length === 0 ? (
                    <div className="text-text-secondary text-center py-8">
                      Aucun post créé. Commencez par créer votre premier post !
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post: AdminPost) => (
                        <Card key={post.id} className="bg-app-bg border-border">
                          <CardContent className="p-4">
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
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => togglePublishMutation.mutate({
                                    id: post.id,
                                    isPublished: !post.isPublished
                                  })}
                                  disabled={togglePublishMutation.isPending}
                                  className="border-border hover:bg-accent-hover/10"
                                >
                                  {post.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPost(post)}
                                  className="border-border hover:bg-accent-hover/10"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deletePostMutation.mutate(post.id)}
                                  disabled={deletePostMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
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
            <Card className="bg-card-bg border-border">
              <CardHeader>
                <CardTitle className="text-text-primary">Statistiques de la plateforme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-accent-primary/10 rounded-lg p-4 border border-accent-primary/20">
                    <h3 className="text-accent-primary font-semibold mb-2">Utilisateurs</h3>
                    <p className="text-2xl font-bold text-text-primary">--</p>
                    <p className="text-sm text-text-secondary">Total des inscrits</p>
                  </div>
                  <div className="bg-accent-hover/10 rounded-lg p-4 border border-accent-hover/20">
                    <h3 className="text-accent-hover font-semibold mb-2">Quiz</h3>
                    <p className="text-2xl font-bold text-text-primary">--</p>
                    <p className="text-sm text-text-secondary">Quiz terminés</p>
                  </div>
                  <div className="bg-electric-blue/10 rounded-lg p-4 border border-electric-blue/20">
                    <h3 className="electric-blue font-semibold mb-2">Anime</h3>
                    <p className="text-2xl font-bold text-text-primary">--</p>
                    <p className="text-sm text-text-secondary">Dans la base</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
        <DialogContent className="bg-card-bg text-text-primary border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le post</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => 
              selectedPost && updatePostMutation.mutate({ id: selectedPost.id, data })
            )}>
              <div className="space-y-4">
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
                <div className="flex gap-2">
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
