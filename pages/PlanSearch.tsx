
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, ChevronLeft } from 'lucide-react';
import { Plan } from '../types';
import { searchPublicPlans } from '../services/dbService';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

const categories = ['전체', '건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서', '운동'];
const sortOptions = [
    { value: 'LATEST', label: '최신순' },
    { value: 'POPULAR', label: '인기순 (좋아요)' },
    { value: 'ACHIEVEMENT', label: '높은 달성률순' }
];
const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'ACTIVE', label: '진행 중' },
    { value: 'COMPLETED', label: '완료됨' }
];

export function PlanSearch() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Filter States
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState('전체');
    const [sort, setSort] = useState<'LATEST' | 'POPULAR' | 'ACHIEVEMENT'>('LATEST');
    const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

    const [results, setResults] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Initial Search on Load
    useEffect(() => {
        handleSearch();
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        
        try {
            const data = await searchPublicPlans({
                keyword: keyword.trim(),
                category: category === '전체' ? undefined : category,
                sort,
                status
            });
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setKeyword('');
        setCategory('전체');
        setSort('LATEST');
        setStatus('ALL');
        handleSearch(); // Trigger reset search
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-900 cursor-pointer w-fit" onClick={() => navigate('/plans')}>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-bold">게시판으로 돌아가기</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Filter className="w-5 h-5" /> 검색 필터
                            </h2>
                            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> 초기화
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">검색어</label>
                                <Input 
                                    placeholder="제목, 내용, 태그 검색" 
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    icon={<Search className="w-4 h-4" />}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">카테고리</label>
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">진행 상태</label>
                                <div className="flex gap-2">
                                    {statusOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setStatus(opt.value as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                                                status === opt.value
                                                ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">정렬 순서</label>
                                <select 
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as any)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>

                            <Button type="submit" fullWidth className="py-3 shadow-md">
                                {loading ? '검색 중...' : '검색 결과 보기'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 min-w-0">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">
                            검색 결과 <span className="text-primary-600">{results.length}</span>건
                        </h1>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {results.length > 0 ? results.map(plan => (
                                <div 
                                    key={plan.id}
                                    onClick={() => navigate(`/plan/${plan.id}`)}
                                    className="bg-white rounded-xl border border-gray-100 p-5 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                                                    {plan.category}
                                                </span>
                                                {plan.tags?.map(tag => (
                                                    <span key={tag} className="text-xs text-blue-500">#{tag}</span>
                                                ))}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                                {plan.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                {plan.description}
                                            </p>
                                            
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span>{plan.startDate} ~ {plan.endDate}</span>
                                                <span>•</span>
                                                <span>좋아요 {plan.likes || 0}</span>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-48 flex-shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Avatar src={plan.author.avatarUrl} size="xs" />
                                                <span className="text-xs font-bold text-gray-700 truncate">{plan.author.nickname}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                                    <span>진행률</span>
                                                    <span className="text-primary-600">{plan.progress}%</span>
                                                </div>
                                                <ProgressBar progress={plan.progress} className="h-1.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">검색 결과가 없습니다.</p>
                                    <p className="text-sm text-gray-400">다른 키워드나 필터로 다시 검색해보세요.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
