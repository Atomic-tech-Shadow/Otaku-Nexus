import { cn } from "@/lib/utils";

interface TwitterVerificationBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TwitterVerificationBadge({ className, size = "md" }: TwitterVerificationBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="12" cy="12" r="12" fill="#1DA1F2"/>
        <path 
          d="M9.75 15.25L7 12.5l1.5-1.5 1.25 1.25L14.5 7.5 16 9l-6.25 6.25z" 
          fill="white"
          strokeWidth="0"
        />
      </svg>
    </div>
  );
}

interface FacebookVerificationBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FacebookVerificationBadge({ className, size = "md" }: FacebookVerificationBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="12" cy="12" r="12" fill="#1877F2"/>
        <path 
          d="M9.75 15.25L7 12.5l1.5-1.5 1.25 1.25L14.5 7.5 16 9l-6.25 6.25z" 
          fill="white"
          strokeWidth="0"
        />
      </svg>
    </div>
  );
}

interface InstagramVerificationBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function InstagramVerificationBadge({ className, size = "md" }: InstagramVerificationBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="12" cy="12" r="12" fill="#E4405F"/>
        <path 
          d="M9.75 15.25L7 12.5l1.5-1.5 1.25 1.25L14.5 7.5 16 9l-6.25 6.25z" 
          fill="white"
          strokeWidth="0"
        />
      </svg>
    </div>
  );
}

interface GenericVerificationBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function GenericVerificationBadge({ 
  className, 
  size = "md", 
  color = "#1DA1F2" 
}: GenericVerificationBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="12" cy="12" r="12" fill={color}/>
        <path 
          d="M9.75 15.25L7 12.5l1.5-1.5 1.25 1.25L14.5 7.5 16 9l-6.25 6.25z" 
          fill="white"
          strokeWidth="0"
        />
      </svg>
    </div>
  );
}