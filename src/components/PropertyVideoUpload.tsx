
import React, { useState } from 'react';
import { X, Plus, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    
    toast({
      title: "Video removed",
      description: "Video has been removed successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Property Videos
      </label>
      
      {/* Videos Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <div key={index} className="relative group">
              <video
                src={video}
                className="w-full h-40 object-cover rounded-lg border border-gray-200"
                controls
                preload="metadata"
              />
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <span className="text-sm text-gray-600">Uploading videos...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-4 mb-3">
                <Video className="h-8 w-8 text-gray-400" />
              </div>
              <span className="text-lg font-medium text-gray-700 mb-1">Add Property Videos</span>
              <span className="text-sm text-gray-500 mb-3">
                Drag and drop videos here, or click to browse
              </span>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          )}
        </label>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Upload up to 5 videos</p>
        <p>• Maximum file size: 50MB per video</p>
        <p>• Supported formats: MP4, WebM, MOV</p>
      </div>
    </div>
  );
};

export default PropertyVideoUpload;
