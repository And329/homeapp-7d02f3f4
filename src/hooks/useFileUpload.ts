import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile, validateDocumentFile } from '@/utils/validation';

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

    // Check for potentially dangerous file names
    const dangerousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.vbs$/i, /\.js$/i];
    if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
      toast({
        title: "Security Error",
        description: "This file type is not allowed for security reasons",
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

      console.log(`Uploading to bucket: ${bucket}, path: ${filePath}`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half' // Helps with large file uploads
        });

      if (error) {
        console.error('Upload error for', file.name, ':', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload file: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('Upload successful for', file.name);

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
    // Use enhanced validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return Promise.resolve(null);
    }
    
    return uploadFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB for images
      allowedTypes: ['image/'],
      bucket: 'chat-attachments' // Use chat-attachments for chat images
    });
  }, [uploadFile, toast]);

  const uploadDocument = useCallback((file: File) => {
    // Use enhanced validation
    const validation = validateDocumentFile(file);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return Promise.resolve(null);
    }
    
    return uploadFile(file, {
      maxSize: 25 * 1024 * 1024, // 25MB for documents
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      bucket: 'chat-attachments' // Use chat-attachments for chat documents
    });
  }, [uploadFile, toast]);

  return {
    uploadFile,
    uploadImage,
    uploadDocument,
    isUploading,
  };
};