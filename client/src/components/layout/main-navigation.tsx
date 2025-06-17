// Navigation simplifiée pour le header uniquement
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export default function MainNavigation() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between w-full">
      {/* Logo/Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold text-gradient">Otaku Nexus</h1>
      </div>

      {/* User Info */}
      {user && (
        <div className="flex items-center space-x-3 bg-nexus-surface/50 rounded-lg px-4 py-2 border border-nexus-cyan/20">
          <div className="w-8 h-8 bg-nexus-cyan/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-nexus-cyan" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-400">
              Level {user.level} • {user.xp} XP
            </p>
          </div>
        </div>
      )}
    </div>
  );
}