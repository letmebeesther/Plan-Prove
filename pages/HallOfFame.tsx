
import React, { useState } from 'react';
import { Trophy, CheckCircle2, Shield, Crown, Medal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useNavigate } from 'react-router-dom';

type TabType = 'BEST' | 'CATEGORY' | 'TRUST';
type TimeFilter = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

// Mock Data for Best Plans (FR-179 ~ FR-185, FR-HOF-001 Varied Progress)
const bestPlans = [
  {
    id: 1,
    rank: 1,
    title: '30일 동안 파이썬 마스터하기',
    author: '코딩왕',
    totalScore: 98,
    achievementRate: 95, // Not 100%
    goalScore: 95,
    trustScore: 99,
    date: '2023.10.20',
    category: '커리어스킬',
    planId: null 
  },
  {
    id: 2,
    rank: 2,
    title: '매일 아침 5km 러닝',
    author: '런닝맨',
    totalScore: 96,
    achievementRate: 92, // Not 100%
    goalScore: 92,
    trustScore: 95,
    date: '2023.10.21',
    category: '운동',
    planId: null
  },
  {
    id: 3,
    rank: 3,
    title: '토익 900점 달성',
    author: '영어공부',
    totalScore: 94,
    achievementRate: 100,
    goalScore: 90,
    trustScore: 93,
    date: '2023.10.22',
    category: '어학',
    planId: null
  }
];

// Mock Data for Trust Score Users (FR-202 ~ FR-209)
const trustUsers = [
  {
    id: 1,
    rank: 1,
    nickname: '성실함의아이콘',
    avatar: 'https://picsum.photos/200/200?random=50',
    trustScore: 99,
    diligence: 98,
    contribution: 95,
    repPlan: '1년 동안 매일 일기 쓰기'
  },
  {
    id: 2,
    rank: 2,
    nickname: '계획대로',
    avatar: 'https://picsum.photos/200/200?random=51',
    trustScore: 97,
    diligence: 96,
    contribution: 92,
    repPlan: '자격증 5개 취득하기'
  }
];

const categories = [
  '운동', '건강관리', '어학', '자격증', '공부루틴', 
  '커리어스킬', '생활루틴', '재정관리', '취미', '독서'
];

export function HallOfFame() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('BEST');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('WEEKLY');
  const [selectedCategory, setSelectedCategory] = useState('운동');

  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
    return <span className="text-xl font-bold text-gray-400">{rank}</span>;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            명예의 전당
          </h1>
          <p className="text-slate-300">최고의 성과를 이룬 탐험가들의 영광스러운 기록</p>
        </div>
      </div>

      {/* Tabs (FR-177, FR-178, Modified) */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {[
          { id: 'BEST', label: '베스트', icon: Crown },
          { id: 'CATEGORY', label: '카테고리별', icon: CheckCircle2 },
          { id: 'TRUST', label: '신뢰도별', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {/* 1. Best Hall of Fame (FR-179 ~ FR-185) */}
        {activeTab === 'BEST' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" /> 종합 베스트
              </h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setTimeFilter('WEEKLY')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${timeFilter === 'WEEKLY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                >
                  주간
                </button>
                <button
                  onClick={() => setTimeFilter('MONTHLY')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${timeFilter === 'MONTHLY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                >
                  월간
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {bestPlans.map((plan) => (
                <div 
                    key={plan.id} 
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center cursor-pointer"
                    onClick={() => {
                        // In a real app, 'plan' here would come from DB and have a planId
                        // For static mock data, we just stay here unless updated.
                        if (plan.planId) navigate(`/plan/${plan.planId}`);
                    }}
                >
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                    {renderRankBadge(plan.rank)}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded w-fit mx-auto md:mx-0">{plan.category}</span>
                      <h3 className="text-lg font-bold text-gray-900">{plan.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">by {plan.author} • 선정일: {plan.date}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">총점</div>
                        <div className="text-xl font-bold text-indigo-600">{plan.totalScore}점</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">달성률</div>
                        <div className="text-lg font-bold text-gray-800">{plan.achievementRate}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">목표 점수</div>
                        <div className="text-lg font-bold text-gray-800">{plan.goalScore}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">작성자 신뢰도</div>
                        <div className="text-lg font-bold text-gray-800 flex items-center justify-center md:justify-start gap-1">
                          <Shield className="w-3 h-3 text-green-500" /> {plan.trustScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Category Hall of Fame (FR-196 ~ FR-201) */}
        {activeTab === 'CATEGORY' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
               <div className="flex gap-2">
                 {categories.map(cat => (
                   <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-lg text-gray-800">{selectedCategory} 분야 Top 20</h3>
                <span className="text-sm text-gray-500">기준: 주간</span>
            </div>

            <div className="grid gap-4">
              {[1, 2, 3].map((rank) => (
                <div key={rank} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-300 w-8 text-center">{rank}</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{selectedCategory} 마스터 플랜 {rank}</h4>
                      <p className="text-xs text-gray-500 mt-1">계획 성취도 9{5-rank}% • 적합도 98점</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs text-gray-500 mb-0.5">증거물 신빙성</div>
                     <div className="font-bold text-primary-600">9{9-rank}점</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Trust Score Hall of Fame (FR-202 ~ FR-209) */}
        {activeTab === 'TRUST' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" /> 신뢰도 랭킹
              </h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button className="px-3 py-1 text-sm font-bold bg-white rounded shadow-sm text-gray-900">주간 Top 50</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trustUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4 hover:border-green-200 transition-colors cursor-pointer group">
                  <div className="relative">
                    <Avatar src={user.avatar} size="lg" />
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                      {user.rank}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">{user.nickname}</h3>
                       <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">
                         <Shield className="w-4 h-4" /> {user.trustScore}
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">성실성 지수</span>
                         <span className="font-medium">{user.diligence}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">커뮤니티 기여도</span>
                         <span className="font-medium">{user.contribution}</span>
                       </div>
                       <div className="mt-3 pt-3 border-t border-gray-50">
                         <p className="text-xs text-gray-400 mb-1">대표 계획</p>
                         <p className="text-sm font-medium text-gray-800 truncate">"{user.repPlan}"</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
           </div>
        )}
      </div>

      {/* Footer Info (FR-217) */}
      <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
        <h4 className="font-bold text-gray-700 mb-2">명예의 전당 선정 기준</h4>
        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
          명예의 전당은 달성률, 신뢰도, 커뮤니티 기여도 등 다양한 지표를 종합적으로 분석하여 공정하게 선정됩니다.
          매주 월요일 00시에 주간 랭킹이 업데이트되며, 매월 1일 월간 랭킹이 발표됩니다.
          선정된 사용자에게는 특별한 배지와 포인트 혜택이 주어집니다.
        </p>
      </div>
    </div>
  );
}
