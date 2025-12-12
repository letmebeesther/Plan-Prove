
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, ArrowRight, CheckCircle2, Megaphone, Star, Gift, Heart, MessageCircle, Share2, MoreHorizontal, Smile, Trophy, Check, Hash, Flame, Plus, Crown, Medal, AlertCircle, Clock, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Plan, Challenge, Certification } from '../types';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyActivePlans, fetchChallenges, fetchHallOfFame, fetchPopularFeeds, fetchHomeFeed, HomeFeedItem, fetchPublicPlans } from '../services/dbService';

// Mock Data for UI parts not connected to DB yet
const banners = [
  {
    id: 1,
    type: 'NOTICE',
    label: '공지사항',
    title: 'Plan & Prove 2.0 업데이트! 🎉',
    description: 'AI 플랜 생성 기능과 챌린지 시스템이 새롭게 추가되었습니다.',
    date: '2023.10.25',
    icon: Megaphone,
    bgClass: 'bg-gradient-to-r from-primary-600 to-primary-800',
    decoration: 'bg-white/10'
  },
  {
    id: 2,
    type: 'EVENT',
    label: '이벤트',
    title: '친구 초대하고 포인트 받자 🎁',
    description: '친구와 함께 성장하는 즐거움! 초대할 때마다 500P 지급',
    date: '진행중',
    icon: Gift,
    bgClass: 'bg-gradient-to-r from-violet-600 to-indigo-600',
    decoration: 'bg-purple-400/20'
  },
  {
    id: 3,
    type: 'AD',
    label: '광고',
    title: '프리미엄 멤버십 1개월 무료',
    description: '광고 없이 무제한 챌린지 참여, 더 강력한 통계 기능까지.',
    date: '기간한정',
    icon: Star,
    bgClass: 'bg-gradient-to-r from-orange-500 to-pink-600',
    decoration: 'bg-yellow-400/20'
  }
];

export function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Real Data State
  const [activePlans, setActivePlans] = useState<Plan[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [trendingPlans, setTrendingPlans] = useState<Plan[]>([]);
  const [bestHallOfFame, setBestHallOfFame] = useState<any[]>([]);
  
  // Feed State (Consolidated)
  const [feedItems, setFeedItems] = useState<HomeFeedItem[]>([]);
  const [lastFeedCursor, setLastFeedCursor] = useState<string | undefined>(undefined);
  const [hasMoreFeeds, setHasMoreFeeds] = useState(true);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Infinite Scroll Refs
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (currentUser) {
          const plans = await fetchMyActivePlans(currentUser.id);
          setActivePlans(plans);
        }
        
        const fetchedChallenges = await fetchChallenges();
        setChallenges(fetchedChallenges.slice(0, 4)); 
        
        // Trending Plans: Fetch public plans, sort by likes, take top 5
        const publicPlans = await fetchPublicPlans();
        const trending = publicPlans
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 5);
        setTrendingPlans(trending);
        
        const fame = await fetchHallOfFame('BEST');
        setBestHallOfFame(fame.slice(0, 3)); 

        // Initial Feed Fetch
        await loadMoreFeeds(true);

      } catch (e: any) { 
        console.error("Data loading error:", e);
        setError("데이터를 불러오는 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFeeds && !loadingFeeds) {
          loadMoreFeeds();
        }
      },
      { 
          threshold: 0.1,
          root: scrollContainerRef.current, // CRITICAL: Observe relative to the scroll container
          rootMargin: '100px'
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMoreFeeds, loadingFeeds, lastFeedCursor]); // Added lastFeedCursor for freshness

  const loadMoreFeeds = async (isInitial = false) => {
      if (loadingFeeds) return;
      setLoadingFeeds(true);
      try {
          const currentCursor = isInitial ? undefined : lastFeedCursor;
          // Fetch slightly more items (10) to fill the screen
          const { feedItems: newItems, nextCursor } = await fetchHomeFeed(currentCursor, 10);
          
          if (newItems.length === 0) {
              setHasMoreFeeds(false);
          } else {
              setFeedItems(prev => isInitial ? newItems : [...prev, ...newItems]);
              setLastFeedCursor(nextCursor);
          }
      } catch (e) {
          console.error("Feed load error:", e);
      } finally {
          setLoadingFeeds(false);
      }
  };

  // Format Time Helper
  const formatTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return '방금 전';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  const renderFeedItem = (item: HomeFeedItem) => {
      const isPlanCompletion = item.type === 'PLAN_COMPLETION';
      const isChallengePost = item.type === 'CHALLENGE_POST';

      return (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4 animate-fade-in hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                      <Avatar src={item.user.avatarUrl} size="md" border />
                      <div>
                          <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 text-sm">{item.user.nickname}</span>
                              <span className="text-xs text-gray-400">• {formatTimeAgo(item.createdAt)}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              {isPlanCompletion ? (
                                  <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded">
                                      <Trophy className="w-3 h-3" /> 계획 완주
                                  </span>
                              ) : isChallengePost ? (
                                  <span className="text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded">
                                      <Users className="w-3 h-3" /> 함께 도전하기
                                  </span>
                              ) : (
                                  <span className="text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded">
                                      <CheckSquare className="w-3 h-3" /> 중간 인증
                                  </span>
                              )}
                              <span className="truncate max-w-[150px] font-medium text-gray-700">
                                  {item.relatedTitle}
                              </span>
                          </div>
                      </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                  </button>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-800 mb-3 whitespace-pre-line leading-relaxed">
                  {item.content}
              </p>

              {/* Media */}
              {item.imageUrl && (
                  <div className="rounded-xl overflow-hidden mb-3 border border-gray-100 bg-gray-50">
                      <img src={item.imageUrl} alt="Feed content" className="w-full h-auto max-h-96 object-contain mx-auto" />
                  </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex gap-4">
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium">
                          <Heart className="w-4 h-4" /> {item.likes || 0}
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm font-medium">
                          <MessageCircle className="w-4 h-4" /> {item.comments || 0}
                      </button>
                  </div>
                  <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                      <Star className="w-5 h-5" />
                  </button>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      
      {/* 1. Dashboard Banner Carousel */}
      <section className="relative w-full h-[288px] rounded-3xl overflow-hidden shadow-lg group">
        {banners.map((banner, index) => {
          const Icon = banner.icon;
          const isActive = index === currentBannerIndex;
          
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              } ${banner.bgClass}`}
            >
              <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl ${banner.decoration}`}></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

              <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/10 shadow-sm">
                    {banner.label}
                  </span>
                  <span className="text-white/80 text-xs font-medium">{banner.date}</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight drop-shadow-sm">
                  {banner.title}
                </h3>
                <p className="text-white/90 text-sm sm:text-base max-w-xl opacity-95 mb-6 line-clamp-2">
                  {banner.description}
                </p>

                <button className="flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all w-fit px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/10">
                  자세히 보기 <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 transform scale-150 rotate-12 pointer-events-none hidden sm:block">
                <Icon className="w-40 h-40 text-white" />
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-4 left-8 sm:left-12 z-20 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentBannerIndex ? 'bg-white w-8' : 'bg-white/40 w-1.5 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Welcome & Action */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">반가워요, {currentUser?.nickname || '탐험가'}님! 👋</h1>
            <p className="text-gray-500 mt-1">오늘 <span className="text-primary-600 font-bold">{activePlans.length}개의 계획</span>이 진행 중입니다.</p>
        </div>
        <button 
            onClick={() => navigate('/new-plan')}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium shadow-[0_4px_12px_0_rgba(14,165,233,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">+</div> 새 계획
        </button>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-sm text-red-700 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* 4. Active Plans Grid */}
      <section>
          <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary-500" />
                  현재 진행 상황
              </h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline decoration-2 underline-offset-4">전체 보기</button>
          </div>
          
          {loading ? (
             <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                로딩 중...
             </div>
          ) : activePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePlans.map(plan => (
                    <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.08)] transition-all border border-gray-100 cursor-pointer group flex flex-col h-full" onClick={() => navigate(`/plan/${plan.id}`)}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg group-hover:bg-blue-100 transition-colors">{plan.category}</span>
                            <div className="flex items-center gap-1 text-primary-600 font-bold text-sm">
                                <span>{plan.progress}%</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 truncate text-lg">{plan.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-grow">{plan.description}</p>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${plan.progress}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400 font-medium mt-auto">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 종료일 {plan.endDate}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <p className="text-gray-500 mb-4">아직 진행 중인 계획이 없습니다.</p>
               <button onClick={() => navigate('/new-plan')} className="text-primary-600 font-bold hover:underline">새 계획 시작하기</button>
            </div>
          )}
      </section>

      {/* 5. Best Plans Hall of Fame */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" fill="currentColor" />
              명예의 전당 (Best)
          </h2>
          <button onClick={() => navigate('/hall-of-fame')} className="text-sm text-gray-500 hover:text-gray-900 font-medium">더 보기</button>
        </div>
        
        {bestHallOfFame.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestHallOfFame.map((item) => (
                <div 
                    key={item.id} 
                    onClick={() => item.planId ? navigate(`/plan/${item.planId}`) : navigate('/hall-of-fame')}
                    className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group h-48 border border-gray-100"
                >
                    {/* Background Image with Gradient */}
                    <div className="absolute inset-0">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    </div>
                    
                    {/* Rank Badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold border border-white/20 shadow-lg z-10">
                        {item.rank}
                    </div>

                    {/* Crown for #1 */}
                    {item.rank === 1 && (
                        <div className="absolute top-0 right-4 transform -translate-y-1/3 z-10 drop-shadow-lg">
                            <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400" />
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-4 text-white z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">{item.category}</span>
                            <span className="text-xs text-white/80 flex items-center gap-1">
                                <Avatar src={item.avatarUrl} size="sm" border />
                                {item.authorName}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight truncate mb-1 drop-shadow-md">{item.title}</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                                <Medal className="w-4 h-4" /> {item.score}점
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="p-6 bg-yellow-50 text-yellow-800 rounded-xl text-center">
                데이터베이스가 비어있습니다. 설정 페이지에서 '초기 데이터 생성'을 진행해주세요.
            </div>
        )}
      </section>

      {/* NEW: 5.5 Real-time Trending Plans (NOT Challenges/Rooms) TOP 5 */}
      <section>
        <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
                    실시간 인기 도전 (개인 목표)
                </h2>
                <p className="text-sm text-gray-500 mt-1">지금 가장 핫한 다른 유저들의 목표를 확인해보세요!</p>
            </div>
            <button onClick={() => navigate('/trending')} className="text-sm text-gray-500 hover:text-gray-900 font-medium">더 보기</button>
        </div>

        <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
            {trendingPlans.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {trendingPlans.map((plan, idx) => (
                        <div 
                            key={plan.id} 
                            onClick={() => navigate(`/plan/${plan.id}`)}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group rounded-xl"
                        >
                            {/* Rank */}
                            <div className={`text-xl font-bold w-8 text-center ${idx < 3 ? 'text-red-500' : 'text-gray-400'}`}>
                                {idx + 1}
                            </div>
                            
                            {/* Image - Use Author Avatar if Plan image not available or small thumbnail */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative border border-gray-200">
                                <img src={plan.imageUrl || plan.author.avatarUrl} alt={plan.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{plan.category}</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <span className="text-gray-300">|</span>
                                        <span>{plan.author.nickname}</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{plan.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1 text-red-500 font-bold"><Heart className="w-3 h-3 fill-current" /> {plan.likes || 0}</span>
                                    <span className="text-gray-300">|</span>
                                    <span>진행률 {plan.progress}%</span>
                                </div>
                            </div>

                            {/* Action Icon */}
                            <div className="text-gray-300 group-hover:text-primary-500 transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-gray-400">
                    실시간 인기 목표를 집계 중입니다...
                </div>
            )}
        </div>
      </section>

      {/* 6. Recommended Challenges (Rooms) */}
      <section>
        <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-orange-500" />
                    추천 챌린지 (그룹)
                </h2>
                <p className="text-sm text-gray-500 mt-1">회원님의 관심사에 딱 맞는 방을 찾아보세요.</p>
            </div>
            <button onClick={() => navigate('/challenges')} className="text-sm text-gray-500 hover:text-gray-900 font-medium">더 보기</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {challenges.length > 0 ? challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col group cursor-pointer" onClick={() => navigate(`/challenges/${challenge.id}`)}>
                    <div className="h-32 bg-gray-200 relative overflow-hidden">
                        <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold rounded shadow-sm">
                            {challenge.category}
                        </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 truncate">{challenge.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                             <Users className="w-3 h-3 mr-1" /> {challenge.participantCount.toLocaleString()}명 참여 중
                        </div>
                        
                        <div className="mt-auto">
                            <button className="w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5 group-hover:bg-primary-600 group-hover:text-white">
                                <Plus className="w-3.5 h-3.5" /> 바로 참여하기
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="col-span-full text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    추천할 챌린지가 없습니다.
                </div>
            )}
        </div>
      </section>

      {/* Friends Feed (Thread Style) - Fixed Height Container with Infinite Scroll */}
      <section className="bg-gray-50/50 pt-2 border-t border-gray-100 mt-4 pb-10">
          <div className="flex items-center justify-between mb-6 px-1 pt-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-500" />
                친구들의 활동
            </h2>
            <span className="text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">실시간 피드</span>
          </div>
          
          {/* Scrollable Container with Fixed Height */}
          <div 
            ref={scrollContainerRef}
            className="max-w-2xl mx-auto h-[800px] overflow-y-auto pr-2 custom-scrollbar scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent rounded-2xl relative"
          >
              {feedItems.length > 0 ? (
                  <>
                    {/* Render List with Dynamic Divider */}
                    {(() => {
                        let dividerShown = false;
                        return feedItems.map((item, idx) => {
                            // Divider Logic: Show before the first item that is NOT recent (older than 48h)
                            const showDivider = !item.isRecent && !dividerShown;
                            if (showDivider) {
                                dividerShown = true;
                            }

                            return (
                                <React.Fragment key={item.id}>
                                    {showDivider && (
                                        <div className="py-12 text-center animate-fade-in">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-[0_4px_12px_0_rgba(22,163,74,0.15)] border-4 border-white ring-1 ring-gray-100">
                                                    <CheckCircle2 className="w-8 h-8" strokeWidth={3} />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-lg mb-1">모든 최신 활동을 확인했습니다</h3>
                                                <p className="text-gray-500 text-sm">48시간 이내의 새 소식을 모두 보셨습니다.<br/>아래는 이전 활동 내역입니다.</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-8 opacity-50">
                                                <div className="h-px bg-gray-300 flex-1"></div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">이전 활동</div>
                                                <div className="h-px bg-gray-300 flex-1"></div>
                                            </div>
                                        </div>
                                    )}
                                    {renderFeedItem(item)}
                                </React.Fragment>
                            );
                        });
                    })()}
                  </>
              ) : (
                  <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-bold text-gray-500 mb-1">아직 등록된 활동이 없습니다.</p>
                      <p className="text-sm">친구를 팔로우하거나 챌린지에 참여해보세요.</p>
                  </div>
              )}

              {/* Loader Trigger for Infinite Scroll */}
              {hasMoreFeeds && (
                  <div ref={loadMoreRef} className="py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
                  </div>
              )}

              {/* End of Content Message - Show ONLY if we have items AND no more feeds to load */}
              {!hasMoreFeeds && feedItems.length > 0 && (
                  <div className="py-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-gray-400" />
                      </div>
                      모든 활동을 확인했습니다.
                  </div>
              )}
          </div>
      </section>
    </div>
  );
}
