import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/layout/app-header";
import BottomNav from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  Brain, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Copy,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newPost, setNewPost] = useState({ title: "", content: "", imageUrl: "" });
  const [editingPost, setEditingPost] = useState<any>(null);
  
  // Quiz management states
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    difficulty: "facile",
    category: "anime",
    imageUrl: "",
    questions: []
  });
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: ""
  });
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Queries
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["/api/posts"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/admin/quizzes"],
    enabled: !!user?.isAdmin,
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPost({ title: "", content: "", imageUrl: "" });
      toast({ title: "Publication créée avec succès" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, ...postData }: any) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error("Failed to update post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditingPost(null);
      toast({ title: "Publication mise à jour" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Publication supprimée" });
    },
  });

  // Quiz mutations
  const createQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(quizData),
      });
      if (!response.ok) throw new Error("Failed to create quiz");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      resetQuizForm();
      toast({ title: "Quiz créé avec succès" });
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, ...quizData }: any) => {
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(quizData),
      });
      if (!response.ok) throw new Error("Failed to update quiz");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      setEditingQuiz(null);
      toast({ title: "Quiz mis à jour" });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete quiz");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      toast({ title: "Quiz supprimé" });
    },
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès refusé</h1>
          <p className="text-gray-400">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) {
      toast({ title: "Erreur", description: "Titre et contenu requis", variant: "destructive" });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const handleUpdatePost = () => {
    if (!editingPost?.title || !editingPost?.content) {
      toast({ title: "Erreur", description: "Titre et contenu requis", variant: "destructive" });
      return;
    }
    updatePostMutation.mutate(editingPost);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AppHeader />
      
      <main className="px-4 py-4 pb-20">
        {/* Page Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Administration</h1>
          <p className="text-gray-400 text-sm">Panneau de contrôle</p>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700 rounded-xl p-1">
            <TabsTrigger 
              value="dashboard" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-1" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="quizzes" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Brain className="h-4 w-4 mr-1" />
              Quiz
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {stats && (
                <>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">{stats.totalUsers || 0}</div>
                      <div className="text-sm text-gray-400">Utilisateurs</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400">{stats.totalQuizzes || 0}</div>
                      <div className="text-sm text-gray-400">Quiz</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{stats.totalPosts || 0}</div>
                      <div className="text-sm text-gray-400">Publications</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{stats.totalMessages || 0}</div>
                      <div className="text-sm text-gray-400">Messages</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {/* Create New Post */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nouvelle Publication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Titre de la publication"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Input
                  placeholder="URL de l'image (optionnel)"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Textarea
                  placeholder="Contenu de la publication"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="bg-gray-900 border-gray-600 text-white min-h-[100px]"
                />
                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {createPostMutation.isPending ? "Création..." : "Créer la publication"}
                </Button>
              </CardContent>
            </Card>

            {/* Posts List */}
            <div className="space-y-3">
              {posts.map((post: any) => (
                <Card key={post.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    {editingPost?.id === post.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                          className="bg-gray-900 border-gray-600 text-white"
                        />
                        <Input
                          value={editingPost.imageUrl || ""}
                          onChange={(e) => setEditingPost({ ...editingPost, imageUrl: e.target.value })}
                          placeholder="URL de l'image"
                          className="bg-gray-900 border-gray-600 text-white"
                        />
                        <Textarea
                          value={editingPost.content}
                          onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                          className="bg-gray-900 border-gray-600 text-white min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpdatePost}
                            disabled={updatePostMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Sauvegarder
                          </Button>
                          <Button
                            onClick={() => setEditingPost(null)}
                            size="sm"
                            variant="outline"
                            className="border-gray-600"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white">{post.title}</h3>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => setEditingPost(post)}
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deletePostMutation.mutate(post.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{post.content}</p>
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
                        )}
                        <div className="text-xs text-gray-500">
                          Par {post.author?.firstName} • {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="space-y-3">
              {users.map((user: any) => (
                <Card key={user.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{user.firstName} {user.lastName}</span>
                          {user.isAdmin && (
                            <Badge variant="secondary" className="bg-red-500/20 text-red-400">Admin</Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs">Niveau {user.level} • {user.xp} XP</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-4">
            <div className="space-y-3">
              {quizzes.map((quiz: any) => (
                <Card key={quiz.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{quiz.title}</h3>
                        <p className="text-gray-400 text-sm">{quiz.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {quiz.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {quiz.questions?.length || 0} questions
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}