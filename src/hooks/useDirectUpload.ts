
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

export const useDirectUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  const uploadFile = useCallback(async (
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      bucket?: string;
    } = {}
  ): Promise<DirectUploadResult | null> => {
    if (!user) {
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

      console.log(`Uploading ${file.name} (${Math.round(file.size / 1024 / 1024)}MB) to ${bucket}/${filePath}`);

      // Set initial progress
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { loaded: 0, total: file.size, percentage: 0 }
      }));

      // Use Supabase client for optimized upload
      const { error, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message);
      }

      // Update progress to completion
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { loaded: file.size, total: file.size, percentage: 100 }
      }));

      // Clean up progress tracking after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });
      }, 1000);

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const result: DirectUploadResult = {
        url: publicUrlData.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };

      console.log('Upload successful for', file.name);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
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
