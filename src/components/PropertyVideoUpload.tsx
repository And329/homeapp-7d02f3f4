import React, { useState } from 'react';
import { X, Video, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useDirectUpload } from '@/hooks/useDirectUpload';

interface PropertyVideoUploadProps {
  videos: string[];
  onVideosChange: (videos: string[]) => void;
}

const PropertyVideoUpload: React.FC<PropertyVideoUploadProps> = ({
  videos,
  onVideosChange,
}) => {
  const { uploadFile, isUploading, uploadProgress } = useDirectUpload();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed limit
    if (videos.length + files.length > 5) {
      toast({
        title: "Too many videos",
        description: "You can upload a maximum of 5 videos per property.",
        variant: "destructive",
      });
      return;
    }

    // Convert FileList to Array and validate
    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a video file. Supported formats: MP4, WebM, MOV, AVI.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (max 100MB for better quality)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 100MB. Please compress the video or use a smaller file.`,
          variant: "destructive",
        });
        continue;
      }

      // Show compression warning for large files
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Large file detected",
          description: `${file.name} is quite large (${Math.round(file.size / (1024 * 1024))}MB). Consider compressing for faster loading.`,
        });
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    try {
      // Upload files to Supabase storage
      const uploadedUrls: string[] = [];
      
      for (const file of validFiles) {
        const result = await uploadFile(file, { bucket: 'property-media' });
        uploadedUrls.push(result.url);
      }
      
      const updatedVideos = [...videos, ...uploadedUrls];
      onVideosChange(updatedVideos);
      
      toast({
        title: "Videos uploaded successfully",
        description: `${uploadedUrls.length} video(s) uploaded. Total: ${updatedVideos.length}/5 videos.`,
      });

      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload videos. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
    toast({
      title: "Video removed",
      description: `Video ${index + 1} removed successfully.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Property Videos ({videos.length}/5)
        </label>
        {videos.length >= 5 && (
          <div className="flex items-center gap-1 text-amber-600 text-xs">
            <AlertCircle className="h-3 w-3" />
            Maximum videos reached
          </div>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Upload className="h-4 w-4 animate-pulse" />
            Uploading videos...
          </div>
          <Progress value={(Object.values(uploadProgress)[0] as any)?.percentage || 0} className="h-2" />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div key={index} className="relative group">
            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <video
                src={video}
                className="w-full h-32 object-cover"
                controls
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500 text-center">
              Video {index + 1}
            </div>
          </div>
        ))}
        
        {videos.length < 5 && (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-all duration-200 group">
            <input
              type="file"
              multiple
              accept="video/mp4,video/webm,video/mov,video/avi"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-xs text-gray-500">Processing...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Video className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">
                  Add Videos
                </span>
                <span className="text-xs text-gray-400">
                  {5 - videos.length} remaining
                </span>
              </div>
            )}
          </label>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Video Guidelines:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Upload up to 5 videos per property</li>
              <li>Maximum file size: 100MB per video</li>
              <li>Supported formats: MP4, WebM, MOV, AVI</li>
              <li>Recommended: Landscape orientation, good lighting</li>
              <li>For large files (&gt;50MB), consider compressing for faster loading</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyVideoUpload;