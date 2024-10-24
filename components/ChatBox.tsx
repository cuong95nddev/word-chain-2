import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

interface ChatBoxProps {
  gameId: string;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  className?: string;
}

export default function ChatBox({
                                  gameId,
                                  messages,
                                  onSendMessage,
                                  className = '',
                                }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(input.trim());
      setInput('');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`flex flex-col h-[400px] border rounded-lg bg-white shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-gray-900">Chat</h3>
      </div>

      {/* Messages */}
      <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => {
          const isCurrentUser = message.userId === user?.id;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  isCurrentUser ? 'order-1' : 'order-2'
                }`}
              >
                {!isCurrentUser && (
                  <div className="text-xs text-gray-500 ml-2 mb-1">
                    {message.username}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    isCurrentUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Gửi
          </button>
        </div>
      </form>

      {/* Typing indicator */}
      {false && (
        <div className="px-4 py-2 border-t">
          <div className="text-xs text-gray-500 italic">
            Someone is typing...
          </div>
        </div>
      )}
    </div>
  );
}
