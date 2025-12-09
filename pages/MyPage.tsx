
import React, { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { 
    ShieldCheck, Trophy, Target, Settings as SettingsIcon, Edit2, Calendar, 
    CheckCircle2, XCircle, TrendingUp, AlertTriangle, FileText, BarChart3, 
    Trash2, ExternalLink, UserPlus, UserMinus, Camera, MoreHorizontal, X, ArrowRight,
    Star
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Input } from '../components/common/Input';
import { Plan, User, TrustScoreHistory, PlanAnalysis, ScrapItem, Challenge, MonthlyChallenge } from '../types';

// --- Mock Data ---

const currentUser: User = {
    id: 'u1',
    nickname: '성장하는탐험가',
    email: 'explorer@planprove.com',
    avatarUrl: 'https://picsum.photos/200/200?random=999',
    trustScore: 92,
    statusMessage: '꾸준함이 답이다! 🏃‍♂️📚 매일 1%씩 성장하기.',
    followers: 142,
    following: 56,
    totalPlans: 12,
    completedGoals: 8
};

const activePlans: Plan[] = [
    {
        id: 'p1',
        title: '매일 아침 조깅 챌린지',
        description: '30일 동안 매일 아침 5km 달리기',
        category: '건강관리',
        progress: 65,
        startDate: '2023-10-01',
        endDate: '2023-10-31',
        subGoals: [],
        author: currentUser,
        growthRate: 15,
        lastCertifiedAt: '2023-10-25',
        daysLeft: 6
    },
    {
        id: 'p2',
        title: '스페인어 기초 정복',
        description: '2달 안에 필수 단어 1000개 암기하기',
        category: '어학',
        progress: 30,
        startDate: '2023-10-15',
        endDate: '2023-12-15',
        subGoals: [],
        author: currentUser,
        growthRate: 5,
        lastCertifiedAt: '2023-10-24',
        daysLeft: 51
    }
];

const pastPlans: Plan[] = [
    {
        id: 'pp1',
        title: '30일 독서 습관 만들기',
        description: '매일 30분 책 읽기',
        category: '독서',
        progress: 100,
        startDate: '2023-09-01',
        endDate: '2023-09-30',
        subGoals: [],
        author: currentUser,
        finalAchievementRate: 100,
        isSuccess: true,
        hasRetrospective: true
    },
    {
        id: 'pp2',
        title: '주 3회 수영하기',
        description: '체력 증진을 위한 수영',
        category: '운동',
        progress: 45,
        startDate: '2023-08-01',
        endDate: '2023-08-31',
        subGoals: [],
        author: currentUser,
        finalAchievementRate: 45,
        isSuccess: false,
        failureReason: '잦은 야근으로 인한 시간 부족',
        hasRetrospective: false
    }
];

const trustHistory: TrustScoreHistory[] = [
    { id: 't1', date: '2023.10.25', type: 'CERTIFICATION', change: 2, reason: '연속 7일 인증 달성 (AC)', balance: 92 },
    { id: 't2', date: '2023.10.24', type: 'EVALUATION', change: 1, reason: '상호 평가 우수 (UP)', balance: 90 },
    { id: 't3', date: '2023.10.20', type: 'FAILURE', change: -3, reason: '목표 미달성 (DP)', balance: 89 },
    { id: 't4', date: '2023.10.15', type: 'COMMUNITY', change: 5, reason: '이달의 우수 활동자 선정', balance: 92 },
];

const scrapItems: ScrapItem[] = [
    { id: 's1', type: 'PLAN', title: '파이썬 데이터 분석 마스터', content: '데이터 분석가가 되기 위한 3개월 로드맵', originalId: 'op1', savedAt: '2023.10.20', category: '커리어' },
    { id: 's2', type: 'POST', title: '미라클 모닝 100일 후기', content: '삶이 어떻게 변했는지 공유합니다.', originalId: 'post1', savedAt: '2023.10.22' },
];

const followers: User[] = [
    { id: 'f1', nickname: 'RunnerHigh', avatarUrl: 'https://picsum.photos/200/200?random=10', trustScore: 88, statusMessage: '달리기는 인생이다' },
    { id: 'f2', nickname: 'CodeNinja', avatarUrl: 'https://picsum.photos/200/200?random=11', trustScore: 95, statusMessage: '코딩으로 세상을 바꾼다' },
];

const joinedChallenges: Challenge[] = [
    {
        id: 'c1',
        title: '미라클 모닝 5AM',
        category: '생활루틴',
        growthRate: 15,
        myAchievementRate: 85,
        myLastCertifiedAt: '오늘 아침',
        imageUrl: 'https://picsum.photos/200/200?random=30',
        description: '', statusMessage: '', tags: [], isPublic: true, createdAt: '', host: currentUser, coHosts: [], participantCount: 120, avgAchievement: 0, retentionRate: 0, avgTrustScore: 0, stabilityIndex: 0
    }
];

const joinedMonthlyChallenges: MonthlyChallenge[] = [
    {
        id: 'm1',
        title: '10월의 독서왕',
        status: 'ACTIVE',
        participants: 3400,
        myPostCount: 5,
        isPopularAuthor: true,
        imageUrl: 'https://picsum.photos/200/200?random=40',
        description: '', startDate: '', endDate: '', tags: []
    }
];

// Mock Analysis Data
const mockAnalysis: PlanAnalysis = {
    planId: 'pp2',
    dailyRecords: Array(30).fill(null).map((_, i) => ({
        date: `2023-08-${i+1}`,
        status: Math.random() > 0.6 ? 'SUCCESS' : Math.random() > 0.5 ? 'FAIL' : 'NONE'
    })),
    subGoalStats: [
        { title: '자유형 500m', status: 'SUCCESS' },
        { title: '접영 배우기', status: 'FAIL' },
        { title: '주 3회 출석', status: 'FAIL' }
    ],
    failureAnalysis: [
        { reason: '시간 부족', count: 12 },
        { reason: '의지 부족', count: 5 },
        { reason: '건강 문제', count: 3 }
    ],
    certificationFrequency: [2, 3, 1, 0, 4, 2, 3] // Mon-Sun
};

type TabType = 'PLANS' | 'CHALLENGE' | 'SCRAPS' | 'SOCIAL';
type SubTabType = 'ACTIVE' | 'PAST' | 'TOGETHER' | 'MISC' | 'FOLLOWER' | 'FOLLOWING';

export function MyPage() {
    const [activeTab, setActiveTab] = useState<TabType>('PLANS');
    const [subTab, setSubTab] = useState<SubTabType>('ACTIVE');
    
    // Modals
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showTrustScore, setShowTrustScore] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState<Plan | null>(null);

    // Edit Profile State
    const [editNickname, setEditNickname] = useState(currentUser.nickname);
    const [editStatus, setEditStatus] = useState(currentUser.statusMessage);

    const handleSaveProfile = () => {
        // Logic to update profile
        setShowEditProfile(false);
        alert('프로필이 수정되었습니다.');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
            {/* --- 10.1 Profile Header (FR-238 ~ FR-240) --- */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 flex gap-2">
                     <button 
                        onClick={() => setShowEditProfile(true)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors flex items-center gap-1" 
                    >
                        <Edit2 className="w-4 h-4" /> <span className="text-xs font-bold hidden sm:inline">프로필 수정</span>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    <div className="relative group cursor-pointer" onClick={() => setShowEditProfile(true)}>
                        <Avatar src={currentUser.avatarUrl} size="xl" border />
                        <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                            <Trophy className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="text-center sm:text-left space-y-2 flex-1">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{currentUser.nickname}</h1>
                            <p className="text-xs text-gray-400">{currentUser.email}</p>
                        </div>
                        <p className="text-gray-500 max-w-md bg-gray-50 px-3 py-1.5 rounded-lg inline-block text-sm">
                            {currentUser.statusMessage}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                            <button 
                                onClick={() => setShowTrustScore(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold hover:bg-green-100 transition-colors"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                신뢰도: {currentUser.trustScore}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-8 border-t border-gray-100 pt-8">
                    <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{currentUser.totalPlans}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">총 계획</div>
                    </div>
                    <div className="text-center border-l border-r border-gray-100">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{currentUser.completedGoals}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">완료한 목표</div>
                    </div>
                    <div className="text-center cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-1" onClick={() => { setActiveTab('SOCIAL'); setSubTab('FOLLOWER'); }}>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{currentUser.followers}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">팔로워</div>
                    </div>
                </div>
            </div>

            {/* --- Tabs Navigation --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'PLANS', label: '나의 계획', icon: Target },
                        { id: 'CHALLENGE', label: '참여 챌린지', icon: Trophy },
                        { id: 'SCRAPS', label: '스크랩', icon: Star },
                        { id: 'SOCIAL', label: '친구', icon: UserPlus },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { 
                                    setActiveTab(tab.id as TabType);
                                    if (tab.id === 'PLANS') setSubTab('ACTIVE');
                                    if (tab.id === 'CHALLENGE') setSubTab('TOGETHER');
                                    if (tab.id === 'SOCIAL') setSubTab('FOLLOWER');
                                }}
                                className={`flex-1 min-w-[100px] py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors relative ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6">
                    {/* --- 10.3 & 10.4 Plans Tab --- */}
                    {activeTab === 'PLANS' && (
                        <div>
                            <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-xl w-fit">
                                <button onClick={() => setSubTab('ACTIVE')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'ACTIVE' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>진행 중</button>
                                <button onClick={() => setSubTab('PAST')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'PAST' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>지난 계획</button>
                            </div>

                            {/* Active Plans (FR-244 ~ FR-250) */}
                            {subTab === 'ACTIVE' && (
                                <div className="grid gap-4">
                                    {activePlans.map(plan => (
                                        <div key={plan.id} className="border border-gray-100 rounded-2xl p-5 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-bold rounded">{plan.category}</span>
                                                <span className="text-xs font-medium text-gray-400">D-{plan.daysLeft}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{plan.title}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-600">
                                                    <span>진행률 {plan.progress}%</span>
                                                    <span className="text-green-600">성장 +{plan.growthRate}%</span>
                                                </div>
                                                <ProgressBar progress={plan.progress} className="h-2" />
                                                <div className="text-right text-xs text-gray-400">마지막 인증: {plan.lastCertifiedAt}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Past Plans (FR-251 ~ FR-256) */}
                            {subTab === 'PAST' && (
                                <div className="grid gap-4">
                                    {pastPlans.map(plan => (
                                        <div key={plan.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6">
                                            <div className="flex-1 w-full">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {plan.isSuccess ? (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 성공</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded flex items-center gap-1"><XCircle className="w-3 h-3" /> 실패</span>
                                                    )}
                                                    <span className="text-xs text-gray-400">{plan.startDate} ~ {plan.endDate}</span>
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">{plan.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">최종 달성률: <span className="font-bold text-gray-900">{plan.finalAchievementRate}%</span></p>
                                                {!plan.isSuccess && <p className="text-xs text-red-500 mt-1">사유: {plan.failureReason}</p>}
                                            </div>
                                            
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="flex-1 md:flex-none"
                                                    onClick={() => setShowAnalysis(plan)}
                                                >
                                                    <BarChart3 className="w-4 h-4 mr-1" /> 성과 분석
                                                </Button>
                                                {!plan.hasRetrospective && (
                                                    <Button size="sm" className="flex-1 md:flex-none">회고 작성</Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- 10.9 & 10.10 Challenges Tab --- */}
                    {activeTab === 'CHALLENGE' && (
                        <div>
                             <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-xl w-fit">
                                <button onClick={() => setSubTab('TOGETHER')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'TOGETHER' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>함께 도전하기</button>
                                <button onClick={() => setSubTab('MISC')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'MISC' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>이모저모</button>
                            </div>

                            {/* Together Challenges (FR-279 ~ FR-285) */}
                            {subTab === 'TOGETHER' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {joinedChallenges.map(c => (
                                        <div key={c.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                                            <div className="h-24 bg-gray-100 relative">
                                                <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                                <h3 className="absolute bottom-3 left-4 font-bold text-white text-lg shadow-black drop-shadow-md">{c.title}</h3>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between text-sm mb-3">
                                                    <span className="text-gray-500">참여자 {c.participantCount}명</span>
                                                    <span className="text-green-600 font-bold">그룹 성장 +{c.growthRate}%</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold text-gray-700">
                                                        <span>나의 달성률</span>
                                                        <span>{c.myAchievementRate}%</span>
                                                    </div>
                                                    <ProgressBar progress={c.myAchievementRate || 0} className="h-1.5" />
                                                    <div className="text-right text-[10px] text-gray-400 mt-1">최근 인증: {c.myLastCertifiedAt}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Misc Challenges (FR-286 ~ FR-289) */}
                            {subTab === 'MISC' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {joinedMonthlyChallenges.map(m => (
                                        <div key={m.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 items-center hover:bg-gray-50 cursor-pointer">
                                            <img src={m.imageUrl} alt={m.title} className="w-16 h-16 rounded-xl object-cover" />
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 mb-1">{m.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>참여자 {m.participants.toLocaleString()}</span>
                                                    <span className={`px-1.5 py-0.5 rounded font-bold ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                        {m.status === 'ACTIVE' ? '진행중' : '종료'}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-xs flex gap-2">
                                                    <span className="text-primary-600 font-medium">내 활동: 게시물 {m.myPostCount}개</span>
                                                    {m.isPopularAuthor && <span className="text-orange-500 font-bold flex items-center gap-0.5"><Trophy className="w-3 h-3" /> 인기 멤버</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- 10.7 Scraps Tab (FR-267 ~ FR-271) --- */}
                    {activeTab === 'SCRAPS' && (
                        <div className="space-y-4">
                            {scrapItems.map(item => (
                                <div key={item.id} className="border border-gray-100 rounded-2xl p-4 hover:border-primary-200 transition-colors group relative bg-white">
                                    <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                            item.type === 'PLAN' ? 'bg-blue-100 text-blue-700' : 
                                            item.type === 'SUBGOAL' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {item.type === 'PLAN' ? '계획' : item.type === 'SUBGOAL' ? '중간목표' : '게시글'}
                                        </span>
                                        {item.category && <span className="text-[10px] text-gray-400">| {item.category}</span>}
                                        <span className="text-[10px] text-gray-400">• {item.savedAt}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 cursor-pointer flex items-center gap-1">
                                        {item.title} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- 10.8 Social Tab (FR-272 ~ FR-278) --- */}
                    {activeTab === 'SOCIAL' && (
                        <div>
                             <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-xl w-fit">
                                <button onClick={() => setSubTab('FOLLOWER')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'FOLLOWER' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>팔로워 ({currentUser.followers})</button>
                                <button onClick={() => setSubTab('FOLLOWING')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'FOLLOWING' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>팔로잉 ({currentUser.following})</button>
                            </div>

                            <div className="grid gap-4">
                                {followers.map(user => (
                                    <div key={user.id} className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4 cursor-pointer">
                                            <Avatar src={user.avatarUrl} />
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{user.nickname}</h3>
                                                <div className="flex items-center gap-1 text-xs text-green-600 font-bold mb-1">
                                                    <ShieldCheck className="w-3 h-3" /> {user.trustScore}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.statusMessage}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Mini Active Plan Card (FR-275) */}
                                        <div className="hidden sm:block bg-gray-50 rounded-lg p-2 w-40">
                                            <div className="text-[10px] text-gray-400 mb-1">진행 중인 계획</div>
                                            <div className="text-xs font-bold text-gray-800 truncate">매일 아침 30분 독서</div>
                                            <ProgressBar progress={60} className="h-1 mt-1" />
                                        </div>

                                        <Button size="sm" variant={subTab === 'FOLLOWING' ? 'secondary' : 'primary'} className="flex-shrink-0">
                                            {subTab === 'FOLLOWING' ? '언팔로우' : '맞팔로우'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Modals --- */}

            {/* 1. Edit Profile Modal (FR-241 ~ FR-243) */}
            {showEditProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowEditProfile(false)}>
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">프로필 수정</h3>
                            <button onClick={() => setShowEditProfile(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group cursor-pointer">
                                <Avatar src={currentUser.avatarUrl} size="xl" />
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <span className="text-xs text-primary-600 font-bold mt-2 cursor-pointer">사진 변경</span>
                        </div>

                        <div className="space-y-4">
                            <Input label="닉네임" value={editNickname} onChange={(e) => setEditNickname(e.target.value)} />
                            <div>
                                <label className="block text-body-s font-medium text-gray-700 mb-1.5">상태 메시지</label>
                                <textarea 
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-3"
                                    rows={3}
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                />
                            </div>
                            <Button fullWidth onClick={handleSaveProfile}>저장하기</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Trust Score Modal (FR-261 ~ FR-266) */}
            {showTrustScore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowTrustScore(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-green-600" /> 신뢰도 점수 상세
                                </h3>
                                <p className="text-sm text-gray-500">나의 신용도를 나타내는 척도입니다.</p>
                            </div>
                            <button onClick={() => setShowTrustScore(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4 flex justify-between items-center mb-6">
                            <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">현재 점수</div>
                                <div className="text-3xl font-bold text-green-700">{currentUser.trustScore}</div>
                            </div>
                            <div className="w-px h-10 bg-green-200"></div>
                            <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">평가 횟수</div>
                                <div className="text-xl font-bold text-gray-800">24회</div>
                            </div>
                            <div className="w-px h-10 bg-green-200"></div>
                             <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">등급</div>
                                <div className="text-xl font-bold text-primary-600">Gold</div>
                            </div>
                        </div>

                        {/* Graph Mock */}
                        <div className="h-32 bg-gray-50 rounded-xl border border-gray-100 mb-6 flex items-end justify-between px-4 pb-2">
                            {[40, 55, 45, 70, 65, 85, 92].map((h, i) => (
                                <div key={i} className="w-8 bg-green-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>

                        <h4 className="font-bold text-gray-900 mb-3 text-sm">최근 변동 내역</h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                            {trustHistory.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                    <div>
                                        <div className="font-medium text-gray-800">{item.reason}</div>
                                        <div className="text-xs text-gray-400">{item.date} • {item.type}</div>
                                    </div>
                                    <div className={`font-bold ${item.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.change > 0 ? '+' : ''}{item.change}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Plan Analysis Modal (FR-257 ~ FR-260) */}
            {showAnalysis && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowAnalysis(null)}>
                     <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-1 inline-block">{showAnalysis.category}</span>
                                <h3 className="text-xl font-bold">{showAnalysis.title}</h3>
                                <p className="text-sm text-gray-500">성과 분석 리포트</p>
                            </div>
                            <button onClick={() => setShowAnalysis(null)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-xs text-gray-500">최종 달성률</div>
                                <div className={`text-2xl font-bold ${showAnalysis.isSuccess ? 'text-green-600' : 'text-red-500'}`}>{showAnalysis.finalAchievementRate}%</div>
                            </div>
                             <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <div className="text-xs text-gray-500">결과</div>
                                <div className={`text-xl font-bold ${showAnalysis.isSuccess ? 'text-green-600' : 'text-red-500'}`}>{showAnalysis.isSuccess ? '성공 🎉' : '실패 😢'}</div>
                            </div>
                        </div>

                        {/* Calendar Timeline (FR-257) */}
                        <div className="mb-6">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" /> 실천 타임라인</h4>
                            <div className="grid grid-cols-7 gap-1">
                                {mockAnalysis.dailyRecords.map((rec, i) => (
                                    <div 
                                        key={i} 
                                        className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${
                                            rec.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
                                            rec.status === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-300'
                                        }`}
                                    >
                                        {i+1}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Failure Analysis (FR-259) */}
                        {!showAnalysis.isSuccess && (
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 실패 요인 분석</h4>
                                <div className="space-y-2">
                                    {mockAnalysis.failureAnalysis.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">{f.reason}</span>
                                            <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-400" style={{ width: `${(f.count / 20) * 100}%` }}></div>
                                            </div>
                                            <span className="font-bold text-gray-800">{f.count}회</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Frequency Chart (FR-260) */}
                         <div>
                            <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> 요일별 인증 빈도</h4>
                            <div className="h-32 flex items-end justify-between gap-2">
                                {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                        <div 
                                            className="w-full bg-primary-400 rounded-t-md hover:bg-primary-500 transition-colors" 
                                            style={{ height: `${(mockAnalysis.certificationFrequency[i] / 5) * 100}%` }}
                                        ></div>
                                        <span className="text-xs text-gray-500">{day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                     </div>
                </div>
            )}
        </div>
    );
}
