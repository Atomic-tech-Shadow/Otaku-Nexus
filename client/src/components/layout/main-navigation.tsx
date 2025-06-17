import { useState } from "react";
import { Menu, X, Home, Search, BookOpen, Brain, Play, MessageCircle, User, Monitor, Heart, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Brain, label: "Quiz", path: "/quiz" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: User, label: "Profil", path: "/profile" },
    { icon: Settings, label: "Modifier Profil", path: "/edit-profile" },
  ];

  const adminItems = user?.isAdmin ? [
    { icon: Settings, label: "Administration", path: "/admin" },
    { icon: Brain, label: "Créateur de Quiz", path: "/admin/quiz-creator" },
  ] : [];

  const allItems = [...navigationItems, ...adminItems];

  return (
    <>
      {/* Menu Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-card-bg/90 backdrop-blur-sm border border-border"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-card-bg/95 backdrop-blur-md border-r border-border z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-8 mt-12">
                  <h2 className="text-2xl font-bold text-gradient mb-2">Otaku Nexus</h2>
                  <p className="text-text-secondary text-sm">Votre plateforme otaku ultime</p>
                </div>

                {/* User Info */}
                {user && (
                  <div className="mb-6 p-4 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-accent-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-text-secondary">
                          Level {user.level} • {user.xp} XP
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <nav className="space-y-2">
                  {allItems.map(({ icon: Icon, label, path }) => {
                    const isActive = location === path;
                    return (
                      <Link
                        key={path}
                        to={path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-accent-primary text-white"
                            : "text-text-secondary hover:text-text-primary hover:bg-card-bg/60"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-text-secondary text-center">
                    © 2025 Otaku App
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}