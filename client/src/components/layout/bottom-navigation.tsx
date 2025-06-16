import { Home, MessageCircle, User, BookOpen, Brain, Monitor } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/useAuth';

interface BottomNavigationProps {
  currentPath?: string;
}

export default function BottomNavigation({ currentPath: propCurrentPath }: BottomNavigationProps) {
  const [location] = useLocation();
  const currentPath = propCurrentPath || location;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: Monitor, label: "Streaming", path: "/anime-streaming" },
    { icon: User, label: "Profil", path: "/profile" },
    { icon: BookOpen, label: "Manga", path: "/manga" },
    { icon: Brain, label: "Quiz", path: "/quiz" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-bg/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around px-1 py-2 max-w-full">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center p-1 min-w-0 flex-1 transition-colors ${
                isActive
                  ? "text-accent-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-medium truncate max-w-full leading-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}