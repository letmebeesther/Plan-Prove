
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Smile, Camera, ChevronLeft, Users, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToChat, sendChatMessage } from '../services/chatService';
import { fetchChatRoomById } from '../services/dbService';
import { ChatRoom, ChatMessage } from '../types';
import { Avatar } from '../components/Avatar';

export function ChatPage() {
    const { roomId } = useParams<{roomId: string}>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadRoom = async () => {
            if (roomId) {
                const room = await fetchChatRoomById(roomId);
                setChatRoom(room);
            }
        };
        loadRoom();
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;
        const unsubscribe = subscribeToChat(roomId, (rtMessages) => {
            const uiMessages = rtMessages.map(m => ({
                id: m.id,
                user: { id: m.userId, nickname: m.userNickname, avatarUrl: m.userAvatarUrl, trustScore: 0 } as any,
                content: m.content,
                type: m.type,
                createdAt: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                reactions: {}
            }));
            setMessages(uiMessages);
        });
        return () => unsubscribe();
    }, [roomId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentUser || !roomId) return;
        try {
            await sendChatMessage(roomId, currentUser, input);
            setInput('');
        } catch (error) {
            console.error(error);
        }
    };

    if (!chatRoom) return <div className="p-20 text-center">채팅방을 불러오는 중...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-white max-w-2xl mx-auto shadow-sm border border-gray-100 rounded-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-200 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {chatRoom.name}
                            {chatRoom.type === 'GROUP' && <Users className="w-4 h-4 text-gray-400" />}
                        </h2>
                        <p className="text-xs text-gray-500">{chatRoom.participants.length}명 참여 중</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-full">
                    <Info className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-thin scrollbar-thumb-gray-200" ref={scrollRef}>
                {messages.map(msg => {
                    const isMe = msg.user.id === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            {!isMe && <Avatar src={msg.user.avatarUrl} size="sm" />}
                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <span className="text-xs text-gray-500 mb-1 ml-1">{msg.user.nickname}</span>}
                                <div className={`px-4 py-2 rounded-2xl text-sm break-all ${
                                    isMe 
                                    ? 'bg-primary-600 text-white rounded-tr-none' 
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-300 mt-1 px-1">{msg.createdAt}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <Camera className="w-6 h-6" />
                    </button>
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2 flex items-center gap-2 border border-transparent focus-within:border-primary-200 focus-within:bg-white transition-all">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="메시지 입력..." 
                            className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                        <button type="button" className="text-gray-400 hover:text-yellow-500">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>
                    <button type="submit" disabled={!input.trim()} className="p-2 bg-primary-600 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
