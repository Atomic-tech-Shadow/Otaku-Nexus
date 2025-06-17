import { useState } from "react";

interface ProfileAvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnlineIndicator?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm", 
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl"
};

export default function ProfileAvatar({ 
  imageUrl, 
  name = "User", 
  size = "md", 
  className = "",
  showOnlineIndicator = false 
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = () => {
    return name.charAt(0).toUpperCase();
  };

  const hasValidImage = imageUrl && !imageError && imageUrl.trim() !== "";

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative border-2 border-nexus-cyan/50 ${className}`}>
      {hasValidImage ? (
        <>
          <img 
            src={imageUrl} 
            alt={`${name} profile`} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
          {imageError && (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
              <span className={`font-bold text-white ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : size === "lg" ? "text-xl" : "text-2xl"}`}>
                {getInitials()}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center">
          <span className={`font-bold text-white ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : size === "lg" ? "text-xl" : "text-2xl"}`}>
            {getInitials()}
          </span>
        </div>
      )}
      
      {showOnlineIndicator && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-nexus-surface"></div>
      )}
    </div>
  );
}