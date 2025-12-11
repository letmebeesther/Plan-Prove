import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, ArrowRight, CheckCircle2, Megaphone, Star, Gift, Heart, MessageCircle, Share2, MoreHorizontal, Smile, Trophy, Check, Hash, Flame, Plus, Crown, Medal, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Plan, Challenge, Certification } from '../types';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyActivePlans, fetchChallenges, fetchHallOfFame, fetchPopularFeeds, fetchFriendActivities } from '../services/dbService';

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
  const [bestHallOfFame, setBestHallOfFame] = useState<any[]>([]);
  const [popularFeeds, setPopularFeeds] = useState<any[]>([]);
  const [friendActivities, setFriendActivities] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setChallenges(fetchedChallenges.slice(0, 4)); // Show top 4
        
        const fame = await fetchHallOfFame('BEST');
        setBestHallOfFame(fame.slice(0, 3)); // Show top 3

        const feeds = await fetchPopularFeeds();
        setPopularFeeds(feeds); // Top 5

        const friends = await fetchFriendActivities();
        setFriendActivities(friends); // Recent Friend Activities
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

      {/* 5.5 Popular Challenges Top 5 - FR-053 ~ FR-057 */}
      <section>
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Flame className="w-6 h-6 text-red-500" fill="currentColor" />
                인기 도전 Top 5
            </h2>
            <button onClick={() => navigate('/trending')} className="text-sm text-gray-500 hover:text-gray-900 font-medium">더 보기</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {popularFeeds.length > 0 ? popularFeeds.map((feed, idx) => (
                <div 
                    key={feed.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer group flex flex-col" 
                    onClick={() => feed.planId ? navigate(`/plan/${feed.planId}`) : navigate('/trending')}
                >
                    <div className="relative h-32 bg-gray-100 overflow-hidden">
                        <img src={feed.imageUrl} alt="cert" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 left-2 bg-black/50 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold backdrop-blur-sm">
                            {idx + 1}
                        </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                        <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{feed.relatedGoalTitle}</h4>
                        <div className="flex items-center gap-2 mb-2">
                            <Avatar src={feed.user.avatarUrl} size="sm" />
                            <span className="text-xs text-gray-500 truncate">{feed.user.nickname}</span>
                        </div>
                        <div className="mt-auto flex items-center gap-3 text-xs text-gray-400 border-t border-gray-50 pt-2">
                            <span className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart className="w-3 h-3" /> {feed.likes}</span>
                            <span className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle className="w-3 h-3" /> {feed.comments}</span>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    인기 도전이 없습니다.
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
                    함께 도전하기
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

      {/* Friends Feed (Real Data) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_0_rgba(0,0,0,0.06)] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-500" />
                친구들의 활동
            </h2>
            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">실시간 업데이트</span>
          </div>
          
          <div className="space-y-4">
              {friendActivities.length > 0 ? friendActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-100 group" onClick={() => activity.planId && navigate(`/plan/${activity.planId}`)}>
                      <Avatar src={activity.user.avatarUrl} size="md" />
                      <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 text-sm">{activity.user.nickname}</span>
                                  <span className="text-xs text-gray-400">• {formatTimeAgo(activity.createdAt)}</span>
                              </div>
                              {activity.imageUrl && (
                                  <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded font-bold group-hover:bg-indigo-100 transition-colors">
                                      📸 인증샷
                                  </span>
                              )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                              <span className="font-bold text-gray-800">"{activity.relatedGoalTitle}"</span> 목표를 인증했습니다.
                          </p>
                          <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-500 italic border border-gray-100">
                              "{activity.description}"
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3">
                              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                                  <Heart className="w-3.5 h-3.5" /> 좋아요 {activity.likes}
                              </button>
                              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors">
                                  <MessageCircle className="w-3.5 h-3.5" /> 댓글 {activity.comments}
                              </button>
                          </div>
                      </div>
                      {activity.imageUrl && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                              <img src={activity.imageUrl} alt="activity" className="w-full h-full object-cover" />
                          </div>
                      )}
                  </div>
              )) : (
                  <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                      <Users className="w-8 h-8 mb-2 opacity-20" />
                      <p>아직 친구들의 소식이 없습니다.</p>
                      <p className="text-xs mt-1">설정 &gt; 초기 데이터 생성을 통해 샘플 데이터를 추가해보세요.</p>
                  </div>
              )}
          </div>
      </section>
    </div>
  );
}