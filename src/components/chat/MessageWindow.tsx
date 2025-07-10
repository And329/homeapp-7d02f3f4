import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from 'lucide-react';
import { Message } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface MessageWindowProps {
  conversationId: string;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (content: string, fileData?: any) => Promise<any>;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({
  conversationId,
  messages,
  isLoading,
  isSending,
  onSendMessage,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    // Only auto-scroll when new messages are added, not when switching conversations
    if (!isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only scroll if the last message was sent recently (within last 5 seconds)
      const recentMessage = lastMessage && (Date.now() - new Date(lastMessage.created_at).getTime()) < 5000;
      if (recentMessage) {
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages, isLoading]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 py-3 px-4 border-b">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <User className="h-5 w-5" />
          <span>Chat</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        {/* Messages area */}
        <div className="flex-1 min-h-0">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-4">
              <MessageList
                messages={messages}
                isLoading={isLoading}
              />
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message input area */}
        <div className="flex-shrink-0 border-t">
          <MessageInput
            onSendMessage={onSendMessage}
            isSending={isSending}
          />
        </div>
      </CardContent>
    </Card>
  );
};