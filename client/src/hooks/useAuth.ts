
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token");
      
      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
        }
        throw new Error("Not authenticated");
      }
      
      return response.json();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      localStorage.removeItem("auth_token");
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
  };
}
