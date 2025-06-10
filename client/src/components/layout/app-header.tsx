import { Bell, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function AppHeader() {
  const { user } = useAuth();

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const xpProgress = ((currentXP % 100) / 100) * 100;

  return (
    <header className="relative z-10 p-4 bg-gradient-to-r from-card-bg to-secondary-bg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Profile image */}
          <div className="w-12 h-12 rounded-full border-2 border-electric-blue overflow-hidden">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-electric-blue to-hot-pink flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {(user?.firstName || user?.username || 'O').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              {user?.firstName || user?.username || 'Anonymous Otaku'}
              {user?.id === "71394585" && (
                <div className="relative flex items-center justify-center w-4 h-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0l2.09 4.26L18 5.27l-3 2.92.71 4.14L12 10.77 8.29 12.33 9 8.19l-3-2.92 3.91-.61L12 0z"/>
                    <path d="M10 13l-2-2 1.41-1.41L10 10.17l4.59-4.58L16 7l-6 6z" fill="#fff"/>
                  </svg>
                </div>
              )}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs electric-blue">Level {currentLevel}</span>
              <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-electric-blue to-hot-pink rounded-full transition-all duration-300" 
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {user?.isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
                <Shield className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-anime-red rounded-full text-xs"></span>
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5 text-gray-300" />
          </Button>
        </div>
      </div>
    </header>
  );
}