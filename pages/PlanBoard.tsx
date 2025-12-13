
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Search, Filter, Calendar, Heart } from 'lucide-react';
import { fetchPublicPlans } from '../services/dbService';
import { Plan } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/common/Button';

const categories = ['전체', '건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서', '운동'];

export function PlanBoard() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadPlans = async () => {
            setLoading(true);
            try {
                const fetchedPlans = await fetchPublicPlans(selectedCategory);
                setPlans(fetchedPlans);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, [selectedCategory]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/plans/search?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in space-y-8">
            {/* Hero & Search Section */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <LayoutTemplate className="w-64 h-64 text-white" />
                </div>
                
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
                        <LayoutTemplate className="w-8 h-8" />
                        공개 목표 게시판
                    </h1>
                    <p className="text-blue-100 mb-8 text-lg">
                        다른 탐험가들은 어떤 목표를 세웠을까요?<br/>
                        영감을 얻고, 함께 성장할 동료를 찾아보세요.
                    </p>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="관심 있는 키워드나 목표를 검색해보세요..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white/95 backdrop-blur shadow-lg focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all"
                            />
                        </div>
                        <Button 
                            type="button" 
                            onClick={() => navigate('/plans/search')}
                            className="bg-blue-500 hover:bg-blue-600 border-none text-white px-6 rounded-xl font-bold shadow-lg flex items-center gap-2 whitespace-nowrap"
                        >
                            <Filter className="w-5 h-5" /> 상세 검색
                        </Button>
                    </form>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                            selectedCategory === cat 
                            ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Plan Grid */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">목표를 불러오는 중입니다...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => {
                        return (
                            <div 
                                key={plan.id}
                                onClick={() => navigate(`/plan/${plan.id}`)}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">
                                            {plan.category}
                                        </span>
                                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                            {plan.daysLeft !== undefined && plan.daysLeft >= 0 ? `D-${plan.daysLeft}` : '종료'}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {plan.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                                        {plan.description}
                                    </p>

                                    {/* Progress Section */}
                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                                            <span>달성률</span>
                                            <span className="text-primary-600">{plan.progress || 0}%</span>
                                        </div>
                                        {/* Use specific height and handle potential missing progress */}
                                        <ProgressBar progress={plan.progress || 0} className="h-2" />
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar src={plan.author.avatarUrl} size="sm" />
                                        <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{plan.author.nickname}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5" /> {plan.likes || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" /> {plan.startDate.slice(5)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && plans.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium mb-2">등록된 공개 목표가 없습니다.</p>
                    <button onClick={() => navigate('/new-plan')} className="text-primary-600 font-bold hover:underline">
                        첫 번째 목표를 등록해보세요!
                    </button>
                </div>
            )}
        </div>
    );
}
