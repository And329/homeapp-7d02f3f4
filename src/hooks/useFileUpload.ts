import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FileUploadResult {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File, maxSize: number, allowedTypes?: string[]) => {
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File must be smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`,
        variant: "destructive",
      });
      return false;
    }

    if (allowedTypes && !allowedTypes.some(type => file.type.startsWith(type))) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid file type.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const uploadFile = useCallback(async (
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      bucket?: string;
    } = {}
  ): Promise<FileUploadResult | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload files.",
        variant: "destructive",
      });
      return null;
    }

    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes,
      bucket = 'chat-attachments'
    } = options;

    if (!validateFile(file, maxSize, allowedTypes)) {
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || 'file';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload file: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      const result: FileUploadResult = {
        url: filePath,
        name: file.name,
        type: file.type,
        size: file.size
      };

      toast({
        title: "File uploaded",
        description: "File uploaded successfully.",
      });

      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, toast, validateFile]);

  const uploadImage = useCallback((file: File) => {
    return uploadFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB for images
      allowedTypes: ['image/']
    });
  }, [uploadFile]);

  const uploadDocument = useCallback((file: File) => {
    return uploadFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB for documents
    });
  }, [uploadFile]);

  return {
    uploadFile,
    uploadImage,
    uploadDocument,
    isUploading,
  };
};