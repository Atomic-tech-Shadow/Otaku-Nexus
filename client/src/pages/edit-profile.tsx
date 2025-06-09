import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Save, User, Quote, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const profileSchema = z.object({
  username: z.string().min(2, "Le nom d'utilisateur doit faire au moins 2 caractères").optional(),
  bio: z.string().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
  favoriteQuote: z.string().max(200, "La citation ne peut pas dépasser 200 caractères").optional(),
  profileImageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
});

export default function EditProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string>("");

  // Redirect to login if not authenticated
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
  }, [isAuthenticated, toast]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      bio: "",
      favoriteQuote: "",
      profileImageUrl: "",
    },
  });

  // Load user data into form when available
  useEffect(() => {
    if (user) {
      form.setValue("username", user.username || "");
      form.setValue("bio", user.bio || "");
      form.setValue("favoriteQuote", user.favoriteQuote || "");
      form.setValue("profileImageUrl", user.profileImageUrl || "");
      setImagePreview(user.profileImageUrl || "");
    }
  }, [user, form]);

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return await apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    form.setValue("profileImageUrl", url);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">👤 Modifier le profil</h1>
          <p className="text-blue-200">Personnalisez votre profil otaku</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-black/20 backdrop-blur-lg border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage 
                      src={imagePreview || user?.profileImageUrl} 
                      alt="Profile" 
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.username?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-white font-semibold text-lg">
                    {form.watch("username") || user?.username || "Nom d'utilisateur"}
                  </h3>
                  <p className="text-blue-200 text-sm">{user?.email}</p>
                </div>

                {form.watch("bio") && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-300 text-sm italic">
                      "{form.watch("bio")}"
                    </p>
                  </div>
                )}

                {form.watch("favoriteQuote") && (
                  <div className="bg-blue-900/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                      <p className="text-blue-200 text-sm">
                        {form.watch("favoriteQuote")}
                      </p>
                    </div>
                  </div>
                )}

                {stats && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Niveau</span>
                      <span className="text-white font-semibold">{user?.level || 1}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">XP</span>
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {stats.totalXP}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Quiz terminés</span>
                      <span className="text-green-400">{stats.totalQuizzes}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Anime favoris</span>
                      <span className="text-pink-400">{stats.totalAnime}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 backdrop-blur-lg border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Informations du profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Nom d'utilisateur</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Votre nom d'utilisateur"
                              className="bg-gray-800 border-gray-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profileImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">URL de la photo de profil</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://exemple.com/votre-photo.jpg"
                              className="bg-gray-800 border-gray-600 text-white"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleImageUrlChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-gray-400 mt-1">
                            Utilisez une URL d'image publique (ex: depuis Imgur, Google Photos, etc.)
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Parlez-nous de vous, de vos anime préférés..."
                              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-gray-400 mt-1">
                            {form.watch("bio")?.length || 0}/500 caractères
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="favoriteQuote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Citation favorite</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Votre citation d'anime préférée..."
                              className="bg-gray-800 border-gray-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-gray-400 mt-1">
                            {form.watch("favoriteQuote")?.length || 0}/200 caractères
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-6 bg-black/20 backdrop-blur-lg border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-lg">💡 Conseils</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• Utilisez une photo de profil claire pour que les autres vous reconnaissent</p>
                <p>• Votre bio peut inclure vos anime favoris, genres préférés, etc.</p>
                <p>• Les citations d'anime ajoutent une touche personnelle à votre profil</p>
                <p>• Complétez des quiz pour gagner de l'XP et monter de niveau</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}