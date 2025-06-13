import { useState } from "react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  Brain, 
  Star, 
  Target,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Upload,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import AppHeader from "@/components/layout/app-header";

const questionSchema = z.object({
  question: z.string().min(1, "La question est requise"),
  options: z.array(z.string().min(1, "L'option ne peut pas être vide")).min(2, "Au moins 2 options requises").max(6, "Maximum 6 options"),
  correctAnswer: z.number().min(0, "Réponse correcte requise"),
  explanation: z.string().optional(),
  imageUrl: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  points: z.number().min(1).max(100).default(10)
});

const quizSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  category: z.enum(["anime", "manga", "general", "characters", "opening", "ending", "studio"]),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  questions: z.array(questionSchema).min(1, "Au moins une question requise"),
  timeLimit: z.number().min(30).max(3600).default(300),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  thumbnailUrl: z.string().optional(),
  maxAttempts: z.number().min(1).max(10).default(3)
});

type QuizFormData = z.infer<typeof quizSchema>;
type QuestionFormData = z.infer<typeof questionSchema>;

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: any[];
  timeLimit: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminQuizCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("create");
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "anime",
      difficulty: "medium",
      questions: [
        {
          question: "",
          options: ["", ""],
          correctAnswer: 0,
          explanation: "",
          imageUrl: "",
          difficulty: "medium",
          points: 10
        }
      ],
      timeLimit: 300,
      isPublished: false,
      isFeatured: false,
      tags: [],
      thumbnailUrl: "",
      maxAttempts: 3
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  // Queries
  const { data: quizzes = [], isLoading: quizzesLoading, refetch } = useQuery<Quiz[]>({
    queryKey: ["/api/admin/quizzes"],
    enabled: !!user?.isAdmin,
  });

  // Mutations
  const createQuizMutation = useMutation({
    mutationFn: (quizData: QuizFormData) => apiRequest('/api/admin/quizzes', { 
      method: 'POST', 
      body: JSON.stringify(quizData),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      form.reset();
      setIsCreateDialogOpen(false);
      toast({ title: "Quiz créé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la création du quiz", variant: "destructive" });
    }
  });

  const updateQuizMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<QuizFormData> }) => 
      apiRequest(`/api/admin/quizzes/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      setEditingQuiz(null);
      toast({ title: "Quiz mis à jour avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/quizzes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      toast({ title: "Quiz supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  });

  const addQuestion = () => {
    append({
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
      imageUrl: "",
      difficulty: "medium",
      points: 10
    });
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length < 6) {
      form.setValue(`questions.${questionIndex}.options`, [...currentOptions, ""]);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
      form.setValue(`questions.${questionIndex}.options`, newOptions);
      
      // Ajuster la réponse correcte si nécessaire
      const correctAnswer = form.getValues(`questions.${questionIndex}.correctAnswer`);
      if (correctAnswer >= newOptions.length) {
        form.setValue(`questions.${questionIndex}.correctAnswer`, 0);
      }
    }
  };

  const onSubmit = (data: QuizFormData) => {
    createQuizMutation.mutate(data);
  };

  const publishQuiz = (quiz: Quiz) => {
    updateQuizMutation.mutate({
      id: quiz.id,
      data: { isPublished: !quiz.isPublished }
    });
  };

  const featureQuiz = (quiz: Quiz) => {
    updateQuizMutation.mutate({
      id: quiz.id,
      data: { isFeatured: !quiz.isFeatured }
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-400">Vous n'avez pas les permissions administrateur</p>
        </div>
      </div>
    );
  }

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
            Gestionnaire de Quiz
          </h1>
          <p className="text-gray-400">
            Créez, modifiez et publiez des quiz pour votre communauté
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Créer un Quiz
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Gérer les Quiz
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          {/* Création de quiz */}
          <TabsContent value="create" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Créateur de Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Informations générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Titre du Quiz</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Quiz sur les personnages de Naruto" 
                                {...field} 
                                className="bg-gray-700 border-gray-600 text-white" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="anime">Anime</SelectItem>
                                <SelectItem value="manga">Manga</SelectItem>
                                <SelectItem value="characters">Personnages</SelectItem>
                                <SelectItem value="opening">Génériques d'ouverture</SelectItem>
                                <SelectItem value="ending">Génériques de fin</SelectItem>
                                <SelectItem value="studio">Studios</SelectItem>
                                <SelectItem value="general">Général</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez votre quiz..." 
                              {...field} 
                              className="bg-gray-700 border-gray-600 text-white" 
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Difficulté</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Facile</SelectItem>
                                <SelectItem value="medium">Moyen</SelectItem>
                                <SelectItem value="hard">Difficile</SelectItem>
                                <SelectItem value="mixed">Mixte</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Temps limite (secondes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="30" 
                                max="3600" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="bg-gray-700 border-gray-600 text-white" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Tentatives max</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="10" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="bg-gray-700 border-gray-600 text-white" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">Questions</h3>
                        <Button
                          type="button"
                          onClick={addQuestion}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une question
                        </Button>
                      </div>

                      <AnimatePresence>
                        {fields.map((field, questionIndex) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-700/50 border border-gray-600 rounded-lg p-6"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-white">Question {questionIndex + 1}</h4>
                              <div className="flex items-center gap-2">
                                {questionIndex > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => move(questionIndex, questionIndex - 1)}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                )}
                                {questionIndex < fields.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => move(questionIndex, questionIndex + 1)}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(questionIndex)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`questions.${questionIndex}.question`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Question</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Tapez votre question ici..." 
                                        {...field} 
                                        className="bg-gray-800 border-gray-600 text-white" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`questions.${questionIndex}.difficulty`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white">Difficulté</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="easy">Facile</SelectItem>
                                          <SelectItem value="medium">Moyen</SelectItem>
                                          <SelectItem value="hard">Difficile</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`questions.${questionIndex}.points`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white">Points</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          min="1" 
                                          max="100" 
                                          {...field} 
                                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                                          className="bg-gray-800 border-gray-600 text-white" 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Options de réponse */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-white">Options de réponse</FormLabel>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(questionIndex)}
                                    disabled={form.watch(`questions.${questionIndex}.options`).length >= 6}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Ajouter
                                  </Button>
                                </div>
                                
                                {form.watch(`questions.${questionIndex}.options`).map((_, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <FormField
                                      control={form.control}
                                      name={`questions.${questionIndex}.correctAnswer`}
                                      render={({ field }) => (
                                        <input
                                          type="radio"
                                          checked={field.value === optionIndex}
                                          onChange={() => field.onChange(optionIndex)}
                                          className="text-green-500"
                                        />
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`questions.${questionIndex}.options.${optionIndex}`}
                                      render={({ field }) => (
                                        <FormControl>
                                          <Input 
                                            placeholder={`Option ${optionIndex + 1}`}
                                            {...field} 
                                            className="bg-gray-800 border-gray-600 text-white flex-1" 
                                          />
                                        </FormControl>
                                      )}
                                    />
                                    {form.watch(`questions.${questionIndex}.options`).length > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(questionIndex, optionIndex)}
                                        className="text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <FormField
                                control={form.control}
                                name={`questions.${questionIndex}.explanation`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Explication (optionnel)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Expliquez la bonne réponse..." 
                                        {...field} 
                                        className="bg-gray-800 border-gray-600 text-white" 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Options de publication */}
                    <div className="flex items-center gap-6 p-4 bg-gray-700/30 rounded-lg">
                      <FormField
                        control={form.control}
                        name="isPublished"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-white">Publier immédiatement</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-white">Quiz mis en avant</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                      >
                        Réinitialiser
                      </Button>
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={createQuizMutation.isPending}
                      >
                        {createQuizMutation.isPending ? "Création..." : "Créer le Quiz"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des quiz */}
          <TabsContent value="manage" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Quiz existants ({quizzes.length})
                  </span>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                  >
                    Actualiser
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quizzesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz) => (
                      <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-white text-sm line-clamp-2">{quiz.title}</h3>
                            <div className="flex items-center gap-1">
                              {quiz.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                              {quiz.isPublished ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs ${
                              quiz.category === 'anime' ? 'bg-purple-500/20 text-purple-400' :
                              quiz.category === 'manga' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {quiz.category}
                            </Badge>
                            <Badge className={`text-xs ${
                              quiz.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                              quiz.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {quiz.difficulty}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-400 text-xs line-clamp-2">{quiz.description}</p>
                          
                          <div className="text-xs text-gray-500">
                            {quiz.questions?.length || 0} questions • {Math.floor(quiz.timeLimit / 60)}min
                          </div>
                          
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-600">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => publishQuiz(quiz)}
                              className={quiz.isPublished ? "text-orange-400" : "text-green-400"}
                            >
                              {quiz.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => featureQuiz(quiz)}
                              className={quiz.isFeatured ? "text-yellow-400" : "text-gray-400"}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingQuiz(quiz)}
                            >
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
                                  <AlertDialogTitle>Supprimer le quiz</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteQuizMutation.mutate(quiz.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistiques */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Quiz</p>
                      <p className="text-2xl font-bold text-white">{quizzes.length}</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Publiés</p>
                      <p className="text-2xl font-bold text-white">
                        {quizzes.filter(q => q.isPublished).length}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">En vedette</p>
                      <p className="text-2xl font-bold text-white">
                        {quizzes.filter(q => q.isFeatured).length}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Brouillons</p>
                      <p className="text-2xl font-bold text-white">
                        {quizzes.filter(q => !q.isPublished).length}
                      </p>
                    </div>
                    <EyeOff className="h-8 w-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}