
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, ChevronLeft, Layout, Trophy, Users, Calendar, Crown, Shield, Activity, TrendingUp, CheckCircle2 } from 'lucide-react';
import { searchGlobal, SearchResultItem } from '../services/dbService';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

const sortOptions = [
    { value: 'RELEVANCE', label: '관련도순' },
    { value: 'LATEST', label: '최신순' },
    { value: 'OLDEST', label: '오래된순' },
    { value: 'POPULAR', label: '인기순' },
    { value: 'ALPHABETICAL', label: '가나다순' }
];

const categories = ['전체', '건강관리', '어학', '자격증', '공부루틴', '커리어스킬', '생활루틴', '재정관리', '취미', '독서', '운동'];

export function PlanSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Core Search State
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    
    // Filters State
    const [type, setType] = useState<'ALL' | 'TRENDING' | 'HOF' | 'CHALLENGE' | 'MONTHLY'>('ALL');
    const [category, setCategory] = useState('전체');
    const [subFilter, setSubFilter] = useState('ALL'); // Dynamic based on Type
    const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
    const [progressRange, setProgressRange] = useState<'ALL' | '0-35' | '35-70' | '70-90' | '100'>('ALL');
    const [sort, setSort] = useState<'RELEVANCE' | 'LATEST' | 'OLDEST' | 'POPULAR' | 'ALPHABETICAL'>('RELEVANCE');

    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Infinite Scroll State
    const [visibleCount, setVisibleCount] = useState(12);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Debounce Search Trigger
    useEffect(() => {
        const timer = setTimeout(() => {
            executeSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword, type, category, subFilter, status, progressRange, sort]);

    // Handle initial load from URL param
    useEffect(() => {
        if(searchParams.get('q')) setKeyword(searchParams.get('q')!);
    }, []);

    // Reset pagination when results change
    useEffect(() => {
        setVisibleCount(12);
    }, [results]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < results.length) {
                    setVisibleCount((prev) => Math.min(prev + 8, results.length));
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [visibleCount, results.length]);

    const executeSearch = async () => {
        setLoading(true);
        try {
            const data = await searchGlobal({
                keyword,
                type,
                category,
                subFilter,
                status,
                progressRange,
                sort
            });
            setResults(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setKeyword('');
        setType('ALL');
        setCategory('전체');
        setSubFilter('ALL');
        setStatus('ALL');
        setProgressRange('ALL');
        setSort('RELEVANCE');
    };

    // Render Sub-Filters based on Type (FR-SEARCH-017 ~ 028)
    const renderSubFilters = () => {
        if (type === 'HOF') {
            return (
                <div className="flex gap-2 mb-4">
                    {['BEST', 'TRUST'].map(f => (
                        <button key={f} onClick={() => setSubFilter(f)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${subFilter === f ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                            {f === 'BEST' ? '베스트' : '신뢰도별'}
                        </button>
                    ))}
                </div>
            );
        }
        if (type === 'CHALLENGE') {
            return (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                    {['ALL', 'POPULAR', 'HOF', 'GROWTH', 'RETENTION'].map(f => (
                        <button key={f} onClick={() => setSubFilter(f)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border whitespace-nowrap ${subFilter === f ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                            {f === 'ALL' ? '전체' : f === 'POPULAR' ? '인기' : f === 'HOF' ? '명예의전당' : f === 'GROWTH' ? '성장률' : '유지율'}
                        </button>
                    ))}
                </div>
            );
        }
        if (type === 'MONTHLY') {
            return (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                    {['ALL', 'POPULAR', 'LATEST', 'PARTICIPANTS', 'ACTIVE'].map(f => (
                        <button key={f} onClick={() => setSubFilter(f)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border whitespace-nowrap ${subFilter === f ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                            {f === 'ALL' ? '전체' : f === 'POPULAR' ? '인기' : f === 'LATEST' ? '최신' : f === 'PARTICIPANTS' ? '참여자순' : '활성화순'}
                        </button>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in px-4 md:px-0">
            {/* Header Search Bar */}
            <div className="bg-white sticky top-14 z-20 pt-4 pb-2 mb-6">
                <div className="relative max-w-3xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-6 h-6" />
                    <input 
                        type="text"
                        placeholder="계획, 챌린지, 닉네임, 태그 검색..." 
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setSearchParams({ q: e.target.value });
                        }}
                        className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-primary-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-lg shadow-sm transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar Filters */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                    {/* Type Filter */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> 유형 선택</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'ALL', label: '전체 통합', icon: Layout },
                                { id: 'TRENDING', label: '인기 도전 (실시간)', icon: TrendingUp },
                                { id: 'HOF', label: '명예의 전당', icon: Crown },
                                { id: 'CHALLENGE', label: '함께 도전하기', icon: Users },
                                { id: 'MONTHLY', label: '이 달의 챌린지', icon: Calendar },
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setType(t.id as any); setSubFilter('ALL'); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        type === t.id 
                                        ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <t.icon className={`w-4 h-4 ${type === t.id ? 'text-primary-600' : 'text-gray-400'}`} />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm">카테고리</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                        category === cat 
                                        ? 'bg-gray-900 text-white border-gray-900' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm">진행 상태</h3>
                        <div className="space-y-2">
                            {['ALL', 'ACTIVE', 'COMPLETED'].map(s => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        checked={status === s} 
                                        onChange={() => setStatus(s as any)}
                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600">
                                        {s === 'ALL' ? '전체' : s === 'ACTIVE' ? '진행 중' : '완료됨'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Progress Filter */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-900 text-sm">완료율 구간</h3>
                            {type === 'MONTHLY' && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">기간 기준</span>}
                        </div>
                        <div className="space-y-2">
                            {[
                                { id: 'ALL', label: '전체' },
                                { id: '0-35', label: '0% - 35% (시작)' },
                                { id: '35-70', label: '35% - 70% (진행)' },
                                { id: '70-90', label: '70% - 90% (막바지)' },
                                { id: '100', label: '100% (완료)' },
                            ].map(r => (
                                <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="progress" 
                                        checked={progressRange === r.id} 
                                        onChange={() => setProgressRange(r.id as any)}
                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600">{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button variant="outline" fullWidth onClick={handleReset} className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> 필터 초기화
                    </Button>
                </div>

                {/* Main Results */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                검색 결과 <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg text-lg">{results.length}</span>
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                {keyword ? `"${keyword}"에 대한 검색 결과입니다.` : '전체 목록을 조회합니다.'}
                            </p>
                        </div>
                        <select 
                            value={sort} 
                            onChange={(e) => setSort(e.target.value as any)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                        >
                            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {renderSubFilters()}

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">데이터를 탐색 중입니다...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.slice(0, visibleCount).map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-primary-200 transition-all group cursor-pointer" onClick={() => {
                                        if(item.type === 'PLAN') navigate(`/plan/${item.id}`);
                                        if(item.type === 'CHALLENGE') navigate(`/challenges/${item.id}`);
                                        if(item.type === 'MONTHLY') navigate(`/miscellaneous/${item.id}`);
                                        if(item.type === 'HOF') navigate(`/hall-of-fame`); 
                                    }}>
                                        <div className="flex items-start gap-4">
                                            {/* Thumbnail / Icon */}
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Layout className="w-8 h-8" />
                                                    </div>
                                                )}
                                                <div className="absolute top-0 left-0 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
                                                    {item.type === 'HOF' ? '명예' : item.type === 'PLAN' ? '계획' : item.type === 'CHALLENGE' ? '도전' : '월간'}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-gray-900 text-base truncate pr-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                                                    {item.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.description}</p>
                                                
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Avatar src={item.avatarUrl} size="xs" />
                                                    <span className="text-xs font-bold text-gray-700">{item.authorName || '익명'}</span>
                                                    {item.category && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{item.category}</span>
                                                    )}
                                                </div>

                                                {/* Metrics & Progress */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                    <div className="flex gap-3 text-xs text-gray-500">
                                                        {item.metrics?.slice(0, 2).map((m, i) => (
                                                            <span key={i} className="flex items-center gap-1">
                                                                <span className="text-gray-400">{m.label}</span>
                                                                <span className="font-bold text-gray-700">{m.value}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2 w-24">
                                                        <ProgressBar progress={item.progress || 0} className="h-1.5" />
                                                        <span className="text-[10px] font-bold text-primary-600">{item.progress}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Infinite Scroll Loader / Sentinel */}
                            {visibleCount < results.length && (
                                <div ref={loadMoreRef} className="py-8 text-center w-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">조건에 맞는 결과가 없습니다.</p>
                            <p className="text-sm text-gray-400 mt-1">검색어나 필터를 변경해보세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
