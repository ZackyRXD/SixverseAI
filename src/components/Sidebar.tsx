import React, { useState } from 'react';
import { PanelLeft, Plus, Settings, HelpCircle, MessageSquare, Trash2, Edit2, Check, X as CloseIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Chat } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onHelpClick: () => void;
  onSettingsClick: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onHelpClick,
  onSettingsClick,
  onDeleteChat,
  onRenameChat,
  isDarkMode,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      onRenameChat(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 260 : 64 }}
      className={cn(
        "h-screen flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r",
        isDarkMode ? "bg-[#171717] border-[#333]" : "bg-[#f9f9f9] border-[#ececec]"
      )}
    >
      {/* Top Actions */}
      <div className="p-3 flex flex-col gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-2 rounded-lg transition-colors w-10 h-10 flex items-center justify-center outline-none focus:ring-0",
            isDarkMode ? "hover:bg-[#333]" : "hover:bg-[#ececec]"
          )}
          title="Toggle Sidebar"
        >
          <PanelLeft size={20} className={isDarkMode ? "text-gray-400" : "text-[#676767]"} />
        </button>
        
        <button
          onClick={onNewChat}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg transition-all overflow-hidden whitespace-nowrap outline-none focus:ring-0",
            isDarkMode ? "hover:bg-[#333]" : "hover:bg-[#ececec]",
            isExpanded ? "w-full" : "w-10 h-10 justify-center"
          )}
          title="New Chat"
        >
          <Plus size={20} className={isDarkMode ? "text-gray-400" : "text-[#676767]"} />
          {isExpanded && <span className={cn("text-sm font-medium", isDarkMode ? "text-gray-200" : "text-[#343541]")}>Chat Baru</span>}
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              {chats.map((chat) => (
                <div key={chat.id} className="group relative">
                  {editingId === chat.id ? (
                    <div className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30",
                    )}>
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(chat.id)}
                        className="bg-transparent border-none outline-none text-sm flex-1 min-w-0"
                      />
                      <button onClick={() => handleSaveEdit(chat.id)} className="text-blue-500">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500">
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                          "flex-1 flex items-center gap-3 p-2 rounded-lg text-sm transition-colors text-left overflow-hidden outline-none focus:ring-0",
                          currentChatId === chat.id 
                            ? (isDarkMode ? "bg-[#333]" : "bg-[#ececec]") 
                            : (isDarkMode ? "hover:bg-[#333]" : "hover:bg-[#ececec]")
                        )}
                      >
                        <MessageSquare size={16} className={isDarkMode ? "text-gray-500" : "text-[#676767]"} />
                        <span className={cn("truncate", isDarkMode ? "text-gray-300" : "text-[#343541]")}>{chat.title}</span>
                      </button>
                      
                      <div className="hidden group-hover:flex items-center gap-1 absolute right-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit(chat); }}
                          className={cn("p-1 rounded hover:bg-black/10 transition-colors", isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600")}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                          className={cn("p-1 rounded hover:bg-black/10 transition-colors", isDarkMode ? "text-gray-500 hover:text-red-400" : "text-gray-400 hover:text-red-500")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className={cn("p-3 border-t flex flex-col gap-1", isDarkMode ? "border-[#333]" : "border-[#ececec]")}>
        <button
          onClick={onHelpClick}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg transition-all overflow-hidden whitespace-nowrap outline-none focus:ring-0",
            isDarkMode ? "hover:bg-[#333]" : "hover:bg-[#ececec]",
            isExpanded ? "w-full" : "w-10 h-10 justify-center"
          )}
        >
          <HelpCircle size={20} className={isDarkMode ? "text-gray-400" : "text-[#676767]"} />
          {isExpanded && <span className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-[#343541]")}>Bantuan</span>}
        </button>
        <button
          onClick={onSettingsClick}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg transition-all overflow-hidden whitespace-nowrap outline-none focus:ring-0",
            isDarkMode ? "hover:bg-[#333]" : "hover:bg-[#ececec]",
            isExpanded ? "w-full" : "w-10 h-10 justify-center"
          )}
        >
          <Settings size={20} className={isDarkMode ? "text-gray-400" : "text-[#676767]"} />
          {isExpanded && <span className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-[#343541]")}>Pengaturan</span>}
        </button>
      </div>
    </motion.div>
  );
};
