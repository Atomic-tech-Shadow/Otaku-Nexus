import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, User, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";
import LoadingSpinner from "@/components/ui/loading-spinner";

const profileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").optional(),
  lastName: z.string().min(1, "Le nom est requis").optional(),
  bio: z.string().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
  profileImageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
});

export default function EditProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [imagePreview, setImagePreview] = useState<string>("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      profileImageUrl: user?.profileImageUrl || "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        profileImageUrl: user.profileImageUrl || "",
      });
      setImagePreview(user.profileImageUrl || "");
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: z.infer<typeof profileSchema>) => {
      return apiRequest("/api/user/profile", {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      setLocation("/profile");
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

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <AppHeader />
      
      <div className="px-4 pb-20">
        <div className="flex items-center mb-6 mt-4">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="p-2 mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Modifier le profil</h1>
            <p className="text-gray-400 text-sm">Personnalisez votre profil otaku</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Preview */}
          <Card className="bg-card-bg hover:bg-secondary-bg transition-all duration-300 card-hover border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Aperçu du profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={imagePreview || user?.profileImageUrl} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-xl bg-electric-blue">
                    {(form.watch("firstName") || user?.firstName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {form.watch("firstName") || user?.firstName} {form.watch("lastName") || user?.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {form.watch("bio") || user?.bio || "Aucune bio définie"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="bg-card-bg hover:bg-secondary-bg transition-all duration-300 card-hover border-gray-800">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Votre prénom"
                              {...field}
                              className="bg-secondary-bg border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Votre nom"
                              {...field}
                              className="bg-secondary-bg border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          URL de l'image de profil
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            className="bg-secondary-bg border-gray-700"
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageUrlChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Parlez-nous de votre passion pour les animés..."
                            {...field}
                            className="bg-secondary-bg border-gray-700 min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 bg-electric-blue hover:bg-electric-blue/80 btn-hover"
                    >
                      {updateProfileMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </>
                      )}
                    </Button>
                    <Link href="/profile">
                      <Button variant="outline" className="border-gray-700">
                        Annuler
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation currentPath="/edit-profile" />
    </div>
  );
}