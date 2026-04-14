import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Globe, Lightbulb, MoreHorizontal, ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="relative bg-inherit border border-[#e5e5e5] rounded-[28px] shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya apa saja"
          rows={1}
          className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-[16px] placeholder-[#757575] min-h-[24px] max-h-[200px] pr-12"
          disabled={disabled}
        />
        
        <div className="flex items-center justify-end mt-4">
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={cn(
              "p-2 rounded-full transition-all duration-200 outline-none focus:ring-0",
              input.trim() && !disabled 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
