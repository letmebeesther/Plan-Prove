
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Users, TrendingUp, Shield, Activity, Target, MessageCircle, Image as ImageIcon, Smile, 
    MoreHorizontal, Send, Settings, AlertTriangle, LogOut, Lock, UserPlus, 
    ChevronLeft, Share2, Bookmark, Flag, Info, Crown, Search, Filter, X, 
    ChevronDown, ChevronUp, Bell, Copy, CheckCircle2, ThumbsUp, MapPin, 
    Calendar, Maximize2, Camera, UserMinus, MessageSquare, Star, Trophy,
    Sparkles, ArrowRight, Zap, Flame, Coffee, ExternalLink
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Challenge, Participant, ChatMessage, Certification, Notice, ChatRoom, Plan, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToChat, sendChatMessage } from '../services/chatService';
import { fetchChallengeById, fetchMyActivePlans, fetchChallengeFeeds, fetchChallengeParticipants, createChatRoom, fetchMyChatRooms, createPlan, joinChallenge, leaveChallenge } from '../services/dbService';

type TabType = 'HOME' | 'FEED' | 'CHAT' | 'MEMBERS' | 'CHATLIST';

// Mock Recommendation Template Interface
interface PlanTemplate {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
    description: string;
    frequency: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const CHALLENGE_ADS = [
    { id: 'ad1', text: '💪 챌린지 성공을 위한 필수템! 단백질 보충제 특가', link: '#' },
    { id: 'ad2', text: '📚 독서 챌린지 참여자를 위한 베스트셀러 요약앱 1개월 무료', link: '#' },
    { id: 'ad3', text: '⏰ 인증 놓치지 않는 스마트 알람 시계 할인', link: '#' }
];

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
  const [showMenu, setShowMenu] = useState(false); // Dropdown menu state

  // New Chat Selection State
  const [selectedChatUsers, setSelectedChatUsers] = useState<string[]>([]);

  // Chat State (Open Chat)
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Member Sort & Search
  const [memberSort, setMemberSort] = useState<'ACHIEVEMENT' | 'GROWTH' | 'TRUST'>('ACHIEVEMENT');
  const [memberSearch, setMemberSearch] = useState('');

  // My Plans for Join Modal
  const [myPlans, setMyPlans] = useState<Plan[]>([]);
  const [recommendedPlans, setRecommendedPlans] = useState<PlanTemplate[]>([]);

  // --- Fetch Challenge Data ---
  useEffect(() => {
      const loadData = async () => {
          if (!id) return;
          setLoading(true);
          // Reset joined state initially to prevent stale state from previous challenge
          setIsJoined(false); 
          
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
                  } else {
                      setIsJoined(false);
                  }

                  // Generate Mock Recommendations based on challenge title
                  setRecommendedPlans([
                      { 
                          id: 'hard', name: '하드코어 모드', icon: Flame, color: 'text-red-500 bg-red-50',
                          description: '매일 실천하며 가장 빠르게 성장합니다.', frequency: '매일 실천', difficulty: 'HARD'
                      },
                      { 
                          id: 'steady', name: '꾸준함의 정석', icon: Zap, color: 'text-blue-500 bg-blue-50',
                          description: '주 3회, 무리하지 않고 오래갑니다.', frequency: '주 3회', difficulty: 'MEDIUM'
                      },
                      { 
                          id: 'light', name: '가벼운 시작', icon: Coffee, color: 'text-green-500 bg-green-50',
                          description: '주말이나 여유로울 때 실천합니다.', frequency: '주 1회', difficulty: 'EASY'
                      }
                  ]);
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
  const handleJoin = async (planId?: string) => {
      if (!planId || !currentUser || !id) return; 
      try {
          await joinChallenge(id, currentUser.id, planId);
          setIsJoined(true);
          setShowJoinModal(false);
          alert(`도전에 참여했습니다! 🎉`);
          setActiveTab('HOME'); 
          // Reload participants
          const parts = await fetchChallengeParticipants(id);
          setParticipants(parts);
      } catch (e) {
          alert('참여 중 오류가 발생했습니다.');
      }
  };

  const handleCreateAndJoin = async (template: PlanTemplate) => {
      if (!currentUser || !challenge) return;
      try {
          const planData = {
              title: `[${challenge.title}] ${template.name}`,
              description: `${challenge.title}에 참여하기 위한 ${template.name} 계획입니다.`,
              category: challenge.category,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
              subGoals: [
                  { 
                      title: '1주차 목표 달성', 
                      description: `${template.frequency} 실천하기`, 
                      status: 'pending', 
                      dueDate: new Date().toISOString().split('T')[0], 
                      evidenceTypes: ['PHOTO'] 
                  },
                  {
                      title: '최종 목표 달성', 
                      description: '챌린지 완주하기', 
                      status: 'pending', 
                      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      evidenceTypes: ['PHOTO']
                  }
              ],
              progress: 0,
              createdAt: new Date().toISOString(),
              difficulty: template.difficulty
          };
          const newPlanId = await createPlan(currentUser.id, planData);
          handleJoin(newPlanId);
      } catch (e) {
          alert('플랜 생성 실패');
      }
  };

  const handleLeaveClick = () => {
      setShowMenu(false);
      setShowLeaveModal(true);
  };

  const processLeave = async () => {
      if (!currentUser || !id) return;
      
      try {
          await leaveChallenge(id, currentUser.id);
          setIsJoined(false);
          setShowLeaveModal(false);
          alert("도전을 그만두었습니다.");
          // Reload participants
          const parts = await fetchChallengeParticipants(id);
          setParticipants(parts);
      } catch (e) {
          alert('오류가 발생했습니다.');
      }
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

  const handleStartDirectChat = async (targetUser: User) => {
      if (!currentUser) return;
      if (currentUser.trustScore < 50 && targetUser.trustScore > 80) { 
          alert('친구 관계인 사용자만 채팅이 가능합니다.');
          return;
      }
      try {
          const roomId = await createChatRoom([currentUser, targetUser], 'DIRECT');
          navigate(`/chat/${roomId}`);
      } catch (e) {
          alert('채팅 시작 실패');
      }
  };

  const handleCreateGroupChat = async () => {
      if (!currentUser || selectedChatUsers.length === 0) return;
      
      const targetUsers = participants
          .filter(p => selectedChatUsers.includes(p.user.id))
          .map(p => p.user);
      
      if (targetUsers.length > 5) {
           alert('최대 5명까지 초대 가능합니다.');
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

  // Sorting Logic for Members
  const getSortedParticipants = () => {
      const sorted = [...participants].filter(p => p.user.nickname.toLowerCase().includes(memberSearch.toLowerCase()));
      switch (memberSort) {
          case 'ACHIEVEMENT':
              return sorted.sort((a, b) => b.achievementRate - a.achievementRate);
          case 'GROWTH':
              return sorted.sort((a, b) => b.growthRate - a.growthRate);
          case 'TRUST':
              return sorted.sort((a, b) => b.user.trustScore - a.user.trustScore);
          default:
              return sorted;
      }
  };

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
    <div className="pb-24 max-w-5xl mx-auto bg-gray-50 min-h-screen animate-fade-in relative">
        {/* Header & Sticky Stats */}
        <div className="relative h-64 md:h-80 bg-gray-900 group">
            <img 
                src={challenge.imageUrl} 
                alt={challenge.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 cursor-pointer" 
                onClick={() => setShowFullImage(challenge.imageUrl)}
            />
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={handleCopyLink} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"><Share2 className="w-5 h-5" /></button>
                <button onClick={() => setIsBookmarked(!isBookmarked)} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"><Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} /></button>
                
                {/* NEW: More Menu for Leave Action (Changed from CSS hover to State click) */}
                {isJoined && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)} 
                            className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                    <button 
                                        onClick={handleLeaveClick}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> 도전 그만두기
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
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
                    
                    {/* Status Badge if Joined */}
                    {isJoined && (
                        <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-4 py-1.5 rounded-full text-green-400 font-bold text-sm shadow-lg">
                            <CheckCircle2 className="w-4 h-4" /> 참여 중
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="bg-white px-4 border-b border-gray-200 sticky top-0 z-30 shadow-sm">
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
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                         {[
                             { label: '그룹 성장률', value: `+${challenge.growthRate || 0}%`, icon: TrendingUp, color: 'text-green-600' },
                             { label: '평균 달성률', value: `${challenge.avgAchievement || 0}%`, icon: Target, color: 'text-blue-600' },
                             { label: '유지율', value: `${challenge.retentionRate || 100}%`, icon: Activity, color: 'text-orange-600' },
                             { label: '신뢰도 평균', value: `${challenge.avgTrustScore || 50}`, icon: Shield, color: 'text-indigo-600' },
                         ].map((stat, i) => (
                             <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                                <div className={`text-lg font-bold ${stat.color} flex items-center gap-1.5`}>
                                    <stat.icon className="w-4 h-4" /> {stat.value}
                                </div>
                             </div>
                         ))}
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4">도전 소개</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{challenge.description}</p>
                    </div>
                </div>
            )}

            {/* 2. FEED TAB */}
            {activeTab === 'FEED' && (
                <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                    {feeds.length > 0 ? feeds.map((feed, index) => {
                        const showAd = (index + 1) % 3 === 0;
                        const adIndex = Math.floor((index + 1) / 3) - 1;
                        const ad = CHALLENGE_ADS[adIndex % CHALLENGE_ADS.length];

                        return (
                            <React.Fragment key={feed.id}>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                                    <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div onClick={(e) => { e.stopPropagation(); navigate(`/user/${feed.user.id}`) }} className="cursor-pointer">
                                                <Avatar src={feed.user.avatarUrl} size="md" border />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <p 
                                                        className="text-sm font-bold text-gray-900 cursor-pointer hover:underline"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/user/${feed.user.id}`) }}
                                                    >
                                                        {feed.user.nickname}
                                                    </p>
                                                    <span className="text-gray-300">•</span>
                                                    <p className="text-xs text-gray-400">{feed.createdAt}</p>
                                                </div>
                                                <p className="text-xs text-primary-600 font-medium">{feed.relatedGoalTitle}</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-300 hover:text-gray-600 p-1">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {feed.imageUrl && (
                                        <div className="w-full bg-gray-100 cursor-pointer" onClick={() => setShowFullImage(feed.imageUrl)}>
                                            <img src={feed.imageUrl} alt="cert" className="w-full h-auto object-cover max-h-[500px]" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mb-3">{feed.description}</p>
                                        <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium">
                                                <Flame className="w-5 h-5" /> {feed.likes}
                                            </button>
                                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm font-medium">
                                                <MessageCircle className="w-5 h-5" /> {feed.comments}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {showAd && (
                                    <div className="rounded-xl bg-gray-50 border border-gray-100 py-3 px-4 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-all mb-4">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="flex-shrink-0 text-[10px] font-bold text-gray-400 border border-gray-300 px-1.5 py-0.5 rounded">AD</span>
                                            <span className="text-xs text-gray-600 truncate font-medium group-hover:text-primary-600 transition-colors">
                                                {ad.text}
                                            </span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 group-hover:text-primary-500" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    }) : (
                        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">아직 등록된 인증 피드가 없습니다.</p>
                            <p className="text-xs mt-1">가장 먼저 인증을 남겨보세요!</p>
                        </div>
                    )}
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
                                {msg.user.id !== currentUser?.id && (
                                    <div onClick={() => navigate(`/user/${msg.user.id}`)} className="cursor-pointer">
                                        <Avatar src={msg.user.avatarUrl} size="sm" />
                                    </div>
                                )}
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

            {/* 4. CHAT LIST TAB */}
            {activeTab === 'CHATLIST' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-900">나의 대화 목록</h3>
                        <button onClick={() => setShowNewChatModal(true)} className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline">
                            <MessageSquare className="w-4 h-4" /> 새 채팅
                        </button>
                    </div>
                    {myChatRooms.length > 0 ? myChatRooms.map(room => (
                        <div key={room.id} onClick={() => navigate(`/chat/${room.id}`)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors">
                            <div className="relative">
                                {room.type === 'DIRECT' ? (
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

            {/* 5. MEMBERS TAB */}
            {activeTab === 'MEMBERS' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="멤버 검색" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div className="flex gap-2">
                            {[
                                { id: 'ACHIEVEMENT', label: '목표 달성률', icon: Target },
                                { id: 'TRUST', label: '신뢰도', icon: Shield },
                                { id: 'GROWTH', label: '성장률', icon: TrendingUp },
                            ].map(sort => (
                                <button
                                    key={sort.id}
                                    onClick={() => setMemberSort(sort.id as any)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                        memberSort === sort.id 
                                        ? 'bg-gray-900 text-white shadow-md' 
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <sort.icon className="w-3.5 h-3.5" />
                                    {sort.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                        {getSortedParticipants().map((member, index) => (
                            <div 
                                key={member.user.id} 
                                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                                onClick={() => navigate(`/user/${member.user.id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-6 text-sm font-bold text-gray-400">
                                        {index + 1}
                                    </div>
                                    <div className="relative">
                                        <Avatar src={member.user.avatarUrl} />
                                        {renderRankBadge(member.role)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="font-bold text-sm text-gray-900 group-hover:text-primary-600 transition-colors">{member.user.nickname}</p>
                                            {member.role === 'HOST' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">방장</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span 
                                                className="truncate max-w-[120px] hover:text-primary-600 hover:underline z-10 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (member.connectedGoalId) navigate(`/plan/${member.connectedGoalId}`);
                                                }}
                                            >
                                                {member.connectedGoalTitle}
                                            </span>
                                            {memberSort === 'ACHIEVEMENT' && <span className="text-blue-600 font-bold">달성 {member.achievementRate}%</span>}
                                            {memberSort === 'GROWTH' && <span className="text-green-600 font-bold">성장 +{member.growthRate}%</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400">신뢰도</div>
                                    <div className="text-sm font-bold text-gray-700 flex items-center justify-end gap-1">
                                        <Shield className="w-3 h-3" /> {member.user.trustScore}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {participants.length === 0 && <div className="p-8 text-center text-gray-400">참여자가 없습니다.</div>}
                    </div>
                </div>
            )}
        </div>

        {/* Global Portals for Fixed Elements */}
        {createPortal(
            <>
                {/* 1. Global Join Button (Fixed at Bottom, outside regular layout flow) */}
                {!isJoined && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] lg:pl-64 animate-fade-in">
                         <Button size="lg" className="w-full max-w-md shadow-xl flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white transform hover:scale-[1.02] transition-transform" onClick={() => setShowJoinModal(true)}>
                             <UserPlus className="w-5 h-5" /> 이 도전방 참여하기
                         </Button>
                    </div>
                )}

                {/* 2. Join Modal */}
                {showJoinModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-bold">도전 참여하기</h3>
                                    <button onClick={() => setShowJoinModal(false)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"><X className="w-5 h-5" /></button>
                                </div>
                                <p className="text-indigo-100 text-sm">함께하면 더 멀리 갈 수 있습니다. 나만의 계획을 세워보세요.</p>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-8">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-violet-600" /> AI 추천 맞춤 플랜
                                    </h4>
                                    <div className="grid gap-3">
                                        {recommendedPlans.map(template => (
                                            <div 
                                                key={template.id} 
                                                onClick={() => handleCreateAndJoin(template)}
                                                className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-violet-500 hover:shadow-lg transition-all group relative overflow-hidden"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${template.color}`}>
                                                        <template.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h5 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{template.name}</h5>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${template.difficulty === 'HARD' ? 'bg-red-100 text-red-600' : template.difficulty === 'MEDIUM' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                                {template.difficulty}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                                                        <div className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded inline-block">
                                                            {template.frequency}
                                                        </div>
                                                    </div>
                                                    <div className="self-center">
                                                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500 font-medium">또는</span></div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3 text-sm">기존 계획으로 참여</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {myPlans.length > 0 ? myPlans.map(plan => (
                                            <div key={plan.id} className="p-3 border border-gray-200 rounded-xl hover:border-primary-500 cursor-pointer hover:bg-primary-50 transition-colors flex justify-between items-center" onClick={() => handleJoin(plan.id)}>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{plan.title}</p>
                                                    <p className="text-xs text-gray-500">{plan.category} • {plan.progress}%</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300" />
                                            </div>
                                        )) : (<div className="text-center py-3 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">진행 중인 계획이 없습니다.</div>)}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/new-plan')}
                                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    새로운 계획 직접 만들기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Full Image Modal */}
                {showFullImage && (
                    <div className="fixed inset-0 z-[120] bg-black flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowFullImage(null)}>
                        <img src={showFullImage} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg" />
                        <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full hover:bg-white/30"><X className="w-6 h-6" /></button>
                    </div>
                )}

                <ConfirmDialog 
                    isOpen={showLeaveModal}
                    title="도전 그만두기"
                    message="정말로 도전을 그만두시겠습니까? 그동안의 기록은 유지되지만 멤버 목록에서 제외됩니다."
                    onConfirm={processLeave}
                    onCancel={() => setShowLeaveModal(false)}
                    isDangerous
                    confirmLabel="그만두기"
                />
            </>,
            document.body
        )}
    </div>
  );
}
