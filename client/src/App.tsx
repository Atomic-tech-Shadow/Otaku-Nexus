import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Anime from "@/pages/anime";
import Quiz from "@/pages/quiz";
import QuizDetail from "@/pages/quiz-detail";
import Videos from "@/pages/videos";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";
import EditProfile from "@/pages/edit-profile";
import Admin from "@/pages/admin";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/anime" component={Anime} />
          <Route path="/quiz" component={Quiz} />
          <Route path="/quiz/:id" component={QuizDetail} />
          <Route path="/videos" component={Videos} />
          <Route path="/profile" component={Profile} />
          <Route path="/chat" component={Chat} />
          <Route path="/edit-profile" component={EditProfile} />
          <Route path="/admin" component={Admin} />
        </>
      )}
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
