
import { Bell, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { TwitterVerificationBadge, FacebookVerificationBadge } from "@/components/ui/verification-badges";
import { motion } from "framer-motion";

export default function AppHeader() {
  const { user } = useAuth();

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const xpProgress = ((currentXP % 100) / 100) * 100;

  return (
    <header className="relative z-10 bg-nexus-surface/95 backdrop-blur-lg border-b border-nexus-cyan/20">
      <div className="max-w-md mx-auto p-4">
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-nexus-cyan to-nexus-purple bg-clip-text text-transparent"
          >
            Otaku Nexus
          </motion.h1>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Modern Profile Avatar */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-14 h-14 rounded-full border-2 border-nexus-cyan/50 overflow-hidden bg-gradient-to-br from-nexus-cyan/20 to-nexus-purple/20"
            >
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {(user?.firstName || user?.username || 'O').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Active indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-nexus-surface"></div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-white">
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
                <span className="text-xs text-nexus-cyan font-medium">
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
                <span className="text-xs text-gray-400">{currentXP} XP</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-nexus-cyan hover:text-nexus-purple hover:bg-nexus-purple/10 transition-all duration-300"
                >
                  <Shield className="w-5 h-5" />
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-gray-300 hover:text-nexus-cyan hover:bg-nexus-cyan/10 transition-all duration-300"
            >
              <Bell className="w-5 h-5" />
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
              />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-nexus-purple hover:bg-nexus-purple/10 transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
