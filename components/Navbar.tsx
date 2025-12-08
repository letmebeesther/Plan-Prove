import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Avatar } from './Avatar';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.04)] z-50 animate-fade-in">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-[0_2px_8px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.04)]">
                <span className="text-white text-body-s font-semibold">P&P</span>
              </div>
              <span className="text-gray-900 font-semibold hidden sm:block text-body-l">Plan & Prove</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div
              onClick={() => navigate('/search')}
              className="relative w-full cursor-pointer"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="목표, 도전방, 사용자 검색..."
                className="w-full pl-10 pr-3 py-2 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                readOnly
              />
            </div>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="검색"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative" aria-label="알림">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button
              onClick={() => navigate('/my-page')}
              className="ml-1"
              aria-label="마이페이지"
            >
              <Avatar size="sm" border />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}