import React, { useState } from 'react';
import { Calendar, Users, ArrowRight, Search, Clock, Award, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MonthlyChallenge } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

// Mock Data for This Month's Challenges (FR-193)
const monthlyChallenges: MonthlyChallenge[] = [
  {
    id: 'm1',
    title: '10월의 독서왕: 가을은 독서의 계절',
    imageUrl: 'https://picsum.photos/400/250?random=101',
    description: '선선한 가을 바람과 함께 책 한 권의 여유를 즐겨보세요.',
    participants: 3421,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    status: 'ACTIVE',
    tags: ['독서', '가을', '이벤트']
  },
  {
    id: 'm2',
    title: '할로윈 코스튬 런닝',
    imageUrl: 'https://picsum.photos/400/250?random=102',
    description: '재미있는 복장을 입고 달리며 건강도 챙기고 추억도 남기세요!',
    participants: 1205,
    startDate: '2023-10-25',
    endDate: '2023-10-31',
    status: 'ACTIVE',
    tags: ['운동', '할로윈', '러닝']
  },
  {
    id: 'm3',
    title: '환절기 면역력 UP 챌린지',
    imageUrl: 'https://picsum.photos/400/250?random=103',
    description: '따뜻한 물 마시기, 비타민 챙겨먹기로 환절기를 건강하게.',
    participants: 5600,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    status: 'ACTIVE',
    tags: ['건강', '생활습관']
  }
];

// Mock Data for Archive (FR-234, FR-231)
const pastChallenges: MonthlyChallenge[] = [
  {
    id: 'p1',
    title: '9월 추석맞이 칼로리 버닝',
    imageUrl: 'https://picsum.photos/400/250?random=104',
    description: '맛있는 명절 음식, 죄책감 없이 즐기기 위한 버닝 프로젝트',
    participants: 8900,
    startDate: '2023-09-01',
    endDate: '2023-09-30',
    status: 'ENDED',
    tags: ['다이어트', '명절']
  },
  {
    id: 'p2',
    title: '8월 여름방학 갓생살기',
    imageUrl: 'https://picsum.photos/400/250?random=105',
    description: '무더운 여름, 늘어지지 말고 알차게 보내기',
    participants: 12000,
    startDate: '2023-08-01',
    endDate: '2023-08-31',
    status: 'ENDED',
    tags: ['방학', '갓생']
  },
  {
    id: 'p3',
    title: '7월 장마철 홈트레이닝',
    imageUrl: 'https://picsum.photos/400/250?random=106',
    description: '비 오는 날에도 집에서 건강하게 운동해요.',
    participants: 4500,
    startDate: '2023-07-01',
    endDate: '2023-07-31',
    status: 'ENDED',
    tags: ['홈트', '장마']
  },
  {
    id: 'p4',
    title: '6월 환경의 달: 플로깅',
    imageUrl: 'https://picsum.photos/400/250?random=107',
    description: '건강도 챙기고 지구도 지키는 플로깅 챌린지',
    participants: 3200,
    startDate: '2023-06-01',
    endDate: '2023-06-30',
    status: 'ENDED',
    tags: ['환경', '플로깅']
  },
  {
    id: 'p5',
    title: '5월 가정의 달: 감사 편지 쓰기',
    imageUrl: 'https://picsum.photos/400/250?random=108',
    description: '사랑하는 가족들에게 마음을 전해보세요.',
    participants: 2800,
    startDate: '2023-05-01',
    endDate: '2023-05-31',
    status: 'ENDED',
    tags: ['감사', '가족']
  }
];

export function Miscellaneous() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'MONTH' | 'ARCHIVE'>('MONTH');
  
  // Search States (FR-228 ~ FR-230)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Filter Logic
  const filteredArchive = pastChallenges.filter(c => {
    const matchQuery = c.title.includes(searchQuery) || c.tags.some(t => t.includes(searchQuery));
    const matchDate = selectedDate ? (c.startDate <= selectedDate && c.endDate >= selectedDate) : true;
    const matchTag = selectedTag ? c.tags.includes(selectedTag) : true;
    return matchQuery && matchDate && matchTag;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div>
             <h1 className="text-2xl font-bold text-gray-900">이 달의 챌린지</h1>
             <p className="text-gray-500 mt-1">매월 새로운 테마로 진행되는 특별한 도전에 참여해보세요.</p>
         </div>
         <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('MONTH')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'MONTH' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                이달의 챌린지
             </button>
             <button 
                onClick={() => setActiveTab('ARCHIVE')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ARCHIVE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                지난 챌린지 (Archive)
             </button>
         </div>
      </div>

      {/* Tab: This Month (FR-193 ~ FR-196) */}
      {activeTab === 'MONTH' && (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyChallenges.map((challenge) => (
                    <div 
                        key={challenge.id} 
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group cursor-pointer flex flex-col h-full"
                        onClick={() => navigate(`/miscellaneous/${challenge.id}`)}
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-primary-600 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                                진행중
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{challenge.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{challenge.description}</p>
                            
                            <div className="pt-4 border-t border-gray-50 space-y-2">
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> 
                                    {challenge.startDate} ~ {challenge.endDate}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Users className="w-3.5 h-3.5 mr-1.5" /> 
                                    <span className="font-bold text-gray-900 mr-1">{challenge.participants.toLocaleString()}명</span> 참여 중
                                </div>
                            </div>
                            
                            <button className="mt-4 w-full py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors flex items-center justify-center gap-1">
                                참여하기 <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Tab: Archive (FR-227 ~ FR-237) */}
      {activeTab === 'ARCHIVE' && (
        <div className="animate-fade-in space-y-10">
            {/* Top 5 Popular Events (FR-231) */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-lg font-bold text-gray-900">역대 인기 이벤트 TOP 5</h2>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                    {pastChallenges.slice(0, 5).map((challenge, idx) => (
                        <div key={challenge.id} className="min-w-[280px] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative group cursor-pointer hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 left-0 w-8 h-8 bg-black/80 text-white flex items-center justify-center font-bold rounded-br-xl z-10 text-sm">
                                {idx + 1}
                            </div>
                            <div className="h-32 bg-gray-100">
                                <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-gray-800 text-sm truncate">{challenge.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{challenge.participants.toLocaleString()}명 참여</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Search & List (FR-228, 229, 230) */}
            <section className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="지난 챌린지 검색..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full md:w-40 pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-600"
                            />
                        </div>
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select 
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full md:w-32 pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-600 appearance-none bg-white"
                            >
                                <option value="">전체 태그</option>
                                <option value="다이어트">다이어트</option>
                                <option value="환경">환경</option>
                                <option value="가족">가족</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Archive List Grid (FR-234, 235) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredArchive.map(challenge => (
                         <div key={challenge.id} className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 hover:border-gray-400 transition-colors cursor-pointer items-center">
                             <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                 <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover opacity-80" />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">종료됨</span>
                                     <span className="text-xs text-gray-400">{challenge.startDate} ~ {challenge.endDate}</span>
                                 </div>
                                 <h3 className="font-bold text-gray-900 truncate">{challenge.title}</h3>
                                 <div className="flex items-center gap-2 mt-1">
                                     {challenge.tags.map(tag => (
                                         <span key={tag} className="text-xs text-blue-500">#{tag}</span>
                                     ))}
                                 </div>
                             </div>
                             <div className="text-right flex-shrink-0">
                                 <button className="text-xs font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                                     아카이브 보기
                                 </button>
                             </div>
                         </div>
                    ))}
                    {filteredArchive.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-500">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </div>
      )}
    </div>
  );
}