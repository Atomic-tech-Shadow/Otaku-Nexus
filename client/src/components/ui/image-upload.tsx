import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  currentImage?: string;
  className?: string;
  maxSize?: number; // in MB
}

export function ImageUpload({ onImageUpload, currentImage, className = "", maxSize = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const compressImage = async (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;

        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx?.drawImage(img, 0, 0, width, height);
        
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
        
        URL.revokeObjectURL(img.src);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Formats acceptés: JPG, PNG, GIF, WebP",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale est de ${maxSize}MB.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let processedImage: string;
      
      if (file.size > 1024 * 1024) {
        processedImage = await compressImage(file, 1200, 0.8);
      } else {
        const reader = new FileReader();
        processedImage = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setPreview(processedImage);
      onImageUpload(processedImage);

      toast({
        title: "Image uploadée",
        description: `Image de ${(file.size / 1024 / 1024).toFixed(2)}MB uploadée avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader l'image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeImage = () => {
    setPreview("");
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <Card className="relative overflow-hidden bg-gray-800 border-gray-700">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={removeImage}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card 
          className="border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors cursor-pointer bg-gray-800/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-blue to-hot-pink rounded-2xl flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Ajouter une image
            </h3>
            <p className="text-gray-400 mb-4">
              Cliquez pour sélectionner depuis votre appareil
            </p>
            <Button 
              type="button"
              disabled={uploading}
              className="bg-gradient-to-r from-electric-blue to-hot-pink"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? "Upload en cours..." : "Choisir une image"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}