
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface MessageNotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

const MessageNotificationBadge: React.FC<MessageNotificationBadgeProps> = ({ 
  onClick, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { unreadCount, markAsRead } = useMessageNotifications();

  if (!user) return null;

  const handleClick = () => {
    console.log('MessageNotificationBadge: Clicked, marking messages as read');
    // Always mark as read when clicked, regardless of unread count
    markAsRead();
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`relative p-1 sm:p-2 ${className}`}
    >
      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
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

export default MessageNotificationBadge;
