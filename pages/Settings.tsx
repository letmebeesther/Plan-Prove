import React, { useState } from 'react';
import { 
  Bell, Lock, Shield, UserX, Megaphone, FileText, HelpCircle, LogOut, 
  ChevronRight, History, AlertTriangle, Upload, Download, Trash2, Key, Database, Watch,
  Zap, UserCog, RefreshCw, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Switch } from '../components/common/Switch';
import { Input } from '../components/common/Input';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { seedDatabase, clearDatabase, updateUserWearableStatus, adminUpdateUser } from '../services/dbService';

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
  
  // Dev Mode States
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [targetTrustScore, setTargetTrustScore] = useState('');
  const [targetNickname, setTargetNickname] = useState('');
  
  // Modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
    isDestructive: false
  });

  const handleNotiChange = (key: keyof typeof notiSettings) => {
    if (key === 'all') {
      const newValue = !notiSettings.all;
      setNotiSettings({ all: newValue, deadline: newValue, newCert: newValue, chat: newValue, interaction: newValue, misc: newValue, system: newValue, trustScore: newValue });
    } else {
      setNotiSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleWearableToggle = async (checked: boolean) => {
      if (!currentUser) return;
      try {
          await updateUserWearableStatus(currentUser.id, checked);
          alert(checked ? '웨어러블 기기가 연동되었습니다.' : '연동이 해제되었습니다.');
          window.location.reload(); 
      } catch (e) {
          alert('설정 변경 실패');
      }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleClearDBClick = () => {
      setConfirmModal({
          isOpen: true,
          title: '데이터베이스 초기화',
          message: '경고: 모든 데이터(계획, 챌린지, 게시물 등)가 영구적으로 삭제됩니다. 계속하시겠습니까?',
          isDestructive: true,
          action: async () => {
              try {
                  await clearDatabase();
                  console.log('Database cleared');
                  window.location.reload();
              } catch (e) {
                  console.error(e);
                  alert('초기화 중 오류가 발생했습니다.');
              }
          }
      });
  };

  const handleSeedDBClick = () => {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
    }
    setConfirmModal({
        isOpen: true,
        title: '초기 데이터 생성',
        message: '풍성한 샘플 데이터(30개 이상)를 생성하시겠습니까? 기존 데이터 위에 추가됩니다.',
        isDestructive: false,
        action: async () => {
            console.log("Seeding...");
            try {
                await seedDatabase(currentUser.id);
                console.log('Seed completed!');
                alert("샘플 데이터 생성이 완료되었습니다!");
                navigate('/');
                window.location.reload();
            } catch (e) {
                console.error("Seeding error:", e);
                alert("생성 중 오류 발생. 콘솔 확인.");
            }
        }
    });
  };

  const handleUpdateUserStat = async (field: 'trustScore' | 'nickname', value: string | number) => {
      if (!currentUser) return;
      try {
          await adminUpdateUser(currentUser.id, { [field]: value });
          alert(`${field} 업데이트 완료!`);
          window.location.reload();
      } catch (e) {
          alert('업데이트 실패');
      }
  };

  const executeConfirm = async () => {
      const action = confirmModal.action;
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      await action();
  };

  const tabs = [
    { id: 'NOTI', label: '알림 설정', icon: Bell },
    { id: 'ACCOUNT', label: '계정 및 기기', icon: Watch },
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

            {activeTab === 'ACCOUNT' && (
                <div className="space-y-6">
                    <div><h2 className="text-lg font-bold">기기 연동</h2></div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${currentUser?.hasWearable ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <Watch className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">웨어러블 기기 연동</h3>
                                    <p className="text-xs text-gray-500">Apple Watch, Fitbit 등의 건강 데이터를 동기화합니다.</p>
                                </div>
                            </div>
                            <Switch checked={currentUser?.hasWearable || false} onChange={handleWearableToggle} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'DEV' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-600" /> 개발자 옵션
                            </h2>
                            <p className="text-sm text-gray-500">앱의 모든 상태를 제어할 수 있는 관리자 권한 모드입니다.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${devModeEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                {devModeEnabled ? '활성화됨' : '비활성화'}
                            </span>
                            <Switch checked={devModeEnabled} onChange={setDevModeEnabled} />
                        </div>
                    </div>
                    
                    {devModeEnabled ? (
                        <div className="grid gap-6">
                            {/* 1. Database Management */}
                            <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4 text-red-500" /> 데이터베이스 관리 (Danger Zone)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <div className="text-xs font-bold text-red-800 mb-2">DB 초기화</div>
                                        <p className="text-[10px] text-red-600 mb-3">모든 컬렉션 데이터를 영구 삭제합니다.</p>
                                        <Button size="sm" onClick={handleClearDBClick} className="bg-red-600 hover:bg-red-700 w-full text-white border-none">
                                            초기화 실행
                                        </Button>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                        <div className="text-xs font-bold text-yellow-800 mb-2">샘플 데이터 주입</div>
                                        <p className="text-[10px] text-yellow-700 mb-3">30+개의 테스트 데이터를 생성합니다.</p>
                                        <Button size="sm" onClick={handleSeedDBClick} className="bg-yellow-600 hover:bg-yellow-700 w-full text-white border-none">
                                            데이터 생성
                                        </Button>
                                    </div>
                                </div>
                            </section>

                            {/* 2. User Stats Editor */}
                            <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <UserCog className="w-4 h-4 text-indigo-500" /> 현재 사용자(Me) 스탯 변경
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Input 
                                                label="신뢰도 점수 (Trust Score)" 
                                                type="number" 
                                                placeholder="0 ~ 100" 
                                                value={targetTrustScore}
                                                onChange={(e) => setTargetTrustScore(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            className="mb-[1px]"
                                            onClick={() => handleUpdateUserStat('trustScore', Number(targetTrustScore))}
                                        >변경</Button>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Input 
                                                label="닉네임 강제 변경" 
                                                type="text" 
                                                placeholder="새 닉네임" 
                                                value={targetNickname}
                                                onChange={(e) => setTargetNickname(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            className="mb-[1px]"
                                            onClick={() => handleUpdateUserStat('nickname', targetNickname)}
                                        >변경</Button>
                                    </div>
                                    
                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleUpdateUserStat('trustScore', 100)}>신뢰도 100점 (MAX)</Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleUpdateUserStat('trustScore', 0)}>신뢰도 0점 (Reset)</Button>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Debugging Tools */}
                            <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-500" /> 디버깅 도구
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => window.location.reload()}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-3 h-3" /> 앱 강제 새로고침
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleWearableToggle(!currentUser?.hasWearable)}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Watch className="w-3 h-3" /> 워치 연동 토글
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                            localStorage.clear();
                                            alert('로컬 스토리지가 비워졌습니다.');
                                            window.location.reload();
                                        }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Layers className="w-3 h-3" /> 캐시/스토리지 삭제
                                    </Button>
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">개발자 모드가 비활성화되어 있습니다.</p>
                            <p className="text-xs text-gray-400 mt-1">상단의 스위치를 켜서 관리자 기능을 활성화하세요.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== 'NOTI' && activeTab !== 'DEV' && activeTab !== 'ACCOUNT' && (
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

      {/* Generic Confirmation Modal */}
      {confirmModal.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
             <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
                 <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmModal.isDestructive ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>
                    {confirmModal.isDestructive ? <AlertTriangle className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                 </div>
                 <h3 className="text-lg font-bold mb-2 text-gray-900">{confirmModal.title}</h3>
                 <p className="text-gray-500 text-sm mb-6 whitespace-pre-line">{confirmModal.message}</p>
                 <div className="flex gap-3">
                     <Button variant="secondary" fullWidth onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>취소</Button>
                     <Button 
                        fullWidth 
                        onClick={executeConfirm}
                        className={confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700 text-white border-none' : ''}
                     >
                        확인
                     </Button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}
