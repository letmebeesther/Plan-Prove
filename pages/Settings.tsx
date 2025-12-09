
import React, { useState } from 'react';
import { 
  Bell, Lock, Shield, UserX, Megaphone, FileText, HelpCircle, LogOut, 
  ChevronRight, History, AlertTriangle, Upload, Download, Trash2, Key, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Switch } from '../components/common/Switch';
import { Input } from '../components/common/Input';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { seedDatabase, clearDatabase } from '../services/dbService';

type SettingsTab = 'NOTI' | 'ACCOUNT' | 'PRIVACY' | 'BLOCKED' | 'MARKETING' | 'POLICIES' | 'SUPPORT' | 'DEV';

// Mock Blocked Users
const mockBlockedUsers = [
  { id: 1, nickname: 'SpamBot01', avatar: 'https://picsum.photos/200/200?random=88', date: '2023.09.15' },
];

export function Settings() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('NOTI');
  const [notiSettings, setNotiSettings] = useState({ all: true, deadline: true, newCert: true, chat: true, interaction: true, misc: false, system: true, trustScore: true });
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNotiChange = (key: keyof typeof notiSettings) => {
    if (key === 'all') {
      const newValue = !notiSettings.all;
      setNotiSettings({ all: newValue, deadline: newValue, newCert: newValue, chat: newValue, interaction: newValue, misc: newValue, system: newValue, trustScore: newValue });
    } else {
      setNotiSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleClearDB = async () => {
      const confirm = window.confirm('경고: 모든 데이터(계획, 챌린지, 게시물 등)가 영구적으로 삭제됩니다. 계속하시겠습니까?');
      if (confirm) {
          try {
              await clearDatabase();
              alert('데이터베이스가 초기화되었습니다.');
              window.location.reload();
          } catch (e) {
              console.error(e);
              alert('초기화 실패');
          }
      }
  };

  const handleSeedDB = async () => {
    if (!currentUser) return alert('로그인 후 이용해주세요.');
    const confirm = window.confirm('풍성한 샘플 데이터(30개 이상)를 생성하시겠습니까?');
    if (confirm) {
        try {
            await seedDatabase(currentUser.id);
            alert('성공적으로 데이터가 생성되었습니다! 홈 화면으로 이동합니다.');
            navigate('/');
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('데이터 생성 실패: 콘솔 로그를 확인해주세요.');
        }
    }
  };

  const tabs = [
    { id: 'NOTI', label: '알림 설정', icon: Bell },
    { id: 'ACCOUNT', label: '계정 및 보안', icon: Lock },
    { id: 'PRIVACY', label: '개인정보 설정', icon: Shield },
    { id: 'BLOCKED', label: '차단 관리', icon: UserX },
    { id: 'MARKETING', label: '마케팅 수신', icon: Megaphone },
    { id: 'POLICIES', label: '약관 및 정책', icon: FileText },
    { id: 'SUPPORT', label: '고객지원', icon: HelpCircle },
    { id: 'DEV', label: '개발자 옵션', icon: Database },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 px-2">설정</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
            <div className="border-t border-gray-100 mt-2 pt-2 pb-2">
              <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-5 h-5" /> 로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[500px]">
            
            {activeTab === 'NOTI' && (
              <div className="space-y-6">
                <div><h2 className="text-lg font-bold">알림 설정</h2></div>
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                   <Switch checked={notiSettings.all} onChange={() => handleNotiChange('all')} label="전체 알림 허용" />
                </div>
                <div className="space-y-2 divide-y divide-gray-100">
                  <Switch checked={notiSettings.deadline} onChange={() => handleNotiChange('deadline')} disabled={!notiSettings.all} label="마감 알림" />
                  <Switch checked={notiSettings.newCert} onChange={() => handleNotiChange('newCert')} disabled={!notiSettings.all} label="인증 알림" />
                </div>
              </div>
            )}

            {activeTab === 'DEV' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">개발자 옵션</h2>
                        <p className="text-sm text-gray-500">데이터베이스 초기화 및 테스트 기능을 제공합니다.</p>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4"/> 데이터베이스 전체 삭제</h3>
                            <p className="text-xs text-red-700 mb-4">
                                현재 Firestore의 모든 컬렉션(Plans, Challenges, Users 등) 데이터를 삭제합니다.
                            </p>
                            <Button onClick={handleClearDB} className="bg-red-600 hover:bg-red-700 border-none text-white w-full">
                                데이터베이스 삭제 (Clear DB)
                            </Button>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><Database className="w-4 h-4"/> 초기 데이터 생성</h3>
                            <p className="text-xs text-yellow-700 mb-4">
                                30개 이상의 챌린지, 명예의 전당, 샘플 계획 등을 새로 생성하여 DB를 풍성하게 채웁니다.
                            </p>
                            <Button onClick={handleSeedDB} className="bg-yellow-600 hover:bg-yellow-700 border-none text-white w-full">
                                샘플 데이터 생성 (Seed DB)
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Other tabs placeholder for brevity as they are mostly UI */}
            {activeTab !== 'NOTI' && activeTab !== 'DEV' && (
                <div className="text-center py-20 text-gray-400">
                    해당 설정 기능은 준비 중입니다.
                </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
             <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
                 <h3 className="text-lg font-bold mb-2">로그아웃 하시겠습니까?</h3>
                 <div className="flex gap-3 mt-6">
                     <Button variant="secondary" fullWidth onClick={() => setShowLogoutModal(false)}>취소</Button>
                     <Button variant="outline" fullWidth onClick={handleLogout} className="text-red-500 border-red-200 hover:bg-red-50">로그아웃</Button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}
