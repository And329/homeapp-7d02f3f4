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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Use messagesEndRef for immediate scroll
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    // Always scroll on new messages, regardless of timing
    if (!isLoading && messages.length > 0) {
      // Use a longer timeout to ensure DOM is updated
      setTimeout(scrollToBottom, 200);
    }
  }, [messages, isLoading]);

  // Also scroll when conversation changes
  useEffect(() => {
    if (conversationId && !isLoading) {
      setTimeout(scrollToBottom, 300);
    }
  }, [conversationId, isLoading]);

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