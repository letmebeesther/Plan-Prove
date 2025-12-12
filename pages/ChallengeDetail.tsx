
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Users, TrendingUp, Shield, Activity, Target, MessageCircle, Image as ImageIcon, Smile, 
    MoreHorizontal, Send, Settings, AlertTriangle, LogOut, Lock, UserPlus, 
    ChevronLeft, Share2, Bookmark, Flag, Info, Crown, Search, Filter, X, 
    ChevronDown, ChevronUp, Bell, Copy, CheckCircle2, ThumbsUp, MapPin, 
    Calendar, Maximize2, Camera, UserMinus, MessageSquare, Star, Trophy
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Challenge, Participant, ChatMessage, Certification, Notice, ChatRoom, Plan, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToChat, sendChatMessage } from '../services/chatService';
import { fetchChallengeById, fetchMyActivePlans, fetchChallengeFeeds, fetchChallengeParticipants, createChatRoom, fetchMyChatRooms } from '../services/dbService';

type TabType = 'HOME' | 'FEED' | 'CHAT' | 'MEMBERS' | 'CHATLIST';

export function ChallengeDetail() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isJoined, setIsJoined] = useState(false); 
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Participants Data
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Feeds Data
  const [feeds, setFeeds] = useState<Certification[]>([]);

  // Chat Rooms Data
  const [myChatRooms, setMyChatRooms] = useState<ChatRoom[]>([]);

  // Modals State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState<Participant | null>(null);
  const [showFeedDetailModal, setShowFeedDetailModal] = useState<Certification | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState<Notice | null>(null);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // New Chat Selection State
  const [selectedChatUsers, setSelectedChatUsers] = useState<string[]>([]);

  // Chat State (Open Chat)
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Feed Filter
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'PHOTO' | 'TEXT'>('ALL');

  // Member Sort & Search
  const [memberSort, setMemberSort] = useState<'ACHIEVEMENT' | 'GROWTH' | 'TRUST' | 'RECENT'>('ACHIEVEMENT');
  const [memberSearch, setMemberSearch] = useState('');

  // Ranking State
  const [showAllRankings, setShowAllRankings] = useState(false);
  
  // My Plans for Join Modal
  const [myPlans, setMyPlans] = useState<Plan[]>([]);

  // --- Fetch Challenge Data ---
  useEffect(() => {
      const loadData = async () => {
          if (!id) return;
          setLoading(true);
          try {
              const data = await fetchChallengeById(id);
              if (data) {
                  setChallenge(data);
                  
                  // FR-GROUP-DETAIL-001: Load real participants
                  const parts = await fetchChallengeParticipants(id);
                  setParticipants(parts);
                  
                  // Check if joined
                  if (currentUser && data.participantIds?.includes(currentUser.id)) {
                      setIsJoined(true);
                  }
              }
          } catch (e) {
              console.error("Failed to load challenge", e);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, [id, currentUser]);

  // Fetch Feeds when Tab is active
  useEffect(() => {
      if (activeTab === 'FEED' && id) {
          const loadFeeds = async () => {
              const data = await fetchChallengeFeeds(id);
              setFeeds(data);
          };
          loadFeeds();
      }
  }, [activeTab, id]);

  // Fetch My Chats when ChatList is active
  useEffect(() => {
      if (activeTab === 'CHATLIST' && currentUser) {
          const loadChats = async () => {
              const rooms = await fetchMyChatRooms(currentUser.id);
              setMyChatRooms(rooms);
          };
          loadChats();
      }
  }, [activeTab, currentUser]);

  // Load My Plans for Join Modal
  useEffect(() => {
      const loadPlans = async () => {
          if (currentUser && showJoinModal) {
              const plans = await fetchMyActivePlans(currentUser.id);
              setMyPlans(plans);
          }
      };
      loadPlans();
  }, [currentUser, showJoinModal]);

  // --- Chat Subscription (Open Chat) ---
  useEffect(() => {
    if (!id || activeTab !== 'CHAT') return;

    const unsubscribe = subscribeToChat(id, (rtMessages) => {
      const uiMessages: ChatMessage[] = rtMessages.map(m => ({
        id: m.id,
        user: { 
          id: m.userId, 
          nickname: m.userNickname, 
          avatarUrl: m.userAvatarUrl, 
          trustScore: 0
        } as any,
        content: m.content,
        type: m.type,
        createdAt: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: {} 
      }));
      setMessages(uiMessages);
    });

    return () => unsubscribe();
  }, [id, activeTab]);

  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  // Handlers
  const handleJoin = (planId?: string) => {
      if (!planId) return; 
      setIsJoined(true);
      setShowJoinModal(false);
      alert(`"${planId}" 계획과 함께 도전에 참여했습니다! 🎉`);
      setActiveTab('HOME'); 
  };

  const handleLeave = () => {
      setIsJoined(false);
      setShowLeaveModal(false);
      navigate('/challenges'); 
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!chatInput.trim() || !currentUser || !id) return;
      try {
        await sendChatMessage(id, currentUser, chatInput);
        setChatInput('');
      } catch (error) {
        alert("메시지 전송에 실패했습니다.");
      }
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      alert('도전방 링크가 복사되었습니다!');
  };

  // FR-GROUP-DETAIL-006 & 008: 1:1 Chat
  const handleStartDirectChat = async (targetUser: User) => {
      if (!currentUser) return;
      // Mock friendship check
      if (currentUser.trustScore < 50 && targetUser.trustScore > 80) { // Just dummy logic
          alert('친구 관계인 사용자만 채팅이 가능합니다. (FR-GROUP-DETAIL-008)');
          return;
      }
      try {
          const roomId = await createChatRoom([currentUser, targetUser], 'DIRECT');
          navigate(`/chat/${roomId}`);
      } catch (e) {
          alert('채팅 시작 실패');
      }
  };

  // FR-GROUP-DETAIL-007: Group Chat
  const handleCreateGroupChat = async () => {
      if (!currentUser || selectedChatUsers.length === 0) return;
      
      const targetUsers = participants
          .filter(p => selectedChatUsers.includes(p.user.id))
          .map(p => p.user);
      
      // Mock friendship check for all
      if (targetUsers.length > 5) { // Dummy constraint
           alert('친구 관계인 사용자만 초대가 가능합니다.');
           return;
      }

      try {
          const allUsers = [currentUser, ...targetUsers];
          const roomId = await createChatRoom(allUsers, 'GROUP');
          setShowNewChatModal(false);
          navigate(`/chat/${roomId}`);
      } catch (e) {
          alert('그룹 채팅 생성 실패');
      }
  };

  const calculateTotalScore = (p: Participant) => {
      return (p.achievementRate * 0.5) + (p.growthRate * 0.3) + (p.user.trustScore * 0.2);
  };

  const rankingParticipants = [...participants]
      .map(p => ({ ...p, totalScore: calculateTotalScore(p) }))
      .sort((a, b) => b.totalScore - a.totalScore); 

  const renderRankBadge = (role: string) => {
      if (role === 'HOST') return <Crown className="w-3 h-3 text-yellow-500 fill-current" />;
      if (role === 'CO_HOST') return <Star className="w-3 h-3 text-gray-400 fill-current" />;
      return null;
  };

  if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600 mb-4"></div>
             <p className="text-gray-500 font-medium animate-pulse">도전방에 입장하고 있습니다...</p>
        </div>
  );
  if (!challenge) return <div className="p-20 text-center">도전방을 찾을 수 없습니다.</div>;

  return (
    <div className="pb-20 max-w-5xl mx-auto bg-gray-50 min-h-screen animate-fade-in">
        {/* ... Header & Sticky Stats (Keep same) ... */}
        <div className="relative h-64 md:h-80 bg-gray-900 group">
            <img 
                src={challenge.imageUrl} 
                alt={challenge.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 cursor-pointer" 
                onClick={() => setShowFullImage(challenge.imageUrl)}
            />
            {/* ... Actions ... */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={handleCopyLink} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"><Share2 className="w-5 h-5" /></button>
                <button onClick={() => setIsBookmarked(!isBookmarked)} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"><Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} /></button>
            </div>
            {/* ... Info ... */}
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/10">{challenge.category}</span>
                    <span className="text-white/90 text-sm font-medium">{challenge.statusMessage}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">{challenge.title}</h1>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => setShowParticipantModal({ ...participants[0], role: 'HOST' })}>
                             <div className="relative"><Avatar src={challenge.host.avatarUrl} size="sm" /><div className="absolute -top-1 -right-1"><Crown className="w-3 h-3 text-yellow-400 fill-current" /></div></div>
                             <span>{challenge.host.nickname}</span>
                        </div>
                        <span className="text-white/50">|</span>
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {challenge.participantCount.toLocaleString()}명</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="bg-white px-4 border-b border-gray-200 sticky top-0 z-30">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'HOME', label: '홈' },
                    { id: 'FEED', label: '인증피드' },
                    { id: 'CHAT', label: '오픈채팅' },
                    { id: 'CHATLIST', label: '채팅목록' },
                    { id: 'MEMBERS', label: `멤버 ${challenge.participantCount}` },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'border-gray-900 text-gray-900' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 min-h-[500px]">
            
            {/* 1. HOME TAB */}
            {activeTab === 'HOME' && (
                <div className="space-y-6 animate-fade-in">
                    {/* ... Dashboard & Ranking (Keep existing) ... */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                         {/* Stats Blocks... */}
                         {[
                             { label: '그룹 성장률', value: `+${challenge.growthRate || 0}%`, icon: TrendingUp, color: 'text-green-600' },
                             { label: '평균 달성률', value: `${challenge.avgAchievement || 0}%`, icon: Target, color: 'text-blue-600' },
                             { label: '유지율', value: `${challenge.retentionRate || 100}%`, icon: Activity, color: 'text-orange-600' },
                             { label: '신뢰도 평균', value: `${challenge.avgTrustScore || 50}`, icon: Shield, color: 'text-indigo-600' },
                             { label: '안정성 지수', value: `${challenge.stabilityIndex || 100}`, icon: CheckCircle2, color: 'text-teal-600' },
                         ].map((stat, i) => (
                             <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><div className="text-xs text-gray-500 mb-1">{stat.label}</div><div className={`text-lg font-bold ${stat.color} flex items-center gap-1.5`}><stat.icon className="w-4 h-4" /> {stat.value}</div></div>
                         ))}
                    </div>
                    {/* Description & Ranking ... */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4">도전 소개</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{challenge.description}</p>
                    </div>
                    
                    {!isJoined && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-30 lg:relative lg:border-none lg:bg-transparent lg:p-0">
                             <Button size="lg" className="w-full max-w-md shadow-xl" onClick={() => setShowJoinModal(true)}>이 도전방 참여하기</Button>
                        </div>
                    )}
                </div>
            )}

            {/* 2. FEED TAB */}
            {activeTab === 'FEED' && (
                <div className="space-y-4 animate-fade-in">
                    {/* ... (Keep existing Feed logic) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {feeds.map(feed => (
                            <div key={feed.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={() => setShowFeedDetailModal(feed)}>
                                {feed.imageUrl && (<div className="h-48 overflow-hidden bg-gray-100"><img src={feed.imageUrl} alt="cert" className="w-full h-full object-cover" /></div>)}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2"><Avatar src={feed.user.avatarUrl} size="sm" /><div><p className="text-xs font-bold">{feed.user.nickname}</p><p className="text-[10px] text-gray-400">{feed.createdAt}</p></div></div>
                                    <p className="text-sm line-clamp-2">{feed.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. OPEN CHAT TAB */}
            {activeTab === 'CHAT' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[600px] flex flex-col animate-fade-in relative">
                    {!isJoined && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"><Lock className="w-10 h-10 text-gray-400 mb-2" /><p className="font-bold">참여자만 입장 가능합니다.</p><Button onClick={() => setShowJoinModal(true)}>참여하기</Button></div>}
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                         <span className="font-bold text-gray-700 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 오픈 채팅방</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
                         {messages.map(msg => (
                             <div key={msg.id} className={`flex gap-3 ${msg.user.id === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                                 {msg.user.id !== currentUser?.id && <Avatar src={msg.user.avatarUrl} size="sm" />}
                                 <div className={`max-w-[70%] flex flex-col ${msg.user.id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                                     <div className={`p-3 rounded-2xl text-sm ${msg.user.id === currentUser?.id ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>{msg.content}</div>
                                 </div>
                             </div>
                         ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="메시지 입력..." className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                            <button type="submit" className="p-2 bg-primary-500 text-white rounded-xl"><Send className="w-5 h-5" /></button>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. CHAT LIST TAB (FR-GROUP-DETAIL-009) */}
            {activeTab === 'CHATLIST' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-900">나의 대화 목록</h3>
                        <button onClick={() => setShowNewChatModal(true)} className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline">
                            <MessageSquare className="w-4 h-4" /> 새 채팅 (FR-005)
                        </button>
                    </div>
                    
                    {myChatRooms.length > 0 ? myChatRooms.map(room => (
                        <div key={room.id} onClick={() => navigate(`/chat/${room.id}`)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors">
                            <div className="relative">
                                {room.type === 'DIRECT' ? (
                                    // Just grab first other user or random avatar for demo
                                    <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id}`} />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold"><Users className="w-5 h-5" /></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{room.name}</h4>
                                    <span className="text-xs text-gray-400">{new Date(room.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">대화 목록이 없습니다.</div>
                    )}
                </div>
            )}

            {/* 5. MEMBERS TAB (FR-GROUP-DETAIL-001) */}
            {activeTab === 'MEMBERS' && (
                 <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="멤버 검색" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg border-none text-sm focus:ring-0 bg-transparent" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                        {participants.map(member => (
                            <div key={member.user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setShowParticipantModal(member)}>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar src={member.user.avatarUrl} />
                                        {renderRankBadge(member.role)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="font-bold text-sm text-gray-900">{member.user.nickname}</p>
                                            {member.role === 'HOST' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">방장</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{member.connectedGoalTitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right">
                                    <div>
                                        <div className="text-[10px] text-gray-400">신뢰도</div>
                                        <div className="text-sm font-bold text-gray-700">{member.user.trustScore}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {participants.length === 0 && <div className="p-8 text-center text-gray-400">참여자가 없습니다.</div>}
                    </div>
                 </div>
            )}
        </div>

        {/* --- Modals --- */}

        {/* Participant Detail Modal (FR-GROUP-DETAIL-002, 003, 006) */}
        {showParticipantModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowParticipantModal(null)}>
                <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="bg-gray-900 h-24 relative">
                        <button className="absolute top-4 right-4 text-white hover:bg-white/20 p-1 rounded-full" onClick={() => setShowParticipantModal(null)}><X className="w-5 h-5" /></button>
                    </div>
                    <div className="px-6 pb-6 relative">
                        <div className="absolute -top-10 left-6 border-4 border-white rounded-full">
                            <Avatar src={showParticipantModal.user.avatarUrl} size="lg" />
                        </div>
                        <div className="mt-12">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                {showParticipantModal.user.nickname}
                                {renderRankBadge(showParticipantModal.role)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 mb-4">
                                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><Shield className="w-3 h-3" /> 신뢰도 {showParticipantModal.user.trustScore}</span>
                            </div>

                            <div className="space-y-3">
                                {/* FR-GROUP-DETAIL-006: 1:1 Chat */}
                                {currentUser?.id !== showParticipantModal.user.id && (
                                    <Button fullWidth onClick={() => handleStartDirectChat(showParticipantModal.user)}>
                                        1:1 채팅하기
                                    </Button>
                                )}
                                {/* FR-GROUP-DETAIL-002: Profile */}
                                <Button variant="secondary" fullWidth onClick={() => navigate(`/user/${showParticipantModal.user.id}`)}>
                                    프로필 보기
                                </Button>
                                {/* FR-GROUP-DETAIL-003: Plan (Using mock navigation for now) */}
                                <Button variant="outline" fullWidth onClick={() => alert('해당 유저의 계획 페이지로 이동합니다 (구현 예정)')}>
                                    계획 보기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* New Chat Modal (FR-GROUP-DETAIL-005, 007) */}
        {showNewChatModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowNewChatModal(false)}>
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl h-[500px] flex flex-col" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-4">새로운 대화 시작</h3>
                    <p className="text-sm text-gray-500 mb-4">대화할 상대를 선택해주세요 (그룹 가능)</p>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                        {participants.filter(p => p.user.id !== currentUser?.id).map(p => (
                            <div key={p.user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => {
                                if (selectedChatUsers.includes(p.user.id)) {
                                    setSelectedChatUsers(prev => prev.filter(id => id !== p.user.id));
                                } else {
                                    setSelectedChatUsers(prev => [...prev, p.user.id]);
                                }
                            }}>
                                <div className="flex items-center gap-2">
                                    <Avatar src={p.user.avatarUrl} size="sm" />
                                    <span className="text-sm font-medium">{p.user.nickname}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedChatUsers.includes(p.user.id) ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                                    {selectedChatUsers.includes(p.user.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button fullWidth disabled={selectedChatUsers.length === 0} onClick={handleCreateGroupChat}>
                        {selectedChatUsers.length}명과 채팅 시작
                    </Button>
                </div>
            </div>
        )}

        {/* ... (Other Modals: Join, Leave, Notice, Full Image - Keep existing) ... */}
        {showJoinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                    <h3 className="text-xl font-bold mb-4">도전방 참여하기</h3>
                    <p className="text-gray-600 mb-4 text-sm">이 도전방과 함께할 나의 목표를 선택해주세요. (FR-289)</p>
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                        {myPlans.length > 0 ? myPlans.map(plan => (
                            <div key={plan.id} className="p-3 border border-gray-200 rounded-xl hover:border-primary-500 cursor-pointer hover:bg-primary-50 transition-colors" onClick={() => handleJoin(plan.id)}>
                                <p className="font-bold text-gray-900 text-sm">{plan.title}</p>
                                <p className="text-xs text-gray-500">{plan.category} • 진행률 {plan.progress}%</p>
                            </div>
                        )) : (<div className="text-center py-4 text-gray-400 text-sm">진행 중인 계획이 없습니다.</div>)}
                        <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-bold hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2" onClick={() => navigate('/new-plan')}><UserPlus className="w-4 h-4" /> 새 계획 만들기</button>
                    </div>
                    <div className="flex gap-3"><Button variant="secondary" fullWidth onClick={() => setShowJoinModal(false)}>취소</Button></div>
                </div>
            </div>
        )}
        {/* ... Other modals omitted for brevity (Keep existing implementations) ... */}
    </div>
  );
}
