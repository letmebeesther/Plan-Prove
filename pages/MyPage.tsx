import React from 'react';
import { Avatar } from '../components/Avatar';
import { ShieldCheck, Trophy, Target, Settings as SettingsIcon } from 'lucide-react';

export function MyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                    <SettingsIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                <div className="relative">
                    <Avatar size="xl" border />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>
                
                <div className="text-center sm:text-left space-y-2 flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Alex Johnson</h1>
                    <p className="text-gray-500 max-w-md">Consistency is key! 🏃‍♂️📚 Trying to improve 1% every day.</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                            <ShieldCheck className="w-4 h-4" />
                            Trust Score: 92
                        </div>
                        <div className="text-sm text-gray-500">
                            <span className="font-bold text-gray-900">142</span> Followers
                        </div>
                        <div className="text-sm text-gray-500">
                            <span className="font-bold text-gray-900">56</span> Following
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8 border-t border-gray-100 pt-8">
                <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">12</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Plans Completed</div>
                </div>
                <div className="text-center border-l border-r border-gray-100">
                    <div className="text-3xl font-bold text-gray-900">85%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Avg. Success</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">45</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Day Streak</div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-500" /> Recent Achievements
                </h3>
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                            <div>
                                <p className="text-sm text-gray-800 font-medium">Completed "Morning Run" (Day {i})</p>
                                <p className="text-xs text-gray-400">2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Badges Collection</h3>
                <div className="grid grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="aspect-square rounded-full bg-gray-100 flex items-center justify-center text-2xl grayscale hover:grayscale-0 transition-all cursor-pointer hover:bg-yellow-50">
                            🏅
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}