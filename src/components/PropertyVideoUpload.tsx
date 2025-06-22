
import React, { useState } from 'react';
import { X, Plus, Video, Play, Film } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          <Film className="h-5 w-5 mr-2 text-primary" />
          Videos ({videos.length})
        </h4>
      </div>
      
      {/* Videos Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <div key={index} className="relative group bg-black rounded-2xl overflow-hidden shadow-lg">
              <video
                src={video}
                className="w-full h-48 object-cover"
                controls
                preload="metadata"
              />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Play className="h-8 w-8 text-white" fill="currentColor" />
                </div>
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Video Number */}
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-2 py-1 rounded-full backdrop-blur-sm">
                Video {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center hover:border-purple-400 hover:from-purple-100 hover:to-purple-150 transition-all duration-300">
        <label className="cursor-pointer block">
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
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-300 border-t-purple-600"></div>
                <Video className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="text-base font-medium text-purple-700">Uploading videos...</span>
              <span className="text-sm text-gray-500 mt-1">This may take a while</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-purple-200 rounded-2xl p-4 mb-4">
                <Video className="h-10 w-10 text-purple-600" />
              </div>
              <span className="text-xl font-semibold text-gray-800 mb-2">Add Property Videos</span>
              <span className="text-sm text-gray-600 mb-4 max-w-xs">
                Show your property in motion with high-quality videos
              </span>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="bg-white hover:bg-purple-600 hover:text-white border-purple-300 hover:border-purple-600 transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Choose Videos
              </Button>
            </div>
          )}
        </label>
      </div>
      
      {/* Upload Guidelines */}
      <div className="bg-purple-50 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Up to 5 videos
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Max 50MB each
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            MP4, WebM, MOV
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            HD quality preferred
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyVideoUpload;
