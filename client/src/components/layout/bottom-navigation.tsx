import { Home, Search, Heart, MessageCircle, User, Gamepad2, Play, BookOpen, Brain } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/useAuth';

interface BottomNavigationProps {
  currentPath?: string;
}

export default function BottomNavigation({ currentPath: propCurrentPath }: BottomNavigationProps) {
  const [location] = useLocation();
  const currentPath = propCurrentPath || location;
  const { user } = useAuth();
  const ADMIN_USER_ID = "43652320";
  const isAdmin = user?.id === ADMIN_USER_ID;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Anime", path: "/anime" },
    { icon: Brain, label: "Quiz", path: "/quiz" },
    { path: "/videos", label: "Vidéos", icon: Play },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card-bg border-t border-gray-800">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button className="flex flex-col items-center py-2 px-2 min-w-0 flex-1">
                <item.icon 
                  className={cn(
                    "w-5 h-5 mb-1",
                    isActive ? "electric-blue" : "text-gray-400"
                  )} 
                />
                <span 
                  className={cn(
                    "text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full",
                    isActive ? "electric-blue" : "text-gray-400"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}