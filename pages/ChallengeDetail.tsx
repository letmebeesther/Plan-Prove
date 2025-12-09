
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
import { Challenge, Participant, ChatMessage, Certification, Notice, ChatRoom, Plan } from '../types';

// --- Mock Data ---

const currentUser = { id: 'me', nickname: '나', avatarUrl: 'https://picsum.photos/200/200?random=999', trustScore: 88 };

const mockChallenge: Challenge = {
    id: 'c1',
    title: '미라클 모닝 5AM',
    description: '매일 아침 5시에 기상하여 하루를 시작하는 습관을 기릅니다. 타임스탬프 앱을 이용해 인증샷을 올려주세요. 서로 응원하며 성장합시다!\n\n**규칙**\n1. 오전 5:00 ~ 5:30 사이에 기상 인증\n2. 타임스탬프 필수\n3. 서로 격려의 댓글 남기기',
    statusMessage: '일찍 일어나는 새가 벌레를 잡는다 🐦',
    imageUrl: 'https://picsum.photos/1200/600?random=10',
    category: '생활루틴',
    tags: ['기상', '새벽', '습관', '자기계발'],
    isPublic: true,
    createdAt: '2023-09-01',
    host: { id: 'h1', nickname: '새벽반장', trustScore: 95, avatarUrl: 'https://picsum.photos/200/200?random=1' },
    coHosts: [{ id: 'ch1', nickname: '부반장1', trustScore: 92, avatarUrl: 'https://picsum.photos/200/200?random=2' }],
    participantCount: 1240,
    growthRate: 15,
    avgAchievement: 85,
    retentionRate: 90,
    avgTrustScore: 88,
    stabilityIndex: 95,
    notices: [
        { id: 'n1', title: '🚨 10월 챌린지 운영 정책 변경 안내', content: '인증 시간이 5:30분까지로 변경되었습니다.', author: { id: 'h1', nickname: '새벽반장', avatarUrl: '', trustScore: 95 }, createdAt: '2023-10-25', isImportant: true },
        { id: 'n2', title: '이달의 우수 인증러 발표', content: '축하합니다! @Member1 님', author: { id: 'h1', nickname: '새벽반장', avatarUrl: '', trustScore: 95 }, createdAt: '2023-10-20', isImportant: false }
    ]
};

const mockParticipants: Participant[] = Array(20).fill(null).map((_, i) => ({
    user: { id: `u${i}`, nickname: `Member ${i+1}`, avatarUrl: `https://picsum.photos/200/200?random=${i+10}`, trustScore: 70 + Math.floor(Math.random() * 30) },
    role: i === 0 ? 'HOST' : 'MEMBER',
    achievementRate: 60 + Math.floor(Math.random() * 40),
    growthRate: Math.floor(Math.random() * 20),
    connectedGoalTitle: '5시 기상 30일차 도전',
    joinedAt: '2023-09-15',
    lastCertifiedAt: '방금 전',
    trustScore: 70 + Math.floor(Math.random() * 30)
}));

const mockFeed: Certification[] = [
    { id: 'f1', user: mockParticipants[1].user, imageUrl: 'https://picsum.photos/400/400?random=20', description: '오늘도 성공! 상쾌하네요.', relatedGoalTitle: '30일 챌린지', createdAt: '10분 전', likes: 12, comments: 2, reactions: {'🔥': 5} },
    { id: 'f2', user: mockParticipants[2].user, imageUrl: 'https://picsum.photos/400/400?random=21', description: '조금 늦었지만 일어났습니다.', relatedGoalTitle: '습관 만들기', createdAt: '30분 전', likes: 5, comments: 1, reactions: {'👏': 3} },
    { id: 'f3', user: mockParticipants[3].user, description: '오늘은 텍스트로 인증합니다. 앱이 오류가 나네요 ㅠㅠ', relatedGoalTitle: '기상 미션', createdAt: '1시간 전', likes: 8, comments: 4, reactions: {'💪': 2} },
];

const mockChatMessages: ChatMessage[] = [
    { id: 'm1', user: mockParticipants[1].user, content: '좋은 아침입니다! ☀️', type: 'TEXT', createdAt: '오전 5:01', reactions: {'👋': 2} },
    { id: 'm2', user: mockParticipants[0].user, content: '모두 화이팅하세요!', type: 'TEXT', createdAt: '오전 5:05', reactions: {'🔥': 5} },
];

const mockChatRooms: ChatRoom[] = [
    { id: 'cr1', type: 'DIRECT', participants: [mockParticipants[1].user], lastMessage: '안녕하세요!', lastMessageTime: '어제', unreadCount: 0 },
    { id: 'cr2', type: 'GROUP', name: '서울 지역 모임', participants: [mockParticipants[1].user, mockParticipants[2].user], lastMessage: '이번 주 정모 어때요?', lastMessageTime: '10분 전', unreadCount: 3 },
];

const myPlans: Plan[] = [
    { id: 'p1', title: '나의 미라클 모닝', category: '생활루틴', progress: 0, description: '', startDate: '', endDate: '', subGoals: [], author: currentUser },
    { id: 'p2', title: '영어 단어 암기', category: '어학', progress: 50, description: '', startDate: '', endDate: '', subGoals: [], author: currentUser },
];

type TabType = 'HOME' | 'FEED' | 'CHAT' | 'MEMBERS' | 'CHATLIST';

export function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isJoined, setIsJoined] = useState(false); // Mock Join State
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Modals State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState<Participant | null>(null);
  const [showFeedDetailModal, setShowFeedDetailModal] = useState<Certification | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState<Notice | null>(null);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(mockChatMessages);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Feed Filter
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'PHOTO' | 'TEXT'>('ALL');

  // Member Sort
  const [memberSort, setMemberSort] = useState<'ACHIEVEMENT' | 'GROWTH' | 'TRUST' | 'RECENT'>('ACHIEVEMENT');
  const [memberSearch, setMemberSearch] = useState('');

  // Ranking State
  const [showAllRankings, setShowAllRankings] = useState(false);

  // Scroll to bottom on new chat
  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  // Handlers
  const handleJoin = (planId?: string) => {
      if (!planId) return; // In real app, link planId
      setIsJoined(true);
      setShowJoinModal(false);
      alert(`"${planId}" 계획과 함께 도전에 참여했습니다! 🎉`);
      setActiveTab('HOME'); // Ensure user lands on Home to see ranking
  };

  const handleLeave = () => {
      setIsJoined(false);
      setShowLeaveModal(false);
      navigate('/challenges'); // Or stay and show join button
  };

  const handleSendMessage = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!chatInput.trim()) return;
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          user: currentUser,
          content: chatInput,
          type: 'TEXT',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: {}
      };
      setMessages([...messages, newMsg]);
      setChatInput('');
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      alert('도전방 링크가 복사되었습니다!');
  };

  // Logic for Comprehensive Ranking (FR-210-5 ~ FR-210-10)
  // Total Score = (Achievement * 0.5) + (Growth * 0.3) + (Trust * 0.2)
  const calculateTotalScore = (p: Participant) => {
      return (p.achievementRate * 0.5) + (p.growthRate * 0.3) + (p.user.trustScore * 0.2);
  };

  const rankingParticipants = [...mockParticipants]
      .map(p => ({ ...p, totalScore: calculateTotalScore(p) }))
      .sort((a, b) => b.totalScore - a.totalScore); // Sort by Total Score Desc

  // --- Render Functions ---

  const renderRankBadge = (role: string) => {
      if (role === 'HOST') return <Crown className="w-3 h-3 text-yellow-500 fill-current" />;
      if (role === 'CO_HOST') return <Star className="w-3 h-3 text-gray-400 fill-current" />;
      return null;
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto bg-gray-50 min-h-screen">
        {/* --- Header (FR-164 ~ FR-182) --- */}
        <div className="relative h-64 md:h-80 bg-gray-900 group">
            <img 
                src={mockChallenge.imageUrl} 
                alt={mockChallenge.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 cursor-pointer" 
                onClick={() => setShowFullImage(mockChallenge.imageUrl)}
            />
            
            {/* Top Actions (FR-168) */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={handleCopyLink} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
                <button onClick={() => setIsBookmarked(!isBookmarked)} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <button className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/10">{mockChallenge.category}</span>
                    <span className="text-white/90 text-sm font-medium">{mockChallenge.statusMessage}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">{mockChallenge.title}</h1>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {mockChallenge.tags.map(tag => (
                        <span key={tag} className="text-xs text-white/80 bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm cursor-pointer hover:bg-black/40">#{tag}</span>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => setShowParticipantModal({ ...mockParticipants[0], role: 'HOST' })}>
                             <div className="relative">
                                 <Avatar src={mockChallenge.host.avatarUrl} size="sm" />
                                 <div className="absolute -top-1 -right-1"><Crown className="w-3 h-3 text-yellow-400 fill-current" /></div>
                             </div>
                             <span>{mockChallenge.host.nickname}</span>
                        </div>
                        <span className="text-white/50">|</span>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {mockChallenge.participantCount.toLocaleString()}명
                        </div>
                        <span className="text-white/50">|</span>
                        <span>개설일 {mockChallenge.createdAt}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Sticky Stats & Notice (FR-183 ~ FR-197) --- */}
        <div className="sticky top-14 z-20 bg-white shadow-sm border-b border-gray-100">
             {/* Notices */}
            {mockChallenge.notices && mockChallenge.notices.length > 0 && (
                <div className="bg-primary-50 px-4 py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Bell className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <span className="font-bold text-primary-700 whitespace-nowrap">공지</span>
                        <span className="truncate text-gray-700 cursor-pointer hover:underline" onClick={() => setShowNoticeModal(mockChallenge.notices![0])}>
                            {mockChallenge.notices[0].title}
                        </span>
                    </div>
                    {mockChallenge.notices.length > 1 && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2 cursor-pointer hover:text-gray-900">+더보기</span>
                    )}
                </div>
            )}
        </div>

        {/* --- Tabs (FR-219 ~ FR-224) --- */}
        <div className="bg-white px-4 border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'HOME', label: '홈' },
                    { id: 'FEED', label: '인증피드' },
                    { id: 'CHAT', label: '오픈채팅' },
                    { id: 'CHATLIST', label: '채팅목록' },
                    { id: 'MEMBERS', label: `멤버 ${mockChallenge.participantCount}` },
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

        {/* --- Content Area --- */}
        <div className="p-4 md:p-6 min-h-[500px]">
            
            {/* 1. HOME TAB */}
            {activeTab === 'HOME' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Dashboard (FR-183 ~ FR-191) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                         {[
                             { label: '그룹 성장률', value: `+${mockChallenge.growthRate}%`, icon: TrendingUp, color: 'text-green-600', tooltip: '지난 7일간 달성률 증가폭' },
                             { label: '평균 달성률', value: `${mockChallenge.avgAchievement}%`, icon: Target, color: 'text-blue-600', tooltip: '전체 멤버의 평균 목표 달성률' },
                             { label: '유지율', value: `${mockChallenge.retentionRate}%`, icon: Activity, color: 'text-orange-600', tooltip: '최근 7일 이내 인증한 멤버 비율' },
                             { label: '신뢰도 평균', value: `${mockChallenge.avgTrustScore}`, icon: Shield, color: 'text-indigo-600', tooltip: '멤버들의 평균 신뢰도 점수' },
                             { label: '안정성 지수', value: `${mockChallenge.stabilityIndex}`, icon: CheckCircle2, color: 'text-teal-600', tooltip: '신고/제재 없는 클린 지수' },
                         ].map((stat, i) => (
                             <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group cursor-help">
                                 <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                     {stat.label} <Info className="w-3 h-3 text-gray-300" />
                                 </div>
                                 <div className={`text-lg font-bold ${stat.color} flex items-center gap-1.5`}>
                                     <stat.icon className="w-4 h-4" /> {stat.value}
                                 </div>
                                 {/* Tooltip */}
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                     {stat.tooltip}
                                 </div>
                             </div>
                         ))}
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4">도전 소개</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{mockChallenge.description}</p>
                    </div>

                    {/* Comprehensive Ranking (FR-210-1 ~ FR-210-10) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> 실시간 종합 랭킹
                            </h3>
                            {isJoined && (
                                <span className="text-xs text-gray-500">내 순위: <span className="font-bold text-primary-600">5위</span> (종합 85.5점)</span>
                            )}
                        </div>
                        
                        {!isJoined && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[3px]">
                                <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                                    <Lock className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="font-bold text-gray-800 mb-1">참여자만 볼 수 있는 정보입니다.</p>
                                <p className="text-sm text-gray-500">도전에 참여하고 실시간 랭킹을 확인해보세요!</p>
                            </div>
                        )}

                        <div className={`space-y-3 ${!isJoined ? 'filter blur-sm select-none opacity-50' : ''}`}>
                            {rankingParticipants.slice(0, (!isJoined || !showAllRankings) ? 5 : undefined).map((p, idx) => {
                                const rank = idx + 1;
                                // Simulating current user (me) at index 4 (Rank 5)
                                const isMe = isJoined && idx === 4; 
                                return (
                                    <div key={p.user.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${isMe ? 'bg-primary-50 border border-primary-100' : 'hover:bg-gray-50'}`}>
                                        <div className={`w-8 text-center font-bold ${rank <= 3 ? 'text-yellow-500 text-lg' : 'text-gray-400'}`}>{rank}</div>
                                        <div className="relative">
                                            <Avatar src={p.user.avatarUrl} size="sm" />
                                            {rank === 1 && <div className="absolute -top-2 -right-1"><Crown className="w-4 h-4 text-yellow-500 fill-current" /></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-sm font-medium truncate ${isMe ? 'text-primary-700 font-bold' : 'text-gray-900'}`}>
                                                    {p.user.nickname} {isMe && '(나)'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">달성 {p.achievementRate}%</span>
                                                    <span className="text-sm font-bold text-indigo-600">{p.totalScore.toFixed(1)}점</span>
                                                </div>
                                            </div>
                                            <ProgressBar progress={p.totalScore} className="h-1.5" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* View All / Collapse Button */}
                        {isJoined && rankingParticipants.length > 5 && (
                            <button 
                                onClick={() => setShowAllRankings(!showAllRankings)}
                                className="w-full mt-4 py-2 text-sm text-gray-500 font-medium hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
                            >
                                {showAllRankings ? '접기' : '전체 랭킹 보기'} 
                                {showAllRankings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    {!isJoined && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-30 lg:relative lg:border-none lg:bg-transparent lg:p-0">
                             <Button size="lg" className="w-full max-w-md shadow-xl" onClick={() => setShowJoinModal(true)}>
                                 이 도전방 참여하기
                             </Button>
                        </div>
                    )}
                </div>
            )}

            {/* 2. FEED TAB (FR-243 ~ FR-261) */}
            {activeTab === 'FEED' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Filter */}
                    <div className="flex gap-2 mb-4">
                        {['ALL', 'PHOTO', 'TEXT'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFeedFilter(f as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${feedFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
                            >
                                {f === 'ALL' ? '전체' : f === 'PHOTO' ? '사진인증' : '글인증'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockFeed.filter(f => feedFilter === 'ALL' || (feedFilter === 'PHOTO' && f.imageUrl) || (feedFilter === 'TEXT' && !f.imageUrl)).map(feed => (
                            <div key={feed.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={() => setShowFeedDetailModal(feed)}>
                                {feed.imageUrl && (
                                    <div className="h-48 overflow-hidden bg-gray-100">
                                        <img src={feed.imageUrl} alt="cert" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar src={feed.user.avatarUrl} size="sm" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">{feed.user.nickname}</p>
                                            <p className="text-[10px] text-gray-400">{feed.createdAt}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 line-clamp-2 mb-2">{feed.description}</p>
                                    <p className="text-xs text-primary-600 mb-3 font-medium flex items-center gap-1">
                                        <Target className="w-3 h-3" /> {feed.relatedGoalTitle}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                                        <div className="flex gap-3">
                                            <span className="flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> {feed.likes}</span>
                                            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {feed.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. OPEN CHAT TAB (FR-225 ~ FR-242) */}
            {activeTab === 'CHAT' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[600px] flex flex-col animate-fade-in relative">
                    {!isJoined && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                            <Lock className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="font-bold text-gray-800 mb-1">참여자만 입장 가능합니다.</p>
                            <p className="text-sm text-gray-500 mb-4">도전에 참여하고 동료들과 소통해보세요!</p>
                            <Button onClick={() => setShowJoinModal(true)}>참여하기</Button>
                        </div>
                    )}
                    
                    {/* Chat Header */}
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span className="font-bold text-gray-700 text-sm">오픈 채팅방</span>
                             <span className="text-xs text-gray-400">{mockChallenge.participantCount}명 참여 중</span>
                         </div>
                         <button className="p-2 hover:bg-gray-200 rounded-full"><Search className="w-4 h-4 text-gray-500" /></button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200" ref={chatScrollRef}>
                         {messages.map(msg => (
                             <div key={msg.id} className={`flex gap-3 ${msg.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                 {msg.user.id !== currentUser.id && <Avatar src={msg.user.avatarUrl} size="sm" />}
                                 <div className={`max-w-[70%] ${msg.user.id === currentUser.id ? 'items-end' : 'items-start'} flex flex-col`}>
                                     {msg.user.id !== currentUser.id && <span className="text-xs text-gray-500 mb-1 ml-1">{msg.user.nickname}</span>}
                                     <div className={`p-3 rounded-2xl text-sm relative group ${
                                         msg.user.id === currentUser.id 
                                         ? 'bg-primary-500 text-white rounded-tr-none' 
                                         : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                     }`}>
                                         {msg.content}
                                         {/* Reactions */}
                                         {Object.keys(msg.reactions).length > 0 && (
                                             <div className="absolute -bottom-3 right-0 bg-white shadow-sm border border-gray-100 rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-0.5 text-gray-600">
                                                 {Object.entries(msg.reactions).map(([emoji, count]) => (
                                                     <span key={emoji}>{emoji} {count}</span>
                                                 ))}
                                             </div>
                                         )}
                                         {/* Message Actions */}
                                         <button className="hidden group-hover:block absolute top-0 -right-8 p-1 text-gray-400 hover:text-gray-600">
                                             <Smile className="w-4 h-4" />
                                         </button>
                                     </div>
                                     <span className="text-[10px] text-gray-300 mt-1 px-1">{msg.createdAt}</span>
                                 </div>
                             </div>
                         ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><Camera className="w-5 h-5" /></button>
                            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-transparent focus-within:border-primary-200 focus-within:bg-white transition-all">
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="메시지 입력..." 
                                    className="flex-1 bg-transparent text-sm focus:outline-none" 
                                />
                                <button type="button" className="text-gray-400 hover:text-yellow-500"><Smile className="w-5 h-5" /></button>
                            </div>
                            <button type="submit" disabled={!chatInput.trim()} className="p-2 bg-primary-500 disabled:bg-gray-300 text-white rounded-xl transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. CHAT LIST TAB (FR-262 ~ FR-269) */}
            {activeTab === 'CHATLIST' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-900">대화 목록</h3>
                        <button className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline">
                            <MessageSquare className="w-4 h-4" /> 새 채팅
                        </button>
                    </div>
                    
                    {mockChatRooms.map(room => (
                        <div key={room.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors">
                            <div className="relative">
                                {room.type === 'DIRECT' ? (
                                    <Avatar src={room.participants[0].avatarUrl} />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        <Users className="w-5 h-5" />
                                    </div>
                                )}
                                {room.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {room.unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">
                                        {room.type === 'DIRECT' ? room.participants[0].nickname : room.name}
                                    </h4>
                                    <span className="text-xs text-gray-400">{room.lastMessageTime}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                    {mockChatRooms.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            대화 목록이 없습니다. 멤버들과 대화를 시작해보세요!
                        </div>
                    )}
                </div>
            )}

            {/* 5. MEMBERS TAB (FR-198 ~ FR-218) */}
            {activeTab === 'MEMBERS' && (
                 <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="멤버 검색" 
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {['ACHIEVEMENT', 'GROWTH', 'TRUST', 'RECENT'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setMemberSort(s as any)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${memberSort === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {s === 'ACHIEVEMENT' ? '달성률순' : s === 'GROWTH' ? '성장률순' : s === 'TRUST' ? '신뢰도순' : '최근순'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                        {mockParticipants.map(member => (
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
                                <div className="flex items-center gap-4 text-right">
                                    <div className="hidden sm:block">
                                        <div className="text-[10px] text-gray-400">달성률</div>
                                        <div className="text-sm font-bold text-blue-600">{member.achievementRate}%</div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="text-[10px] text-gray-400">성장률</div>
                                        <div className="text-sm font-bold text-green-600">+{member.growthRate}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400">신뢰도</div>
                                        <div className="text-sm font-bold text-gray-700">{member.user.trustScore}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </div>

        {/* --- Footer / Leave Action (FR-167) --- */}
        {isJoined && (
            <div className="mt-12 text-center border-t border-gray-200 pt-8 pb-8">
                <button onClick={() => setShowLeaveModal(true)} className="text-gray-400 hover:text-red-500 text-sm font-medium flex items-center justify-center gap-1 mx-auto transition-colors">
                    <LogOut className="w-4 h-4" /> 도전방 나가기
                </button>
            </div>
        )}


        {/* --- Modals --- */}

        {/* 1. Join Modal (FR-286 ~ FR-293) */}
        {showJoinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                    <h3 className="text-xl font-bold mb-4">도전방 참여하기</h3>
                    <p className="text-gray-600 mb-4 text-sm">이 도전방과 함께할 나의 목표를 선택해주세요. (FR-289)</p>
                    
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                        {myPlans.map(plan => (
                            <div key={plan.id} className="p-3 border border-gray-200 rounded-xl hover:border-primary-500 cursor-pointer hover:bg-primary-50 transition-colors" onClick={() => handleJoin(plan.id)}>
                                <p className="font-bold text-gray-900 text-sm">{plan.title}</p>
                                <p className="text-xs text-gray-500">{plan.category} • 진행률 {plan.progress}%</p>
                            </div>
                        ))}
                        <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-bold hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2" onClick={() => navigate('/new-plan')}>
                            <UserPlus className="w-4 h-4" /> 새 계획 만들기
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="secondary" fullWidth onClick={() => setShowJoinModal(false)}>취소</Button>
                    </div>
                </div>
            </div>
        )}

        {/* 2. Leave Modal (FR-295 ~ FR-301) */}
        {showLeaveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">정말 나가시겠습니까?</h3>
                    <p className="text-gray-500 text-sm mb-6">나가시면 참여 기록은 보존되지만, 채팅방 대화 내용과 인증 기록에는 더 이상 접근할 수 없게 될 수도 있습니다.</p>
                    
                    <div className="flex gap-3">
                        <Button variant="secondary" fullWidth onClick={() => setShowLeaveModal(false)}>취소</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white border-none" fullWidth onClick={handleLeave}>나가기</Button>
                    </div>
                </div>
            </div>
        )}

        {/* 3. Participant Detail Modal (FR-211 ~ FR-218) */}
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
                                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> 신뢰도 {showParticipantModal.user.trustScore}
                                </span>
                                <span className="text-gray-500 text-xs">가입일 {showParticipantModal.joinedAt}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <div className="text-xs text-gray-500">개인 달성률</div>
                                    <div className="text-lg font-bold text-blue-600">{showParticipantModal.achievementRate}%</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <div className="text-xs text-gray-500">성장률</div>
                                    <div className="text-lg font-bold text-green-600">+{showParticipantModal.growthRate}%</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button fullWidth>1:1 채팅하기</Button>
                                <Button variant="secondary" fullWidth>프로필 보기</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* 4. Notice Modal (FR-194) */}
        {showNoticeModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowNoticeModal(null)}>
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowNoticeModal(null)}><X className="w-5 h-5" /></button>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">공지</span>
                        <span className="text-xs text-gray-400">{showNoticeModal.createdAt}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">{showNoticeModal.title}</h3>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4 min-h-[100px]">
                        {showNoticeModal.content}
                    </div>
                    <div className="flex items-center gap-2">
                        <Avatar src={showNoticeModal.author.avatarUrl} size="sm" />
                        <span className="text-sm font-medium">{showNoticeModal.author.nickname}</span>
                    </div>
                </div>
             </div>
        )}

        {/* 5. Full Image Modal (FR-165, FR-256) */}
        {showFullImage && (
            <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowFullImage(null)}>
                <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full hover:bg-white/30"><X className="w-6 h-6" /></button>
                <img src={showFullImage} alt="Full" className="max-w-full max-h-full object-contain" />
            </div>
        )}

    </div>
  );
}
