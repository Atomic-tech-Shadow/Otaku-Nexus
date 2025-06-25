import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Quiz from "@/pages/quiz";
import QuizDetail from "@/pages/quiz-detail";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";
import EditProfile from "@/pages/edit-profile";
import AuthPage from "@/pages/auth";
import Admin from "@/pages/admin";
import AnimeSama from "@/pages/anime-sama";
import AnimeSearch from "@/pages/anime-search";

import { ProtectedRoute } from "@/components/auth/protected-route";


function Router() {

  return (
    <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/landing" component={Landing} />
        <Route path="/">
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Route>

        <Route path="/quiz">
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        </Route>
        <Route path="/quiz/:id">
          <ProtectedRoute>
            <QuizDetail />
          </ProtectedRoute>
        </Route>

        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/edit-profile">
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        </Route>

        <Route path="/chat">
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        </Route>

        <Route path="/admin">
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        </Route>

        <Route path="/anime-sama">
          <ProtectedRoute>
            <AnimeSama />
          </ProtectedRoute>
        </Route>
        
        <Route path="/anime-search">
          <ProtectedRoute>
            <AnimeSearch />
          </ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="mobile-container bg-animated">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;