import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  description = "Choose an image file to upload",
  accept = "image/*",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setIsUploading(true);

    try {
      // In a real app, you would upload to a cloud service like AWS S3, Cloudinary, etc.
      // For demo purposes, we'll create a local object URL
      const imageUrl = URL.createObjectURL(file);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onChange(imageUrl);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (value) {
      URL.revokeObjectURL(value); // Clean up object URL
    }
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {value ? (
          <div className="relative">
            <div className="relative w-full max-w-md">
              <img
                src={value}
                alt="Uploaded vehicle"
                className="w-full h-48 object-cover rounded-lg border bg-muted"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={handleClick}
          >
            <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              {isUploading ? (
                <>
                  <Upload className="h-8 w-8 animate-bounce" />
                  <p className="text-sm">Uploading...</p>
                </>
              ) : (
                <>
                  <Camera className="h-8 w-8" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs">PNG, JPG up to {maxSizeMB}MB</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
            className="flex-1"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {value ? "Change Image" : "Select Image"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
