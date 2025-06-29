import { cn } from "@/lib/utils";

interface PulseLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseLoader({ size = "md", className }: PulseLoaderProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4"
  };

  return (
    <div className={cn("flex space-x-2", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-electric-blue animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1.4s"
          }}
        />
      ))}
    </div>
  );
}

interface WaveLoaderProps {
  className?: string;
}

export function WaveLoader({ className }: WaveLoaderProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-electric-blue to-hot-pink rounded-full animate-wave"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: "20px"
          }}
        />
      ))}
    </div>
  );
}

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-gray-600"></div>
      <div className="absolute inset-0 rounded-full border-2 border-electric-blue border-t-transparent animate-spin"></div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "image";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    image: "h-48 w-full rounded-lg"
  };

  return (
    <div 
      className={cn(
        "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer bg-[length:200%_100%]",
        variants[variant],
        className
      )}
    />
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FloatingElement({ children, className, delay = 0 }: FloatingElementProps) {
  return (
    <div 
      className={cn("animate-float", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

interface GlowEffectProps {
  children: React.ReactNode;
  color?: "blue" | "pink" | "purple";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function GlowEffect({ children, color = "blue", intensity = "medium", className }: GlowEffectProps) {
  const glowColors = {
    blue: "shadow-electric-blue/30",
    pink: "shadow-hot-pink/30", 
    purple: "shadow-otaku-purple/30"
  };

  const intensities = {
    low: "shadow-lg",
    medium: "shadow-xl",
    high: "shadow-2xl"
  };

  return (
    <div className={cn(
      "transition-all duration-300 hover:scale-105",
      glowColors[color],
      intensities[intensity],
      className
    )}>
      {children}
    </div>
  );
}