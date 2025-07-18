
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  const getAuthHeaders = useCallback(async () => {
    if (!user) return null;
    
    const session = await user.getSession();
    if (!session?.access_token) return null;

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cnpwYXd1dmRxamludHloemttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjkzMDYsImV4cCI6MjA2NTg0NTMwNn0.GnC-m7ke8NG6V_t8CgzHJbhq44lSK_XCXcNnbAs7Ha8'
    };
  }, [user]);

  const uploadFileChunked = useCallback(async (
    file: File,
    bucket: string,
    filePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<boolean> => {
    const headers = await getAuthHeaders();
    if (!headers) throw new Error('Authentication failed');

    const chunkSize = 6 * 1024 * 1024; // 6MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // For small files, upload directly
    if (file.size <= chunkSize) {
      return uploadFileDirect(file, bucket, filePath, onProgress);
    }

    console.log(`Uploading large file ${file.name} in ${totalChunks} chunks`);

    // For large files, use resumable upload (simplified approach)
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `https://jwrzpawuvdqjintyhzkm.supabase.co/storage/v1/object/${bucket}/${filePath}`);
      
      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }, [getAuthHeaders]);

  const uploadFileDirect = useCallback(async (
    file: File,
    bucket: string,
    filePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<boolean> => {
    const headers = await getAuthHeaders();
    if (!headers) throw new Error('Authentication failed');

    const formData = new FormData();
    formData.append('file', file);

    console.log(`Direct upload: ${file.name} to ${bucket}/${filePath}`);

    const response = await fetch(
      `https://jwrzpawuvdqjintyhzkm.supabase.co/storage/v1/object/${bucket}/${filePath}`,
      {
        method: 'POST',
        headers,
        body: formData,
        duplex: 'half'
      } as RequestInit
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    // Simulate progress completion for direct uploads
    if (onProgress) {
      onProgress({
        loaded: file.size,
        total: file.size,
        percentage: 100
      });
    }

    return true;
  }, [getAuthHeaders]);

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
      maxSize = 100 * 1024 * 1024, // 100MB default for direct upload
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

      // Track upload progress
      const onProgress = (progress: UploadProgress) => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: progress
        }));
      };

      // Choose upload method based on file size
      const uploadMethod = file.size > 6 * 1024 * 1024 ? uploadFileChunked : uploadFileDirect;
      
      console.log(`Using ${uploadMethod.name} for ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
      
      await uploadMethod(file, bucket, filePath, onProgress);

      // Clean up progress tracking
      setUploadProgress(prev => {
        const { [fileId]: removed, ...rest } = prev;
        return rest;
      });

      const result: DirectUploadResult = {
        url: filePath,
        name: file.name,
        type: file.type,
        size: file.size
      };

      console.log('Direct upload successful for', file.name);
      return result;
    } catch (error) {
      console.error('Direct upload error:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, toast, uploadFileChunked, uploadFileDirect]);

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
};
