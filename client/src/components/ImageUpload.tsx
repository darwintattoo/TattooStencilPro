import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image, Upload, X } from "lucide-react";

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}

interface ImageUploadProps {
  onImageUploaded?: (imageData: UploadedImage) => void;
}

export default function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest('POST', '/api/upload', formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedImage(data);
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      onImageUploaded?.(data);
      toast({
        title: "Image uploaded successfully",
        description: "Your reference image is ready for analysis.",
      });
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      let errorMessage = "Failed to upload image";
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = "Please log in to upload images";
      } else if (error.message?.includes('413')) {
        errorMessage = "File too large. Maximum size is 10MB";
      } else if (error.message?.includes('415')) {
        errorMessage = "Invalid file type. Please use JPEG, PNG, or WebP";
      } else if (error.message?.includes('400')) {
        errorMessage = "Invalid file. Please select a valid image";
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const removeImage = () => {
    setUploadedImage(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="text-amber-500 h-5 w-5" />
          <span>Reference Image (Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedImage && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-500 bg-slate-800/50 hover:border-blue-500'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              <Upload className="h-12 w-12 text-slate-400 mx-auto" />
              <div>
                <p className="text-slate-300 font-medium">
                  {isDragActive
                    ? 'Drop your image here'
                    : 'Drop your image here or click to browse'}
                </p>
                <p className="text-sm text-slate-500">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadMutation.isPending && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Uploading...</span>
              <span className="text-slate-400">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadedImage && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-600">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 relative">
                <img
                  src={uploadedImage.url}
                  alt="Uploaded reference"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-300 truncate">
                  {uploadedImage.filename}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(uploadedImage.size)} • {uploadedImage.width}×{uploadedImage.height}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-full bg-slate-600 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                  </div>
                  <span className="text-xs text-green-400 whitespace-nowrap">Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
