import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatWindow } from './components/ChatWindow';
import { Chat, Message } from './types';
import { streamChat } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon } from 'lucide-react';

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [tokens, setTokens] = useState(150000);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentChat = chats.find(c => c.id === currentChatId);

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Chat Baru',
      messages: [],
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  }, []);

  const handleSend = async (content: string) => {
    let chatId = currentChatId;
    let updatedChats = [...chats];

    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
      };
      updatedChats = [newChat, ...updatedChats];
      chatId = newChat.id;
      setChats(updatedChats);
      setCurrentChatId(chatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const chatIndex = updatedChats.findIndex(c => c.id === chatId);
    const chat = updatedChats[chatIndex];
    
    if (chat.messages.length === 0) {
      chat.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }

    chat.messages.push(userMessage);
    setChats([...updatedChats]);
    setTokens(prev => Math.max(0, prev - content.length * 2)); // Mock token reduction

    setIsTyping(true);
    
    try {
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: '',
        timestamp: Date.now(),
      };
      
      chat.messages.push(modelMessage);
      setChats([...updatedChats]);

      const stream = streamChat(chat.messages.slice(0, -1).concat(userMessage));
      
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        modelMessage.content = fullContent;
        setChats([...updatedChats]);
        setTokens(prev => Math.max(0, prev - chunk.length)); // Mock token reduction
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#171717] text-white' : 'bg-white text-[#212121]'}`}>
      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={handleNewChat}
        onHelpClick={() => setShowHelp(true)}
        onSettingsClick={() => setShowSettings(true)}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isDarkMode={isDarkMode}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-end px-6 gap-4">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#676767]'}`}>
            Halo Zacky
          </span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg cursor-pointer flex items-center justify-center text-white font-bold">
            Z
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {!currentChat || currentChat.messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center -mt-16"
              >
                <h1 className={`text-[32px] font-semibold mb-8 ${isDarkMode ? 'text-white' : 'text-[#212121]'}`}>
                  Ada yang bisa sixverseAI bantu, Zacky?
                </h1>
                <ChatInput onSend={handleSend} disabled={isTyping} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <ChatWindow messages={currentChat.messages} isTyping={isTyping} />
                <div className="pb-8 pt-4">
                  <ChatInput onSend={handleSend} disabled={isTyping} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="py-4 px-6 flex flex-col items-center gap-1">
          <div className={`${isDarkMode ? 'bg-[#212121]' : 'bg-[#f4f4f4]'} px-4 py-2 rounded-xl max-w-xl text-center`}>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-[#676767]'}`}>
              Token tersisa: <span className="font-bold text-blue-500">{tokens.toLocaleString()}</span>
              <br />
              sixverseAI dapat membuat kesalahan. Harap periksa kembali responsnya.
            </p>
          </div>
        </footer>

        {/* Modals */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setShowHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`${isDarkMode ? 'bg-[#212121] text-white' : 'bg-white text-[#212121]'} p-8 rounded-2xl shadow-2xl max-w-md w-full relative`}
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-4">Bantuan</h2>
                <p className="text-lg text-center py-8 italic">"saya pun gatau haha"</p>
              </motion.div>
            </motion.div>
          )}

          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`${isDarkMode ? 'bg-[#212121] text-white' : 'bg-white text-[#212121]'} p-8 rounded-2xl shadow-2xl max-w-md w-full relative`}
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-6">Pengaturan</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-sm font-medium text-blue-900">Sisa Token</span>
                    <span className="text-lg font-bold text-blue-600">{tokens.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-2">
                    <span className="font-medium">Mode Tampilan</span>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                      {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
