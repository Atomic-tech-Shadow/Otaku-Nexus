
import { Bell, Settings, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { TwitterVerificationBadge, FacebookVerificationBadge } from "@/components/ui/verification-badges";
import ProfileAvatar from "@/components/ui/profile-avatar";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AppHeader() {
  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  // Calculs sécurisés avec valeurs par défaut
  const currentLevel = user?.level ?? 1;
  const currentXP = user?.xp ?? 0;
  const xpToNextLevel = 100;
  const xpProgress = Math.min(((currentXP % xpToNextLevel) / xpToNextLevel) * 100, 100);

  const handleLogout = () => {
    logout();
  };

  const handleNotifications = () => {
    setHasNewNotifications(false);
    toast({
      title: "Notifications",
      description: "Aucune nouvelle notification pour le moment.",
    });
  };

  if (isLoading) {
    return (
      <header className="relative z-10 bg-nexus-surface/95 backdrop-blur-lg border-b border-nexus-cyan/20">
        <div className="max-w-sm mx-auto px-3 py-2">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded-md mb-2"></div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-700 rounded mb-1"></div>
                <div className="h-2 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-10 bg-nexus-surface/95 backdrop-blur-lg border-b border-nexus-cyan/20">
      <div className="max-w-sm mx-auto px-3 py-2">
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-bold bg-gradient-to-r from-nexus-cyan to-nexus-purple bg-clip-text text-transparent"
          >
            Otaku Nexus
          </motion.h1>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            {/* Modern Profile Avatar */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <ProfileAvatar 
                imageUrl={user?.profileImageUrl}
                name={user?.firstName || user?.username || 'Otaku'}
                size="md"
                showOnlineIndicator={true}
              />
            </motion.div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <h2 className="text-xs font-semibold text-white truncate">
                  {user?.firstName || user?.username || 'Anonymous Otaku'}
                </h2>
                {user?.isAdmin && (
                  <TwitterVerificationBadge size="sm" />
                )}
                {user?.id === "71394585" && (
                  <FacebookVerificationBadge size="sm" />
                )}
              </div>
              
              {/* Level and XP Bar */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-nexus-cyan font-medium whitespace-nowrap">
                  Niv {currentLevel}
                </span>
                <div className="flex-1 max-w-16 h-1.5 bg-nexus-surface rounded-full overflow-hidden border border-nexus-cyan/20">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-nexus-cyan to-nexus-purple rounded-full"
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{currentXP}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 ml-2">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 p-2"
                  title="Administration"
                >
                  <Shield className="w-4 h-4" />
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNotifications}
              className="relative text-gray-300 hover:text-nexus-cyan hover:bg-nexus-cyan/10 transition-all duration-300 p-2"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasNewNotifications && (
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                />
              )}
            </Button>
            
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-nexus-purple hover:bg-nexus-purple/10 transition-all duration-300 p-2"
                title="Paramètres"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 p-2"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
