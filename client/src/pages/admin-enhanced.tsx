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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Trash2, 
  Edit, 
  Plus, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  PlayCircle, 
  BookOpen,
  Shield,
  Activity,
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
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

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  xp: number;
  createdAt: string;
}

export default function AdminEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Forms
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

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<AdminPost[]>({
    queryKey: ["/api/admin/posts"],
    enabled: !!user?.isAdmin,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin && activeTab === "users",
  });

  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/quizzes"],
    enabled: !!user?.isAdmin && activeTab === "content",
  });

  const { data: animes = [], isLoading: animesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/anime"],
    enabled: !!user?.isAdmin && activeTab === "content",
  });

  const { data: mangas = [], isLoading: mangasLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/manga"],
    enabled: !!user?.isAdmin && activeTab === "content",
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (postData: any) => apiRequest('/api/admin/posts', { method: 'POST', body: postData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      setIsCreatePostOpen(false);
      createForm.reset();
      toast({ title: "Post créé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la création du post", variant: "destructive" });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({ title: "Post supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Utilisateur supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  });

  const cleanupMutation = useMutation({
    mutationFn: (type: string) => apiRequest('/api/admin/system/cleanup', { 
      method: 'POST', 
      body: { type } 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Nettoyage effectué avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors du nettoyage", variant: "destructive" });
    }
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-400">Vous n'avez pas les permissions administrateur</p>
        </div>
      </div>
    );
  }

  const onCreatePost = (data: z.infer<typeof postSchema>) => {
    createPostMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Administration
          </h1>
          <p className="text-gray-400">
            Gérez votre plateforme otaku
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Système
            </TabsTrigger>
          </TabsList>

          {/* Tableau de bord */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Utilisateurs</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : stats?.totalUsers || 0}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Quiz</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : stats?.totalQuizzes || 0}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Anime</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : stats?.totalAnime || 0}
                      </p>
                    </div>
                    <PlayCircle className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Messages</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : stats?.totalMessages || 0}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Posts</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? "..." : stats?.totalPosts || 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-pink-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activités récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-white text-sm">Système en ligne</p>
                      <p className="text-gray-400 text-xs">Tous les services fonctionnent normalement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-white text-sm">API MangaDx connectée</p>
                      <p className="text-gray-400 text-xs">Service de lecture de manga opérationnel</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestion des utilisateurs
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] })}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Nom d'utilisateur</TableHead>
                        <TableHead className="text-gray-300">XP</TableHead>
                        <TableHead className="text-gray-300">Statut</TableHead>
                        <TableHead className="text-gray-300">Inscription</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="text-white">{user.email}</TableCell>
                          <TableCell className="text-white">{user.username}</TableCell>
                          <TableCell className="text-white">{user.xp}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                Admin
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                Utilisateur
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-400">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion du contenu */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quiz ({quizzes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {quizzesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      quizzes.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                          <span className="text-white text-sm">{quiz.title}</span>
                          <Button variant="ghost" size="sm" className="text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Anime ({animes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {animesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      animes.map((anime) => (
                        <div key={anime.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                          <span className="text-white text-sm">{anime.title}</span>
                          <Button variant="ghost" size="sm" className="text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Manga ({mangas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mangasLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      mangas.map((manga) => (
                        <div key={manga.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                          <span className="text-white text-sm">{manga.title}</span>
                          <Button variant="ghost" size="sm" className="text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gestion des posts */}
          <TabsContent value="posts" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Posts administratifs
                  </span>
                  <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Créer un nouveau post</DialogTitle>
                      </DialogHeader>
                      <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreatePost)} className="space-y-4">
                          <FormField
                            control={createForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Titre</FormLabel>
                                <FormControl>
                                  <Input placeholder="Titre du post" {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                                <FormLabel className="text-white">Contenu</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Contenu du post..." rows={4} {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                                <FormLabel className="text-white">Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue placeholder="Sélectionner un type" />
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

                          <div className="flex items-center gap-4">
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
                                  <FormLabel className="text-white">Publié</FormLabel>
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
                                  <FormLabel className="text-white">Admin uniquement</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsCreatePostOpen(false)}
                            >
                              Annuler
                            </Button>
                            <Button
                              type="submit"
                              className="bg-purple-600 hover:bg-purple-700"
                              disabled={createPostMutation.isPending}
                            >
                              {createPostMutation.isPending ? "Création..." : "Créer"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {postsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-white text-sm">{post.title}</h4>
                              <Badge className={`text-xs px-2 py-1 rounded-full ${
                                post.type === 'announcement' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                post.type === 'event' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              }`}>
                                {post.type === 'announcement' ? 'Annonce' : 
                                 post.type === 'event' ? 'Événement' : 'Mise à jour'}
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
                            </div>
                            <p className="text-gray-300 text-sm line-clamp-2">{post.content}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-400">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletePostMutation.mutate(post.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion du système */}
          <TabsContent value="system" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Maintenance du système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => cleanupMutation.mutate('duplicates')}
                    disabled={cleanupMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Nettoyer les doublons
                  </Button>
                  
                  <Button
                    onClick={() => cleanupMutation.mutate('old_sessions')}
                    disabled={cleanupMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Sessions expirées
                  </Button>
                  
                  <Button
                    onClick={() => cleanupMutation.mutate('unused_data')}
                    disabled={cleanupMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Données orphelines
                  </Button>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">État des services</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">API MangaDx</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 text-sm">Opérationnel</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Base de données</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 text-sm">Connectée</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Serveur</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 text-sm">En ligne</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}