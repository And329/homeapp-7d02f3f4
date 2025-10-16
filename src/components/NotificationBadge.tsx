import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  className = "" 
}) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative p-1 sm:p-2 ${className}`}
    >
      <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBadge;