
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Users, Zap, Image as ImageIcon, MessageCircle, Heart, Bookmark, Flag, MoreHorizontal, Send, Star, X, ChevronRight, ExternalLink, RefreshCw, CheckCircle2, ThumbsUp, ThumbsDown, Camera, Type as TypeIcon, CheckSquare, History, Trophy } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/common/Button';
import { ForumPost, RandomMission } from '../types';
import { generateRandomMission } from '../services/geminiService';

// Mock Data
const challengeInfo = {
    title: '10월의 독서왕: 가을은 독서의 계절',
    description: '안녕하세요, 탐험가 여러분! 🍂\n선선한 가을 바람이 불어오는 10월, 책 한 권의 여유를 즐겨보는 건 어떨까요?\n매일 조금씩 읽고, 감명 깊은 구절을 공유하며 마음의 양식을 쌓아봅시다.\n완주하신 분들께는 한정판 "가을 독서왕" 배지를 드립니다!',
    participants: 3425,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    imageUrl: 'https://picsum.photos/1200/400?random=101'
};

// Mock History Data (FR-200-29 ~ FR-200-32)
const initialMissionHistory: RandomMission[] = [
    {
        id: 'h1',
        content: '책 표지 색깔과 같은 물건 찾기',
        date: '2023-10-25',
        type: 'CREATIVE',
        difficulty: 'EASY',
        participants: 230,
        isCompleted: true,
        completedAt: '2023-10-25 14:30',
        certificationType: 'PHOTO'
    },
    {
        id: 'h2',
        content: '인상 깊은 문장 3번 소리내어 읽기',
        date: '2023-10-24',
        type: 'ACTION',
        difficulty: 'EASY',
        participants: 180,
        isCompleted: true,
        completedAt: '2023-10-24 09:00',
        certificationType: 'CHECK'
    }
];

// Contextual Ads Data (Relevant to Reading)
const contextualAds = [
    { id: 'ad1', text: '📚 밀리의 서재 1개월 무료 체험하고 베스트셀러 무제한 읽기', link: '#' },
    { id: 'ad2', text: '💡 눈이 편안한 독서등, 루미큐브 30% 할인 쿠폰 받기', link: '#' },
    { id: 'ad3', text: '☕️ 독서와 함께하는 프리미엄 원두 커피 구독', link: '#' }
];

// Mock Posts (FR-207, FR-216)
const initialPosts: ForumPost[] = [
    {
        id: '1',
        author: { id: 'u1', nickname: 'BookLover', avatarUrl: 'https://picsum.photos/200/200?random=1', trustScore: 95 },
        content: '이번 달 목표 도서 "코스모스" 완독했습니다. 우주는 정말 경이롭네요. 🌌',
        imageUrl: 'https://picsum.photos/500/300?random=20',
        likes: 156,
        comments: 24,
        isPopular: true,
        createdAt: '2시간 전',
        replies: []
    },
    {
        id: '2',
        author: { id: 'u2', nickname: 'ReadingCat', avatarUrl: 'https://picsum.photos/200/200?random=2', trustScore: 88 },
        content: '오늘의 랜덤 미션 인증합니다! 제 인생 책 "어린왕자"입니다.',
        imageUrl: 'https://picsum.photos/500/300?random=21',
        likes: 45,
        comments: 8,
        isPopular: false,
        createdAt: '30분 전',
        replies: []
    },
    {
        id: '3',
        author: { id: 'u3', nickname: 'SlowReader', avatarUrl: 'https://picsum.photos/200/200?random=3', trustScore: 82 },
        content: '매일 30페이지씩 읽기 성공! 습관이 잡히는 것 같아 뿌듯해요.',
        likes: 32,
        comments: 5,
        isPopular: false,
        createdAt: '1시간 전',
        replies: []
    },
    {
        id: '4',
        author: { id: 'u4', nickname: 'HarryPotter', avatarUrl: 'https://picsum.photos/200/200?random=4', trustScore: 90 },
        content: '해리포터 원서 읽기 도전 중인데 모르는 단어가 너무 많네요 ㅠㅠ 다들 어떻게 공부하시나요?',
        likes: 28,
        comments: 12,
        isPopular: false,
        createdAt: '3시간 전',
        replies: []
    },
    {
        id: '5',
        author: { id: 'u5', nickname: 'NightOwl', avatarUrl: 'https://picsum.photos/200/200?random=5', trustScore: 85 },
        content: '밤에 읽는 소설이 최고죠. 추천 받습니다!',
        likes: 15,
        comments: 18,
        isPopular: false,
        createdAt: '5시간 전',
        replies: []
    }
];

export function MonthlyChallengeDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'POPULAR' | 'RECENT'>('POPULAR');
  const [newPostContent, setNewPostContent] = useState('');
  
  // Random Mission State
  const [todaysMission, setTodaysMission] = useState<RandomMission | null>(null);
  const [isLoadingMission, setIsLoadingMission] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [missionHistory, setMissionHistory] = useState(initialMissionHistory);
  
  // Completion Form State
  const [certType, setCertType] = useState<'PHOTO' | 'TEXT' | 'CHECK'>('CHECK');
  const [certText, setCertText] = useState('');
  
  // Filter Posts based on Tab (FR-208)
  const displayedPosts = activeTab === 'POPULAR' 
    ? [...initialPosts].sort((a, b) => b.likes - a.likes)
    : [...initialPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Generate Mission Handler (FR-200-6)
  const handleGenerateMission = async () => {
    setIsLoadingMission(true);
    try {
        const aiResponse = await generateRandomMission({
            challengeTitle: challengeInfo.title,
            userInterests: ['독서', '자기계발'], // Mock user profile
            previousMissions: missionHistory.map(m => m.content)
        });

        if (aiResponse) {
            const newMission: RandomMission = {
                id: Date.now().toString(),
                content: aiResponse.content,
                type: aiResponse.type,
                difficulty: aiResponse.difficulty,
                date: new Date().toLocaleDateString(),
                participants: 0,
                isCompleted: false
            };
            setTodaysMission(newMission);
        }
    } catch (e) {
        alert('미션 생성 중 오류가 발생했습니다.');
    } finally {
        setIsLoadingMission(false);
    }
  };

  // Regenerate Handler (FR-200-11 ~ 15)
  const handleRegenerate = async () => {
      if (regenerateCount >= 10) {
          alert('하루 최대 10회까지만 재생성 가능합니다.');
          return;
      }
      setRegenerateCount(prev => prev + 1);
      await handleGenerateMission();
  };

  // Complete Mission Handler
  const handleCompleteMission = () => {
      if (!todaysMission) return;
      
      const completedMission = {
          ...todaysMission,
          isCompleted: true,
          completedAt: new Date().toLocaleString(),
          certificationType: certType,
          certificationContent: certText,
          participants: todaysMission.participants + 1
      };

      setTodaysMission(completedMission);
      setMissionHistory([completedMission, ...missionHistory]);
      setIsCompleting(false);
      // Here you would send feedback to backend (FR-200-20)
  };

  const renderMissionTypeIcon = (type: string) => {
      switch(type) {
          case 'ACTION': return <Zap className="w-4 h-4" />;
          case 'REFLECTION': return <Star className="w-4 h-4" />;
          case 'CREATIVE': return <ImageIcon className="w-4 h-4" />;
          case 'SOCIAL': return <MessageCircle className="w-4 h-4" />;
          default: return <Zap className="w-4 h-4" />;
      }
  };

  const renderDifficultyStars = (diff: string) => {
      const count = diff === 'EASY' ? 1 : diff === 'MEDIUM' ? 2 : 3;
      return (
          <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`} />
              ))}
          </div>
      );
  };

  return (
    <div className="pb-20 max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header Section (FR-194 ~ FR-196) */}
        <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg group">
            <img src={challengeInfo.imageUrl} alt={challengeInfo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                <div className="flex items-center gap-3 mb-2 text-sm font-medium text-white/90">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {challengeInfo.startDate} ~ {challengeInfo.endDate}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {challengeInfo.participants.toLocaleString()}명 참여 중 (FR-198)</span>
                </div>
                <h1 className="text-3xl font-bold leading-tight">{challengeInfo.title}</h1>
            </div>
        </div>

        {/* Welcome & Info (FR-197) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">환영합니다! 👋</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{challengeInfo.description}</p>
        </div>

        {/* Random Mission Section (FR-200 Series) */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap className="w-40 h-40" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-indigo-200 text-sm font-bold">
                    <Zap className="w-4 h-4" /> 오늘의 랜덤 미션
                </div>
                {todaysMission && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                            {renderMissionTypeIcon(todaysMission.type)}
                            <span>{todaysMission.type}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                            {renderDifficultyStars(todaysMission.difficulty)}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="relative z-10 min-h-[100px] flex flex-col justify-center">
                {!todaysMission ? (
                    <div className="text-center py-4">
                        <p className="text-indigo-100 mb-4">오늘의 도전 과제를 확인해보세요! 개인 맞춤형 미션이 생성됩니다.</p>
                        <Button 
                            onClick={handleGenerateMission} 
                            disabled={isLoadingMission}
                            className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-md"
                        >
                             {isLoadingMission ? 'AI가 미션 생성 중...' : '✨ 오늘의 미션 받기'}
                        </Button>
                    </div>
                ) : !isCompleting ? (
                    <>
                        {todaysMission.isCompleted ? (
                             <div className="text-center py-2 animate-fade-in">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <Trophy className="w-8 h-8 text-yellow-500 fill-current" />
                                </div>
                                <h3 className="text-2xl font-bold mb-1">미션 성공! 축하합니다 🎉</h3>
                                <p className="text-indigo-100 mb-4">연속 7일 성공 시 특별 배지를 드려요!</p>
                                
                                {/* Feedback (FR-200-18) */}
                                <div className="bg-white/10 rounded-xl p-3 inline-flex items-center gap-4 backdrop-blur-md">
                                    <span className="text-sm">미션이 어떠셨나요?</span>
                                    <div className="flex gap-2">
                                        <button className="p-1 hover:bg-white/20 rounded"><ThumbsUp className="w-4 h-4" /></button>
                                        <button className="p-1 hover:bg-white/20 rounded"><ThumbsDown className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-up">
                                <h3 className="text-2xl font-bold mb-4 leading-tight">"{todaysMission.content}"</h3>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                    <div className="text-sm text-indigo-200">
                                        {regenerateCount > 0 && `오늘 재생성 ${regenerateCount}/10회`}
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button 
                                            onClick={handleRegenerate}
                                            className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium backdrop-blur-md transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" /> 다른 미션 ({10 - regenerateCount})
                                        </button>
                                        <button 
                                            onClick={() => setIsCompleting(true)}
                                            className="flex-1 sm:flex-none py-2 px-6 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold shadow-md transition-colors"
                                        >
                                            인증하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Completion Form (FR-200-13 ~ 16) */
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="font-bold">미션 인증하기</h4>
                             <button onClick={() => setIsCompleting(false)} className="p-1 hover:bg-white/20 rounded"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                             {[
                                 { id: 'CHECK', label: '완료 체크', icon: CheckSquare },
                                 { id: 'TEXT', label: '글 쓰기', icon: TypeIcon },
                                 { id: 'PHOTO', label: '사진 인증', icon: Camera }
                             ].map(type => (
                                 <button
                                    key={type.id}
                                    onClick={() => setCertType(type.id as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${certType === type.id ? 'bg-white text-indigo-600 shadow-sm' : 'bg-white/10 text-indigo-100 hover:bg-white/20'}`}
                                 >
                                     <type.icon className="w-4 h-4" /> {type.label}
                                 </button>
                             ))}
                        </div>

                        {certType === 'CHECK' && (
                            <p className="text-sm text-indigo-100 mb-4 text-center">"정직하게 실천했음을 약속합니다."</p>
                        )}

                        {certType === 'TEXT' && (
                            <textarea 
                                className="w-full h-20 rounded-lg p-3 text-gray-900 text-sm mb-4 focus:outline-none" 
                                placeholder="미션 수행 소감을 20자 이상 남겨주세요."
                                value={certText}
                                onChange={e => setCertText(e.target.value)}
                            />
                        )}

                        {certType === 'PHOTO' && (
                             <div className="h-32 rounded-lg border-2 border-dashed border-white/30 flex flex-col items-center justify-center mb-4 hover:bg-white/10 cursor-pointer">
                                 <Camera className="w-6 h-6 mb-1" />
                                 <span className="text-xs">사진 업로드</span>
                             </div>
                        )}

                        <Button 
                            onClick={handleCompleteMission}
                            fullWidth 
                            className="bg-green-500 hover:bg-green-600 text-white border-none shadow-lg"
                        >
                            완료 인증하기
                        </Button>
                    </div>
                )}
            </div>

            {/* History Toggle (FR-200-29) */}
            <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                 <button 
                    onClick={() => setHistoryOpen(!historyOpen)}
                    className="text-xs font-medium text-indigo-200 hover:text-white flex items-center gap-1"
                 >
                     <History className="w-3 h-3" /> 지난 미션 기록 {historyOpen ? '접기' : '보기'}
                 </button>
                 <span className="text-xs text-indigo-200">
                     최근 30일 완료율 <span className="text-white font-bold">85%</span>
                 </span>
            </div>

            {/* History List */}
            {historyOpen && (
                <div className="relative z-10 mt-2 space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 animate-fade-in">
                    {missionHistory.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-xs">
                             <div className="flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${m.isCompleted ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                 <span className="text-indigo-100">{m.date}</span>
                                 <span className="text-white truncate max-w-[150px]">{m.content}</span>
                             </div>
                             {m.isCompleted && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Community Feed Section */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-primary-500" /> 챌린지 소통
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('POPULAR')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'POPULAR' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                        인기순
                    </button>
                    <button 
                        onClick={() => setActiveTab('RECENT')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'RECENT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                        최신순
                    </button>
                </div>
            </div>

            {/* Post Input (FR-211) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="함께 나누고 싶은 이야기가 있나요?"
                    className="w-full h-20 resize-none border-none focus:ring-0 text-sm p-0 placeholder-gray-400"
                />
                <div className="flex justify-between items-center mt-2 border-t border-gray-50 pt-3">
                    <button className="text-gray-400 hover:text-primary-500 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button 
                        disabled={!newPostContent.trim()}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${newPostContent.trim() ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 text-gray-400'}`}
                    >
                        게시하기
                    </button>
                </div>
            </div>

            {/* Post List with Interspersed Ads */}
            <div className="space-y-4">
                {displayedPosts.map((post, index) => {
                    // Logic to insert an ad every 2 posts (index 1, 3, 5...)
                    const showAd = (index + 1) % 2 === 0;
                    const adIndex = Math.floor((index + 1) / 2) - 1;
                    const ad = contextualAds[adIndex % contextualAds.length];

                    return (
                        <React.Fragment key={post.id}>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-primary-100 transition-colors">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={post.author.avatarUrl} size="md" />
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-gray-900 text-sm">{post.author.nickname}</span>
                                                {post.isPopular && (
                                                    <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded flex items-center gap-0.5">
                                                        <Star className="w-3 h-3 fill-current" /> 인기
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{post.createdAt}</p>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <button className="text-gray-300 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
                                        {/* Dropdown Menu (FR-214, 215, 222) */}
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-lg rounded-xl py-1 w-32 hidden group-hover:block z-10">
                                            <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50">수정하기</button>
                                            <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-red-500">삭제하기</button>
                                            <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-500 flex items-center gap-1"><Flag className="w-3 h-3" /> 신고하기</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-line">
                                    {post.content}
                                </p>
                                {post.imageUrl && (
                                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-100">
                                        <img src={post.imageUrl} alt="post" className="w-full h-auto object-cover max-h-96" />
                                    </div>
                                )}

                                {/* Actions (FR-217, 218, 221) */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium">
                                            <Heart className="w-4 h-4" /> {post.likes}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm font-medium">
                                            <MessageCircle className="w-4 h-4" /> {post.comments}
                                        </button>
                                    </div>
                                    <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Interspersed Thin One-line Banner Ad */}
                            {showAd && (
                                <div className="rounded-xl bg-gray-50 border border-gray-100 py-3 px-4 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-all">
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
                })}
            </div>
        </div>
    </div>
  );
}
