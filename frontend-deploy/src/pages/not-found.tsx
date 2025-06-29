import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Page non trouvée
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              La page que vous recherchez n'existe pas.
            </p>
            <Link href="/">
              <Button className="flex items-center gap-2">
                <Home size={16} />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
