
import { Bell, Settings, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { TwitterVerificationBadge, FacebookVerificationBadge } from "@/components/ui/verification-badges";
import { motion } from "framer-motion";

export default function AppHeader() {
  const { user, logout, isLoading } = useAuth();

  // Calculs sécurisés avec valeurs par défaut
  const currentLevel = user?.level ?? 1;
  const currentXP = user?.xp ?? 0;
  const xpToNextLevel = 100;
  const xpProgress = Math.min(((currentXP % xpToNextLevel) / xpToNextLevel) * 100, 100);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <header className="relative z-10 bg-nexus-surface/95 backdrop-blur-lg border-b border-nexus-cyan/20">
        <div className="max-w-md mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded-md mb-4"></div>
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
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
      <div className="max-w-md mx-auto p-4">
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold bg-gradient-to-r from-nexus-cyan to-nexus-purple bg-clip-text text-transparent"
          >
            Otaku Nexus
          </motion.h1>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Modern Profile Avatar */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-14 h-14 rounded-full border-2 border-nexus-cyan/50 overflow-hidden bg-gradient-to-br from-nexus-cyan/20 to-nexus-purple/20 flex-shrink-0"
            >
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Fallback Avatar */}
              <div className={`w-full h-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center ${user?.profileImageUrl ? 'hidden' : ''}`}>
                <span className="text-lg font-bold text-white">
                  {(user?.firstName || user?.username || 'O').charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Active indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-nexus-surface"></div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-white truncate">
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
              <div className="flex items-center space-x-2">
                <span className="text-xs text-nexus-cyan font-medium whitespace-nowrap">
                  Niveau {currentLevel}
                </span>
                <div className="flex-1 max-w-20 h-2 bg-nexus-surface rounded-full overflow-hidden border border-nexus-cyan/20">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-nexus-cyan to-nexus-purple rounded-full"
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{currentXP} XP</span>
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
              className="relative text-gray-300 hover:text-nexus-cyan hover:bg-nexus-cyan/10 transition-all duration-300 p-2"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
              />
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
