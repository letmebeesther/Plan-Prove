import React from 'react';
import { TrendingUp, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { Plan } from '../types';

// Mock Data
const activePlans: Plan[] = [
  {
    id: '1',
    title: 'Morning Jogging Challenge',
    description: 'Run 5km every morning for 30 days',
    category: '건강관리',
    progress: 65,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    subGoals: [],
    author: { id: 'u1', nickname: 'RunnerKim', avatarUrl: '', trustScore: 85 }
  },
  {
    id: '2',
    title: 'Learn Spanish Basics',
    description: 'Master 1000 words in 2 months',
    category: '어학',
    progress: 30,
    startDate: '2023-10-15',
    endDate: '2023-12-15',
    subGoals: [],
    author: { id: 'u1', nickname: 'Me', avatarUrl: '', trustScore: 90 }
  }
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Traveler! 👋</h1>
            <p className="text-gray-500 mt-1">You have 2 active plans today. Keep up the momentum!</p>
        </div>
        <button 
            onClick={() => navigate('/new-plan')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
            + New Plan
        </button>
      </div>

      {/* Active Plans Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Current Progress
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activePlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow border border-gray-100 cursor-pointer" onClick={() => navigate(`/plan/${plan.id}`)}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg">{plan.category}</span>
                        <div className="radial-progress text-primary-500 text-xs font-bold" style={{"--value":plan.progress, "--size": "2rem"} as any}>
                            {plan.progress}%
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{plan.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{plan.description}</p>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                        <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${plan.progress}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Ends {plan.endDate}</span>
                        <div className="flex -space-x-2">
                             {/* Mock participants */}
                             <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                             <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300"></div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Add New Placeholder */}
            <div 
                onClick={() => navigate('/new-plan')}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer min-h-[200px]"
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <span className="font-medium">Start New Challenge</span>
            </div>
        </div>
      </section>

      {/* Recommended Challenges */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-orange-500" />
            Recommended Challenges
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 cursor-pointer">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                        <img src={`https://picsum.photos/200/200?random=${i}`} alt="Challenge" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-gray-900">30 Days of Code - Level {i}</h4>
                             {i === 1 && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">HOT</span>}
                        </div>
                        <p className="text-sm text-gray-500">Join 1,23{i} developers building projects daily.</p>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-200">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </button>
                 </div>
             ))}
        </div>
      </section>
    </div>
  );
}