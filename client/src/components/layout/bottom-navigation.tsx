import { Home, Search, Brain, Play, User } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Anime", path: "/anime" },
    { icon: Brain, label: "Quiz", path: "/quiz" },
    { icon: Play, label: "Videos", path: "/videos" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card-bg border-t border-gray-800">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button className="flex flex-col items-center py-2 px-3">
                <item.icon 
                  className={cn(
                    "w-5 h-5 mb-1",
                    isActive ? "electric-blue" : "text-gray-400"
                  )} 
                />
                <span 
                  className={cn(
                    "text-xs",
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
