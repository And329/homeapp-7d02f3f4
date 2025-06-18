
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

const MapboxTokenSettings: React.FC = () => {
  const [token, setToken] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing token from localStorage
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSaveToken = () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox token",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('mapbox_token', token);
    setIsEditing(false);
    toast({
      title: "Token saved",
      description: "Mapbox token has been saved successfully",
    });
  };

  const handleClearToken = () => {
    localStorage.removeItem('mapbox_token');
    setToken('');
    setIsEditing(false);
    toast({
      title: "Token cleared",
      description: "Mapbox token has been removed",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Mapbox Configuration</h3>
      </div>

      {!isEditing ? (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {token ? 'Mapbox token is configured' : 'No Mapbox token configured'}
            </p>
            {token && (
              <p className="text-xs text-gray-400 font-mono">
                {token.substring(0, 20)}...
              </p>
            )}
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
          >
            {token ? 'Update Token' : 'Add Token'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mapbox Public Token
            </label>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZXh..."
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your token from{' '}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mapbox Dashboard
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveToken} size="sm">
              Save Token
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            {token && (
              <Button
                onClick={handleClearToken}
                variant="destructive"
                size="sm"
              >
                Clear Token
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxTokenSettings;
