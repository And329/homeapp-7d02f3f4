
import React, { useState } from 'react';
import { X, Plus, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyVideoUploadProps {
  videos: string[];
  onVideosChange: (videos: string[]) => void;
}

const PropertyVideoUpload: React.FC<PropertyVideoUploadProps> = ({
  videos,
  onVideosChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newVideos: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('video/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a video file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 50MB.`,
            variant: "destructive",
          });
          continue;
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = () => {
            reject(new Error(`Failed to read ${file.name}`));
          };
          reader.readAsDataURL(file);
        });

        newVideos.push(base64);
      }

      const updatedVideos = [...videos, ...newVideos];
      onVideosChange(updatedVideos);
      
      if (newVideos.length > 0) {
        toast({
          title: "Videos uploaded",
          description: `${newVideos.length} video(s) uploaded successfully.`,
        });
      }

      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Property Videos
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {videos.map((video, index) => (
          <div key={index} className="relative group">
            <video
              src={video}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
              controls
            />
            <button
              type="button"
              onClick={() => removeVideo(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          ) : (
            <>
              <Video className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Add Videos</span>
            </>
          )}
        </label>
      </div>
      
      <p className="text-xs text-gray-500">
        Upload up to 5 videos. Max file size: 50MB per video. Supported formats: MP4, WebM, MOV.
      </p>
    </div>
  );
};

export default PropertyVideoUpload;
