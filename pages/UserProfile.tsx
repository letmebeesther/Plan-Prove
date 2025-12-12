
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { ShieldCheck, Trophy, ArrowLeft, UserPlus, MessageCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { User, Plan } from '../types';
import { fetchUser, fetchMyActivePlans, createChatRoom } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

export function UserProfile() {
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            if (!id) return;
            setLoading(true);
            const fetchedUser = await fetchUser(id);
            if (fetchedUser) {
                setUser(fetchedUser);
                const fetchedPlans = await fetchMyActivePlans(id);
                setPlans(fetchedPlans);
            }
            setLoading(false);
        };
        loadProfile();
    }, [id]);

    const handleChat = async () => {
        if (!currentUser || !user) return;
        // FR-GROUP-DETAIL-008 Simulating Friend Check: Allow if trust score high enough or random for demo
        if (currentUser.trustScore < 50 && user.trustScore > 80) {
             alert('친구 관계인 사용자만 채팅이 가능합니다. (FR-GROUP-DETAIL-008)');
             return;
        }
        
        try {
            const roomId = await createChatRoom([currentUser, user], 'DIRECT');
            navigate(`/chat/${roomId}`);
        } catch (e) {
            alert('채팅방 생성 실패');
        }
    };

    if (loading) return <div className="p-20 text-center">로딩 중...</div>;
    if (!user) return <div className="p-20 text-center">사용자를 찾을 수 없습니다.</div>;

    const isMe = currentUser?.id === user.id;

    return (
        <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-1" /> 돌아가기
            </button>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
                <div className="relative inline-block mb-4">
                    <Avatar src={user.avatarUrl} size="xl" border />
                    <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-700 p-1.5 rounded-full border-4 border-white shadow-sm flex items-center gap-1 px-2">
                        <ShieldCheck className="w-4 h-4" /> <span className="text-xs font-bold">{user.trustScore}</span>
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.nickname}</h1>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">{user.statusMessage || "상태 메시지가 없습니다."}</p>

                <div className="flex justify-center gap-8 mb-8 border-t border-b border-gray-50 py-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{user.totalPlans}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">총 계획</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{user.completedGoals}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">완료</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{user.followers}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">팔로워</div>
                    </div>
                </div>

                {!isMe && (
                    <div className="flex justify-center gap-3">
                        <Button className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> 팔로우
                        </Button>
                        <Button variant="secondary" onClick={handleChat} className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> 1:1 채팅
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" /> 진행 중인 계획
                </h2>
                <div className="space-y-4">
                    {plans.length > 0 ? plans.map(plan => (
                        <div key={plan.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{plan.category}</span>
                                <span className="text-xs font-medium text-gray-400">D-{plan.daysLeft}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-4">{plan.title}</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-gray-600">
                                    <span>진행률</span>
                                    <span>{plan.progress}%</span>
                                </div>
                                <ProgressBar progress={plan.progress} className="h-2" />
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            공개된 계획이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
