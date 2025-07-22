
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface DirectUploadResult {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadTiming {
  compressionTime: number;
  uploadTime: number;
  totalTime: number;
  fileSize: number;
  compressedSize: number;
}

export const useDirectUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  const logTiming = (timing: UploadTiming, fileName: string) => {
    console.log(`Upload Performance for ${fileName}:`, {
      compressionTime: `${timing.compressionTime}ms`,
      uploadTime: `${timing.uploadTime}ms`,
      totalTime: `${timing.totalTime}ms`,
      originalSize: `${Math.round(timing.fileSize / 1024)}KB`,
      compressedSize: `${Math.round(timing.compressedSize / 1024)}KB`,
      compressionRatio: `${Math.round((1 - timing.compressedSize / timing.fileSize) * 100)}%`,
      uploadSpeed: `${Math.round(timing.compressedSize / 1024 / (timing.uploadTime / 1000))}KB/s`,
      domain: window.location.hostname
    });
  };

  const retryUpload = async (
    uploadFn: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await uploadFn();
      } catch (error) {
        lastError = error;
        console.warn(`Upload attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          console.log(`Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };

  const uploadFile = useCallback(async (
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      bucket?: string;
    } = {}
  ): Promise<DirectUploadResult | null> => {
    const startTime = performance.now();
    console.log('Upload started for:', file.name, 'Domain:', window.location.hostname, 'Size:', Math.round(file.size / 1024) + 'KB');
    
    if (!user) {
      console.error('No user found - authentication required');
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload files.",
        variant: "destructive",
      });
      return null;
    }

    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes,
      bucket = 'property-media'
    } = options;

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File must be smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.some(type => file.type.startsWith(type))) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid file type.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || 'file';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const fileId = `${file.name}-${Date.now()}`;

      console.log(`Starting upload: ${file.name} (${Math.round(file.size / 1024)}KB) to ${bucket}/${filePath}`);

      // Set initial progress
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { loaded: 0, total: file.size, percentage: 0 }
      }));

      let fileToUpload = file;
      const compressionStart = performance.now();
      
      // Only compress large images to avoid unnecessary processing for small files
      if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) { // 5MB threshold
        console.log('Compressing large image:', file.name);
        fileToUpload = await new Promise<File>((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = document.createElement('img') as HTMLImageElement;
          
          img.onload = () => {
            const maxSize = 1920;
            let { width, height } = img;
            
            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            }, 'image/jpeg', 0.8);
          };
          
          img.src = URL.createObjectURL(file);
        });
      }

      const compressionTime = performance.now() - compressionStart;
      const uploadStart = performance.now();

      // Optimized upload with retry logic
      const { error, data } = await retryUpload(async () => {
        return await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
            // Optimize for better performance
            duplex: 'half'
          });
      });

      const uploadTime = performance.now() - uploadStart;
      const totalTime = performance.now() - startTime;

      // Log detailed timing information
      logTiming({
        compressionTime,
        uploadTime,
        totalTime,
        fileSize: file.size,
        compressedSize: fileToUpload.size
      }, file.name);

      if (error) {
        console.error('Upload error after retries:', error);
        throw new Error(error.message);
      }

      // Update progress to completion
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { loaded: fileToUpload.size, total: fileToUpload.size, percentage: 100 }
      }));

      // Clean up progress tracking
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });
      }, 1000);

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const result: DirectUploadResult = {
        url: publicUrlData.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };

      console.log(`Upload completed successfully for ${file.name} in ${Math.round(totalTime)}ms`);
      return result;
    } catch (error) {
      console.error('Upload failed after all retries:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
};
