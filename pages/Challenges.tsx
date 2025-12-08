import React from 'react';
import { Users, Filter } from 'lucide-react';
import { Challenge } from '../types';

const mockChallenges: Challenge[] = [
    {
        id: 'c1',
        title: 'Miracle Morning 5AM',
        description: 'Wake up at 5am and verify with a timestamp photo.',
        participantCount: 1240,
        growthRate: 15,
        category: '생활루틴',
        imageUrl: 'https://picsum.photos/400/200?random=10'
    },
    {
        id: 'c2',
        title: 'Daily Reading 30min',
        description: 'Read any book for 30 mins and share a quote.',
        participantCount: 850,
        growthRate: 8,
        category: '독서',
        imageUrl: 'https://picsum.photos/400/200?random=11'
    },
    {
        id: 'c3',
        title: 'No Sugar Challenge',
        description: 'Avoid added sugar for 2 weeks.',
        participantCount: 2300,
        growthRate: 25,
        category: '건강관리',
        imageUrl: 'https://picsum.photos/400/200?random=12'
    },
    {
        id: 'c4',
        title: '10K Steps Daily',
        description: 'Walk 10,000 steps every day.',
        participantCount: 5000,
        growthRate: 10,
        category: '운동',
        imageUrl: 'https://picsum.photos/400/200?random=13'
    }
];

export function Challenges() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Explore Challenges</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Filter className="w-4 h-4" /> Filter
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockChallenges.map((challenge) => (
                <div key={challenge.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div className="h-40 overflow-hidden relative">
                        <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-xs font-bold">
                            {challenge.category}
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{challenge.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{challenge.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold">{challenge.participantCount.toLocaleString()}</span>
                            </div>
                            <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                                +{challenge.growthRate}% Growth
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}