
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, ArrowRight, CheckCircle2, Megaphone, Star, Gift, Heart, MessageCircle, Share2, MoreHorizontal, Smile, Trophy, Check, Hash, Flame, Plus, Crown, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Plan, Challenge } from '../types';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyActivePlans, fetchChallenges, fetchHallOfFame } from '../services/dbService';

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

const trendingKeywords = [
  { id: 1, text: '미라클모닝', volume: '15.2k' },
  { id: 2, text: 'OOTD', volume: '12k' },
  { id: 3, text: '공부인증', volume: '8.5k' },
  { id: 4, text: '무지출챌린지', volume: '10k' },
  { id: 5, text: '러닝크루', volume: '5k' },
  { id: 6, text: '건강식단', volume: '3.2k' },
];

export function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Real Data State
  const [activePlans, setActivePlans] = useState<Plan[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [bestHallOfFame, setBestHallOfFame] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock Feed State (for Infinite Scroll)
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (currentUser) {
        try {
          const plans = await fetchMyActivePlans(currentUser.id);
          setActivePlans(plans);
        } catch (e) { console.error(e); }
      }
      try {
        const fetchedChallenges = await fetchChallenges();
        setChallenges(fetchedChallenges.slice(0, 4)); // Show top 4
        
        const fame = await fetchHallOfFame('BEST');
        setBestHallOfFame(fame);
      } catch (e) { console.error(e); }
      setLoading(false);
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

  // Infinite Scroll Handler (Mock)
  const handleScroll = () => {
    if (!feedContainerRef.current || isLoadingFeed || !hasMoreFeed) return;
    const { scrollTop, scrollHeight, clientHeight } = feedContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreItems();
    }
  };

  const loadMoreItems = () => {
    setIsLoadingFeed(true);
    setTimeout(() => {
      if (feedItems.length >= 10) {
        setHasMoreFeed(false);
        setIsLoadingFeed(false);
        return;
      }
      // Add mock items...
      setIsLoadingFeed(false);
    }, 1000);
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      
      {/* 1. Dashboard Banner Carousel */}
      <section className="relative w-full h-48 sm:h-64 rounded-3xl overflow-hidden shadow-lg group">
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

      {/* 3. Real-time Popular Hashtags */}
      <section className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar items-center">
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
              인기 급상승
          </div>
          {trendingKeywords.map(tag => (
              <button key={tag.id} className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm whitespace-nowrap flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-900">{tag.text}</span>
                  <span className="text-xs text-gray-400 ml-0.5 bg-gray-100 px-1.5 py-0.5 rounded-md">{tag.volume}</span>
              </button>
          ))}
      </section>

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
             <div className="text-center py-10 text-gray-400">로딩 중...</div>
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
                <div key={item.id} className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative z-10">
                    <div className="relative">
                        <Avatar src={item.avatarUrl} size="lg" border />
                        <div className="absolute -top-3 -left-3 rotate-[-12deg] drop-shadow-sm">
                        <Crown className="w-8 h-8 text-yellow-500 fill-current" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">
                            {item.rank}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0 z-10">
                    <span className="text-[10px] font-bold text-gray-500 bg-white/60 px-1.5 py-0.5 rounded backdrop-blur-sm">{item.category}</span>
                    <h3 className="font-bold text-gray-900 text-md truncate leading-tight mt-1 mb-1">
                    {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">by {item.authorName}</p>
                        <p className="text-indigo-600 font-bold text-sm flex items-center gap-0.5">
                            <Medal className="w-3.5 h-3.5" /> {item.score}점
                        </p>
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

      {/* 6. Recommended Challenges */}
      <section>
        <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-orange-500" />
                    회원님을 위한 추천
                </h2>
                <p className="text-sm text-gray-500 mt-1"><strong className="text-gray-800">건강 & 코딩</strong> 관심사를 기반으로 추천해드려요.</p>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-900 font-medium">더 보기</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {challenges.length > 0 ? challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col group cursor-pointer">
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

      {/* Friends Feed (Placeholder for future DB integration) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_0_rgba(0,0,0,0.06)] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-500" />
                친구들의 활동
            </h2>
            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">실시간 업데이트</span>
          </div>
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              친구들의 소식이 여기에 표시됩니다.
          </div>
      </section>
    </div>
  );
}
