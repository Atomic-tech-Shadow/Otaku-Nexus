import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppHeader() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-dark-bg/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-electric-blue to-hot-pink flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-electric-blue to-hot-pink bg-clip-text text-transparent">
              OtakuVerse
            </h1>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          {isAuthenticated && user ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 px-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={user.profileImageUrl}
                      alt="Profile"
                    />
                    <AvatarFallback className="text-xs bg-gradient-to-r from-electric-blue to-hot-pink text-white">
                      {(user.firstName || user.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">
                    {user.firstName || user.username || 'Profile'}
                  </span>
                </div>
              </Button>
            </Link>
          ) : (
            <Link href="/api/login">
              <Button size="sm" className="bg-electric-blue hover:bg-electric-blue/80">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}