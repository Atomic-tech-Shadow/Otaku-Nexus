import { useState } from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ModernAvatarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    username?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

export function ModernAvatar({ 
  user, 
  size = "md", 
  className,
  showOnlineStatus = false,
  isOnline = false
}: ModernAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm", 
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };

  const statusSizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-3 w-3", 
    xl: "h-4 w-4"
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const hasValidImage = user?.profileImageUrl && !imageError;

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div className={cn(
        "rounded-full overflow-hidden border-2 border-gray-600 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold text-white shadow-lg",
        sizeClasses[size]
      )}>
        {hasValidImage ? (
          <img
            src={user.profileImageUrl}
            alt={`${user.firstName || user.username || 'User'} avatar`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {user ? getInitials() : <User className="w-1/2 h-1/2" />}
          </div>
        )}
      </div>
      
      {showOnlineStatus && (
        <div className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-gray-800",
          statusSizes[size],
          isOnline ? "bg-green-500" : "bg-gray-500"
        )} />
      )}
    </div>
  );
}

export default ModernAvatar;