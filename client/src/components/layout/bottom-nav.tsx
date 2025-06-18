import { Home, Brain, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

export default function BottomNav() {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Brain, label: "Quiz", path: "/quiz" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-sm mx-auto">
        <nav className="bg-nexus-surface/95 backdrop-blur-lg border-t border-nexus-cyan/20 px-3 py-2">
          <div className="flex items-center justify-around">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location === path;
              return (
                <Link key={path} to={path}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-nexus-cyan/20 text-nexus-cyan"
                        : "text-gray-400 hover:text-nexus-purple hover:bg-nexus-purple/10"
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-nexus-cyan to-nexus-purple rounded-full"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    )}
                    
                    <Icon 
                      className={`w-6 h-6 mb-1 transition-all duration-300 ${
                        isActive ? "text-nexus-cyan scale-110" : ""
                      }`} 
                    />
                    <span 
                      className={`text-xs font-medium transition-all duration-300 ${
                        isActive ? "text-nexus-cyan" : ""
                      }`}
                    >
                      {label}
                    </span>
                    
                    {/* Glow effect for active item */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-nexus-cyan/10 animate-pulse" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}