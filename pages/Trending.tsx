
import React, { useState } from 'react';
import { Flame, Filter, Clock, Eye, Heart, MessageCircle, Bookmark, Shield, TrendingUp, Users, Activity, Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/common/Button';

type TabType = 'BASIC' | 'CATEGORY' | 'CHALLENGE';

// Mock Data for Basic Trending (FR-166 ~ FR-174)
const basicTrendingPosts = [
  {
    id: 1,
    title: '미라클 모닝 100일차 후기: 인생이 바뀌었다',
    author: { nickname: '새벽형인간', trustScore: 98, avatar: 'https://picsum.photos/200/200?random=10' },
    thumbnail: 'https://picsum.photos/600/400?random=10',
    views: 15420,
    likes: 1240,
    comments: 342,
    scraps: 560,
    totalScore: 98.5,
    createdAt: '2023-10-25 08:00',
    rank: 1
  },
  {
    id: 2,
    title: '개발자 포트폴리오 준비 꿀팁 공유',
    author: { nickname: 'DevMaster', trustScore: 92, avatar: 'https://picsum.photos/200/200?random=11' },
    thumbnail: 'https://picsum.photos/600/400?random=11',
    views: 8900,
    likes: 850,
    comments: 120,
    scraps: 900,
    totalScore: 95.2,
    createdAt: '2023-10-25 10:30',
    rank: 2
  },
  {
    id: 3,
    title: '한 달 식비 30만원으로 살기 도전 인증',
    author: { nickname: '알뜰살뜰', trustScore: 88, avatar: 'https://picsum.photos/200/200?random=12' },
    thumbnail: 'https://picsum.photos/600/400?random=12',
    views: 12300,
    likes: 2100,
    comments: 450,
    scraps: 300,
    totalScore: 94.8,
    createdAt: '2023-10-25 09:15',
    rank: 3
  }
];

// Mock Data for Category Trending (FR-175 ~ FR-182)
const categoryTrendingPosts = [
  {
    id: 1,
    category: '운동',
    title: '헬스장 처음 가는 분들을 위한 루틴 추천',
    views: 5400,
    interactionScore: 95,
    categoryFitScore: 99,
    createdAt: '2시간 전',
    thumbnail: 'https://picsum.photos/600/400?random=20'
  },
  {
    id: 2,
    category: '운동',
    title: '러닝 크루 모집합니다 (서울 지역)',
    views: 3200,
    interactionScore: 88,
    categoryFitScore: 92,
    createdAt: '5시간 전',
    thumbnail: 'https://picsum.photos/600/400?random=21'
  },
  {
    id: 3,
    category: '운동',
    title: '홈트레이닝 필수 장비 BEST 5',
    views: 8900,
    interactionScore: 92,
    categoryFitScore: 85,
    createdAt: '1일 전',
    thumbnail: 'https://picsum.photos/600/400?random=22'
  }
];

// Mock Data for Trending Challenges (FR-183 ~ FR-192)
const trendingChallenges = [
  {
    id: 1,
    title: '🔥 빡공단 12기: 매일 3시간 공부',
    statusMsg: '지금 가장 뜨거운 스터디 그룹!',
    image: 'https://picsum.photos/400/200?random=30',
    participants: 3420,
    liveHotScore: 9850,
    verifyFreq: '매우 높음',
    newInflow: '+15%',
    chatActivity: 95,
    reactions: 12050,
    growthRate: 24,
    tags: ['공부루틴', 'LIVE']
  },
  {
    id: 2,
    title: '🏃‍♂️ 매일 10km 달리기 인증',
    statusMsg: '함께 달리면 멀리 갈 수 있습니다.',
    image: 'https://picsum.photos/400/200?random=31',
    participants: 1200,
    liveHotScore: 8500,
    verifyFreq: '높음',
    newInflow: '+8%',
    chatActivity: 82,
    reactions: 5600,
    growthRate: 12,
    tags: ['운동', 'HOT']
  },
  {
    id: 3,
    title: '🥗 설탕 없는 일주일',
    statusMsg: '건강한 식습관 만들기 프로젝트',
    image: 'https://picsum.photos/400/200?random=32',
    participants: 5600,
    liveHotScore: 7200,
    verifyFreq: '보통',
    newInflow: '+25%',
    chatActivity: 70,
    reactions: 3400,
    growthRate: 18,
    tags: ['건강관리', 'NEW']
  }
];

const categories = [
  '전체', '운동', '건강관리', '어학', '자격증', '공부루틴', 
  '커리어스킬', '생활루틴', '재정관리', '취미', '독서'
];

export function Trending() {
  const [activeTab, setActiveTab] = useState<TabType>('BASIC');
  const [selectedCategory, setSelectedCategory] = useState('운동');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Flame className="w-7 h-7 text-red-500 fill-red-500 animate-pulse" />
             실시간 인기
           </h1>
           <p className="text-gray-500 text-sm mt-1">지금 가장 핫한 계획과 도전을 만나보세요.</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            {[
                { id: 'BASIC', label: '인기글' },
                { id: 'CATEGORY', label: '카테고리별' },
                { id: 'CHALLENGE', label: '인기 도전' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* 1. Basic Trending (FR-166 ~ FR-174) */}
      {activeTab === 'BASIC' && (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700">
                <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4" /> 1시간마다 업데이트 (48시간 유지)
                </span>
                <span className="text-xs bg-white px-2 py-0.5 rounded border border-red-200">다음 업데이트: 15분 후</span>
            </div>

            <div className="grid gap-6">
                {basicTrendingPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col md:flex-row">
                        {/* Thumbnail */}
                        <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1.5 rounded-br-xl font-bold text-lg shadow-md z-10">
                                {post.rank}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-primary-600 font-bold bg-primary-50 px-2 py-1 rounded-lg text-sm flex-shrink-0">
                                        <TrendingUp className="w-4 h-4" /> {post.totalScore}점
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar src={post.author.avatar} size="sm" />
                                    <span className="text-sm font-medium text-gray-700">{post.author.nickname}</span>
                                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                                        <Shield className="w-3 h-3" /> 신뢰도 {post.author.trustScore}
                                    </div>
                                    <span className="text-xs text-gray-400">• {post.createdAt}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {post.views.toLocaleString()}</span>
                                    <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors"><Heart className="w-4 h-4" /> {post.likes.toLocaleString()}</button>
                                    <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"><MessageCircle className="w-4 h-4" /> {post.comments}</button>
                                </div>
                                <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                                    <Bookmark className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 2. Category Trending (FR-175 ~ FR-182) */}
      {activeTab === 'CATEGORY' && (
        <div className="animate-fade-in space-y-6">
            {/* Category Filter */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border ${
                            selectedCategory === cat 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                <span>최근 72시간 이내 게시글</span>
                <span>기준: 상호작용 + 적합성</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTrendingPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                        <div className="h-40 overflow-hidden relative">
                             <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded">
                                 {post.category}
                             </span>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12">{post.title}</h3>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <span>{post.views.toLocaleString()}회 조회</span>
                                <span>{post.createdAt}</span>
                            </div>
                            
                            <div className="space-y-2 pt-3 border-t border-gray-50">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">상호작용 점수</span>
                                    <span className="font-bold text-indigo-600">{post.interactionScore}점</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">카테고리 적합도</span>
                                    <span className="font-bold text-green-600">{post.categoryFitScore}점</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 3. Trending Challenges (FR-183 ~ FR-192) */}
      {activeTab === 'CHALLENGE' && (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-orange-800">
                <span className="flex items-center gap-1.5 font-bold">
                    <Zap className="w-4 h-4 text-orange-600 fill-orange-600" /> 실시간 LiveHotScore 랭킹
                </span>
                <span className="text-xs bg-white px-2 py-0.5 rounded border border-orange-200">15분마다 갱신</span>
            </div>

            <div className="grid gap-4">
                {trendingChallenges.map((challenge, idx) => (
                    <div key={challenge.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:border-orange-200 transition-all flex flex-col md:flex-row gap-6">
                         {/* Image & Rank */}
                        <div className="w-full md:w-48 h-32 relative rounded-xl overflow-hidden flex-shrink-0">
                            <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold shadow-lg border border-white/20">
                                {idx + 1}
                            </div>
                            {challenge.tags.map((tag, i) => (
                                <span key={i} className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{challenge.title}</h3>
                                    <p className="text-sm text-gray-500">{challenge.statusMsg}</p>
                                </div>
                                <div className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 shadow-sm whitespace-nowrap">
                                    <Flame className="w-4 h-4 fill-current" />
                                    {challenge.liveHotScore.toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                                <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-400">참여자</div>
                                    <div className="font-bold text-gray-800 text-sm">{challenge.participants.toLocaleString()}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-400">인증 빈도(2h)</div>
                                    <div className="font-bold text-blue-600 text-sm">{challenge.verifyFreq}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-400">신규 유입</div>
                                    <div className="font-bold text-green-600 text-sm">{challenge.newInflow}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-gray-400">채팅 활성도</div>
                                    <div className="font-bold text-gray-800 text-sm">{challenge.chatActivity}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {challenge.reactions.toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 성장률 +{challenge.growthRate}%</span>
                                </div>
                                <Button size="sm" className="bg-gray-900 hover:bg-black text-white px-6">
                                    참여하기
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
