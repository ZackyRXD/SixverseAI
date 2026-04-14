import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isTyping?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isTyping }) => {
  return (
    <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-4 w-full",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          {message.role === 'model' && (
            <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <Bot size={18} className="text-[#676767]" />
            </div>
          )}
          
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2 text-[15px] leading-relaxed",
              message.role === 'user' 
                ? "bg-[#f0f0f0] text-[#212121]" 
                : "text-inherit prose prose-sm prose-neutral dark:prose-invert"
            )}
          >
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
              <User size={18} className="text-white" />
            </div>
          )}
        </div>
      ))}
      
      {isTyping && (
        <div className="flex gap-4 w-full justify-start">
          <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
            <Bot size={18} className="text-[#676767]" />
          </div>
          <div className="flex items-center gap-1 px-4 py-2">
            <div className="w-1.5 h-1.5 bg-[#ccc] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-[#ccc] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-[#ccc] rounded-full animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
};
