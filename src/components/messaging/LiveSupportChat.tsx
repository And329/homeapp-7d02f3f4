
import React, { useState } from 'react';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

const LiveSupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      sender: 'admin',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate admin response (in real implementation, this would be handled by backend)
    setTimeout(() => {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thank you for your message. An admin will respond shortly.',
        sender: 'admin',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, adminResponse]);
    }, 1000);
  };

  const handleStartChat = () => {
    if (!userName.trim()) return;
    setHasStartedChat(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasStartedChat) {
        handleSendMessage();
      } else {
        handleStartChat();
      }
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'} shadow-xl`}>
        <CardHeader className="py-3 px-4 border-b bg-primary text-primary-foreground">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Live Support</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-80 p-0">
            {!hasStartedChat ? (
              <div className="flex-1 p-4 space-y-4">
                <div className="text-center">
                  <h3 className="font-medium mb-2">Start a conversation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get instant help from our support team
                  </p>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Input
                    placeholder="Your email (optional)"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button 
                    onClick={handleStartChat} 
                    className="w-full"
                    disabled={!userName.trim()}
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="leading-relaxed">{message.content}</div>
                        <div className="text-xs mt-1 opacity-60">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={handleKeyPress}
                      className="text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LiveSupportChat;
