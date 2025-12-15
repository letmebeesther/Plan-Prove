
import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, TrendingUp, Clock, Shield, Target, Activity, Flame } from 'lucide-react';
import { Challenge } from '../types';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { fetchChallenges } from '../services/dbService';

const categories = ['전체', '운동', '건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서'];

type SortOption = 'POPULAR' | 'NEW' | 'GROWTH' | 'RETENTION' | 'ACHIEVEMENT' | 'TRUST';

export function Challenges() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('POPULAR');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const loadData = async () => {
          setLoading(true);
          try {
              const data = await fetchChallenges();
              setChallenges(data);
          } catch (e) {
              console.error("Failed to load challenges", e);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, []);

  const filteredChallenges = challenges.filter(c => {
    if (selectedCategory !== '전체' && c.category !== selectedCategory) return false;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(query) || (c.tags && c.tags.some(t => t.toLowerCase().includes(query)));
    }
    return true;
  }).sort((a, b) => {
      switch (sortBy) {
          case 'POPULAR': // FR-GROUP-001
              return b.participantCount - a.participantCount;
          case 'NEW':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'GROWTH': // FR-GROUP-002
              return (b.growthRate || 0) - (a.growthRate || 0);
          case 'RETENTION': // FR-GROUP-003
              return (b.retentionRate || 0) - (a.retentionRate || 0);
          case 'ACHIEVEMENT': // FR-GROUP-004
              return (b.avgAchievement || 0) - (a.avgAchievement || 0);
          case 'TRUST': // FR-GROUP-005
              return (b.avgTrustScore || 0) - (a.avgTrustScore || 0);
          default:
              return 0;
      }
  });

  const sortButtons: { id: SortOption; label: string; icon: React.ElementType }[] = [
      { id: 'POPULAR', label: '인기순', icon: Flame },
      { id: 'NEW', label: '최신순', icon: Clock },
      { id: 'GROWTH', label: '성장률순', icon: TrendingUp },
      { id: 'RETENTION', label: '유지율순', icon: Activity },
      { id: 'ACHIEVEMENT', label: '달성률순', icon: Target },
      { id: 'TRUST', label: '신뢰도순', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">함께 도전하기</h1>
                <p className="text-gray-500 text-sm mt-1">혼자가 힘들다면, 동료들과 함께 멀리 가보세요.</p>
            </div>
            <Button onClick={() => navigate('/new-challenge')} className="flex items-center gap-2 shadow-lg shadow-primary-500/20">
                <Plus className="w-5 h-5" /> 도전방 만들기
            </Button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text"
                    placeholder="해시태그나 제목으로 도전 검색 (#미라클모닝)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === cat 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Sorting Options Scrollable */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 pt-4">
                {sortButtons.map((btn) => (
                    <button 
                        key={btn.id}
                        onClick={() => setSortBy(btn.id)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 border transition-all whitespace-nowrap ${
                            sortBy === btn.id 
                            ? 'bg-primary-50 text-primary-600 border-primary-200 ring-1 ring-primary-100' 
                            : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'
                        }`}
                    >
                        <btn.icon className="w-3.5 h-3.5" /> {btn.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Challenge Grid */}
        {loading ? (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-gray-500">도전 목록을 불러오는 중...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredChallenges.length > 0 ? filteredChallenges.map((challenge) => (
                    <div 
                        key={challenge.id} 
                        onClick={() => navigate(`/challenges/${challenge.id}`)}
                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                        <div className="h-40 overflow-hidden relative flex-shrink-0">
                            <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-xs font-bold">
                                {challenge.category}
                            </div>
                            {challenge.tags && challenge.tags.length > 0 && (
                                <div className="absolute bottom-3 left-3 flex gap-1">
                                    {challenge.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-1.5 py-0.5 bg-white/90 backdrop-blur-md rounded text-[10px] font-bold text-gray-800">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{challenge.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{challenge.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                    <Users className="w-4 h-4" />
                                    <span className="font-semibold">{challenge.participantCount.toLocaleString()}명</span>
                                </div>
                                
                                {/* Dynamic Badge based on active sort */}
                                {sortBy === 'GROWTH' && challenge.growthRate > 0 && (
                                    <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> +{challenge.growthRate}%
                                    </div>
                                )}
                                {sortBy === 'RETENTION' && (
                                    <div className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> 유지 {challenge.retentionRate}%
                                    </div>
                                )}
                                {sortBy === 'ACHIEVEMENT' && (
                                    <div className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Target className="w-3 h-3" /> 달성 {challenge.avgAchievement}%
                                    </div>
                                )}
                                {sortBy === 'TRUST' && (
                                    <div className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> 신뢰 {challenge.avgTrustScore}
                                    </div>
                                )}
                                {(sortBy === 'POPULAR' || sortBy === 'NEW') && challenge.growthRate > 0 && (
                                     <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                                        +{challenge.growthRate}% 성장
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        조건에 맞는 도전이 없습니다. 새로운 도전을 만들어보세요!
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
