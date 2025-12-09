import React, { useState } from 'react';
import { Users, Filter, Search, Plus, TrendingUp, Clock, Hash } from 'lucide-react';
import { Challenge } from '../types';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

// Mock Data
const mockChallenges: Challenge[] = [
    {
        id: 'c1',
        title: '미라클 모닝 5AM',
        description: '매일 아침 5시에 기상하고 타임스탬프 앱으로 인증하세요.',
        statusMessage: '일찍 일어나는 새가 벌레를 잡는다',
        imageUrl: 'https://picsum.photos/400/200?random=10',
        category: '생활루틴',
        tags: ['기상', '새벽'],
        isPublic: true,
        createdAt: '2023-09-01',
        host: { id: 'u1', nickname: 'Host1', avatarUrl: '', trustScore: 90 },
        coHosts: [],
        participantCount: 1240,
        growthRate: 15,
        avgAchievement: 85,
        retentionRate: 90,
        avgTrustScore: 88,
        stabilityIndex: 95
    },
    {
        id: 'c2',
        title: '매일 독서 30분',
        description: '하루 30분 책을 읽고 인상 깊은 구절을 공유하세요.',
        statusMessage: '책 속에 길이 있다',
        imageUrl: 'https://picsum.photos/400/200?random=11',
        category: '독서',
        tags: ['책', '마음의양식'],
        isPublic: true,
        createdAt: '2023-09-10',
        host: { id: 'u2', nickname: 'BookWorm', avatarUrl: '', trustScore: 95 },
        coHosts: [],
        participantCount: 850,
        growthRate: 8,
        avgAchievement: 92,
        retentionRate: 85,
        avgTrustScore: 90,
        stabilityIndex: 88
    },
    {
        id: 'c3',
        title: '설탕 끊기 챌린지',
        description: '2주 동안 가공식품과 설탕을 멀리하는 식단 챌린지.',
        statusMessage: '건강한 몸에 건강한 정신',
        imageUrl: 'https://picsum.photos/400/200?random=12',
        category: '건강관리',
        tags: ['다이어트', '건강'],
        isPublic: true,
        createdAt: '2023-10-01',
        host: { id: 'u3', nickname: 'Healthy', avatarUrl: '', trustScore: 88 },
        coHosts: [],
        participantCount: 2300,
        growthRate: 25,
        avgAchievement: 78,
        retentionRate: 80,
        avgTrustScore: 85,
        stabilityIndex: 82
    },
    {
        id: 'c4',
        title: '매일 1만보 걷기',
        description: '하루 1만보를 걷고 만보기 화면을 캡처해서 인증하세요.',
        statusMessage: '걷는 것이 곧 사는 것이다',
        imageUrl: 'https://picsum.photos/400/200?random=13',
        category: '운동',
        tags: ['걷기', '유산소'],
        isPublic: true,
        createdAt: '2023-10-05',
        host: { id: 'u4', nickname: 'Walker', avatarUrl: '', trustScore: 92 },
        coHosts: [],
        participantCount: 5000,
        growthRate: 10,
        avgAchievement: 80,
        retentionRate: 92,
        avgTrustScore: 89,
        stabilityIndex: 94
    }
];

const categories = ['전체', '운동', '건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서'];

export function Challenges() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'POPULAR' | 'NEW'>('POPULAR');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChallenges = mockChallenges.filter(c => {
    if (selectedCategory !== '전체' && c.category !== selectedCategory) return false;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(query) || c.tags.some(t => t.toLowerCase().includes(query));
    }
    return true;
  }).sort((a, b) => {
      if (activeTab === 'POPULAR') return b.participantCount - a.participantCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
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
            
             <div className="flex gap-4 border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab('POPULAR')}
                    className={`pb-2 text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors ${activeTab === 'POPULAR' ? 'text-primary-600 border-primary-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                >
                    <TrendingUp className="w-4 h-4" /> 인기순
                </button>
                <button 
                    onClick={() => setActiveTab('NEW')}
                    className={`pb-2 text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors ${activeTab === 'NEW' ? 'text-primary-600 border-primary-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                >
                    <Clock className="w-4 h-4" /> 최신순
                </button>
            </div>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChallenges.map((challenge) => (
                <div 
                    key={challenge.id} 
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                    <div className="h-40 overflow-hidden relative">
                        <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-xs font-bold">
                            {challenge.category}
                        </div>
                        {challenge.tags.length > 0 && (
                            <div className="absolute bottom-3 left-3 flex gap-1">
                                {challenge.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-white/90 backdrop-blur-md rounded text-[10px] font-bold text-gray-800">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{challenge.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{challenge.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold">{challenge.participantCount.toLocaleString()}명</span>
                            </div>
                            <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                                +{challenge.growthRate}% 성장
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}