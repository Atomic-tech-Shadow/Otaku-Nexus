
import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Connexion perdue</span>
    </div>
  );
}
