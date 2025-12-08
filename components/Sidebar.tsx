import React from 'react';
import { Home, PlusCircle, Users, TrendingUp, Trophy, Grid, User, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: '홈', path: '/' },
  { icon: PlusCircle, label: '새 계획', path: '/new-plan' },
  { icon: Users, label: '함께 도전하기', path: '/challenges' },
  { icon: TrendingUp, label: '인기 도전', path: '/trending' },
  { icon: Trophy, label: '명예의 전당', path: '/hall-of-fame' },
  { icon: Grid, label: '이모저모', path: '/miscellaneous' },
  { icon: User, label: '마이페이지', path: '/my-page' },
  { icon: Settings, label: '설정', path: '/settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-[0_8px_16px_0_rgba(0,0,0,0.12),0_4px_6px_0_rgba(0,0,0,0.08)] z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:fixed lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 lg:hidden">
            <span className="text-gray-900 font-semibold text-body-l">메뉴</span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="메뉴 닫기"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-body-m ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}