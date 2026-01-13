
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Image as ImageIcon, Smile, MoreVertical, Hash, Lock, Search, Circle } from 'lucide-react';
import { User, ChatMessage, ChatChannel } from '../../types';

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    users: User[];
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, currentUser, users }) => {
    const [activeTab, setActiveTab] = useState<'channels' | 'dms'>('channels');
    const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock Data
    const [channels, setChannels] = useState<ChatChannel[]>([
        { id: 'c1', name: 'general', type: 'public', unreadCount: 0, lastMessage: { content: 'Welcome everyone!', timestamp: new Date().toISOString() } },
        { id: 'c2', name: 'project-alpha', type: 'private', unreadCount: 3, lastMessage: { content: 'Update on timeline?', timestamp: new Date().toISOString() } },
        { id: 'c3', name: 'engineering-team', type: 'public', unreadCount: 0, lastMessage: { content: 'Meeting at 2 PM', timestamp: new Date().toISOString() } },
        { id: 'c4', name: 'random', type: 'public', unreadCount: 0 },
    ]);

    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'm1', senderId: '50155250', senderName: 'Ayodya Maulana', senderAvatar: 'AM', content: 'Has everyone reviewed the new safety protocols?', timestamp: new Date(Date.now() - 3600000).toISOString(), channelId: 'c1', type: 'text' },
        { id: 'm2', senderId: '50006020', senderName: 'Moh Yusuf Alfian', senderAvatar: 'MY', content: 'Yes, just finished. Looks good.', timestamp: new Date(Date.now() - 3500000).toISOString(), channelId: 'c1', type: 'text' },
    ]);

    useEffect(() => {
        if (isOpen && !selectedChannel && !selectedUser) {
            setSelectedChannel(channels[0]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, selectedChannel, selectedUser]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            content: messageInput,
            timestamp: new Date().toISOString(),
            channelId: selectedChannel?.id,
            recipientId: selectedUser?.id,
            type: 'text'
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
    };

    const filteredMessages = messages.filter(m => {
        if (selectedChannel) return m.channelId === selectedChannel.id;
        if (selectedUser) return (m.senderId === currentUser.id && m.recipientId === selectedUser.id) || (m.senderId === selectedUser.id && m.recipientId === currentUser.id);
        return false;
    });

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-in-right">

                {/* Header */}
                <div className="h-16 px-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Collaboration</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    {/* Navigation Tabs */}
                    <div className="px-4 py-2 flex gap-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <button
                            onClick={() => { setActiveTab('channels'); setSelectedUser(null); setSelectedChannel(channels[0]); }}
                            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'channels' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                        >
                            Channels
                        </button>
                        <button
                            onClick={() => { setActiveTab('dms'); setSelectedChannel(null); }}
                            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'dms' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                        >
                            Direct Messages
                        </button>
                    </div>

                    {/* List Area (Left side of a split view, but here it's top part of drawer or collapsible) 
              Actually for a 96w drawer, we probably want list -> click -> chat view. 
              Let's do a split view logic: if selectedChannel/User is null, show list. 
              But for simplicity in this drawer, let's keep the list on top or toggleable? 
              Better: Fixed sidebar style within the drawer? No, 96w is too narrow.
              Let's show the chat of the *current* selection, and a way to switch.
          */}

                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950/30">

                        {/* Simple Horizontal Scroll for Quick Switching (Like Stories) or just a dropdown? 
                 Let's do a compact list at the top or a "Back" button approach if implementing full view.
                 For this MVP, let's list items if nothing selected? No, let's keep the Selection List visible 
                 until an item is clicked? 
                 Actually, standard pattern is: List of contacts/channels. Click one -> Replaces view with Chat.
                 HEADER has a "Back" button.
             */}

                        <div className="h-32 shrink-0 border-b border-gray-200 dark:border-slate-800 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
                            {activeTab === 'channels' && (
                                <div className="p-2 space-y-1">
                                    {channels.map(channel => (
                                        <button
                                            key={channel.id}
                                            onClick={() => { setSelectedChannel(channel); setSelectedUser(null); }}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedChannel?.id === channel.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {channel.type === 'private' ? <Lock size={14} /> : <Hash size={14} />}
                                                <span className="font-medium truncate">{channel.name}</span>
                                            </div>
                                            {channel.unreadCount > 0 && (
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 h-4 rounded-full flex items-center justify-center">{channel.unreadCount}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'dms' && (
                                <div className="p-2 space-y-1">
                                    {users.filter(u => u.id !== currentUser.id).map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => { setSelectedUser(user); setSelectedChannel(null); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {user.avatar}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{user.jobTitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat View */}
                        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                            {(selectedChannel || selectedUser) ? (
                                <>
                                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm z-10">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {selectedChannel && (
                                                <>
                                                    <Hash size={16} className="text-slate-400 shrink-0" />
                                                    <span className="font-bold text-sm truncate">{selectedChannel.name}</span>
                                                </>
                                            )}
                                            {selectedUser && (
                                                <>
                                                    <span className="font-bold text-sm truncate">{selectedUser.name}</span>
                                                    <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                                                </>
                                            )}
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><MoreVertical size={16} /></button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                        {filteredMessages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                                <MessageSquare size={48} className="mb-2" />
                                                <p className="text-sm">No messages yet</p>
                                            </div>
                                        ) : (
                                            filteredMessages.map(msg => {
                                                const isMe = msg.senderId === currentUser.id;
                                                return (
                                                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        {!isMe && (
                                                            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                                                {msg.senderAvatar}
                                                            </div>
                                                        )}
                                                        <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                            <div className="flex items-end gap-2">
                                                                {!isMe && <span className="text-[10px] font-bold text-slate-500">{msg.senderName}</span>}
                                                                <span className="text-[9px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                                    : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-bl-none'
                                                                }`}>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                                        <form onSubmit={handleSendMessage} className="relative">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder={`Message ${selectedChannel ? '#' + selectedChannel.name : selectedUser?.name}...`}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-4 pr-24 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-slate-100"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <button type="button" className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><Paperclip size={16} /></button>
                                                <button type="button" className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><ImageIcon size={16} /></button>
                                                <button
                                                    type="submit"
                                                    disabled={!messageInput.trim()}
                                                    className="ml-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Start Collaborating</h3>
                                    <p className="text-sm mt-2 max-w-xs">Select a channel or team member to start chatting.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatDrawer;
