import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, ChevronLeft, Search } from 'lucide-react';
import { User } from '../types';

export const ChatWidget = () => {
  const { user, users, messages, sendMessage, markChatAsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  // Filter out current user from list
  const otherUsers = users.filter(u => u.id !== user.id && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Get unread counts per user
  const unreadCounts = messages.reduce((acc, msg) => {
    if (msg.receiverId === user.id && !msg.isRead) {
      acc[msg.senderId] = (acc[msg.senderId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // Get messages for active chat
  const activeMessages = activeChatUser 
    ? messages.filter(m => 
        (m.senderId === user.id && m.receiverId === activeChatUser.id) || 
        (m.senderId === activeChatUser.id && m.receiverId === user.id)
      ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages, isOpen, activeChatUser]);

  useEffect(() => {
    if (isOpen && activeChatUser) {
        markChatAsRead(activeChatUser.id);
    }
  }, [activeMessages.length, isOpen, activeChatUser]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && activeChatUser) {
      sendMessage(activeChatUser.id, inputText);
      setInputText('');
    }
  };

  const getLastMessage = (otherId: string) => {
    const relevant = messages.filter(m => 
      (m.senderId === user.id && m.receiverId === otherId) || 
      (m.senderId === otherId && m.receiverId === user.id)
    ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return relevant.length > 0 ? relevant[0] : null;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 md:w-96 h-[500px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-brand-dark p-4 text-white flex justify-between items-center shadow-md shrink-0">
            {activeChatUser ? (
              <div className="flex items-center space-x-2">
                <button onClick={() => setActiveChatUser(null)} className="hover:bg-white/10 p-1 rounded-full">
                  <ChevronLeft size={20} />
                </button>
                <div>
                   <h3 className="font-bold text-sm">{activeChatUser.name}</h3>
                   <p className="text-xs text-brand-teal">{activeChatUser.department}</p>
                </div>
              </div>
            ) : (
              <h3 className="font-bold">Team Chat</h3>
            )}
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
            {!activeChatUser ? (
              // User List View
              <div className="flex-1 overflow-y-auto">
                 <div className="p-3 bg-white border-b">
                     <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search colleagues..."
                            className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                 </div>
                 <div className="divide-y divide-gray-100">
                    {otherUsers.map(u => {
                        const lastMsg = getLastMessage(u.id);
                        return (
                            <div 
                            key={u.id} 
                            onClick={() => setActiveChatUser(u)}
                            className="p-3 hover:bg-white cursor-pointer transition-colors flex items-center space-x-3"
                            >
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold border-2 border-white shadow-sm">
                                {u.name.charAt(0)}
                                </div>
                                {unreadCounts[u.id] > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full border border-white">
                                    {unreadCounts[u.id]}
                                </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                                    {lastMsg && <p className="text-[10px] text-gray-400">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                    {lastMsg 
                                        ? (lastMsg.senderId === user.id ? `You: ${lastMsg.content}` : lastMsg.content) 
                                        : <span className="italic text-gray-400">Start a conversation</span>}
                                </p>
                            </div>
                            </div>
                        );
                    })}
                 </div>
              </div>
            ) : (
              // Active Chat View
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                   {activeMessages.length === 0 ? (
                       <div className="text-center text-gray-400 text-xs mt-10">
                           <p>No messages yet.</p>
                           <p>Say hello to {activeChatUser.name}!</p>
                       </div>
                   ) : (
                       activeMessages.map(msg => {
                           const isMe = msg.senderId === user.id;
                           return (
                               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                       isMe 
                                        ? 'bg-brand-teal text-white rounded-br-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                   }`}>
                                       <p>{msg.content}</p>
                                       <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                           {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                       </p>
                                   </div>
                               </div>
                           )
                       })
                   )}
                </div>
                
                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim()}
                        className="bg-brand-teal text-white p-2 rounded-full hover:bg-[#008f7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-brand-teal hover:bg-[#008f7a] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 relative"
      >
         {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
         {!isOpen && totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-brand-orange text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {totalUnread}
            </span>
         )}
      </button>
    </div>
  );
};