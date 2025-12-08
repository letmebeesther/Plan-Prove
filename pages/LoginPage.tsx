import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to intro for new users
    navigate('/intro');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 shadow-[0_4px_12px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)]">
            <span className="text-white font-semibold" style={{ fontSize: '20px' }}>P&P</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Plan & Prove</h1>
          <p className="text-body-m text-gray-600">목표를 계획하고 증명하세요</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-[0_4px_12px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)] p-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              label="이메일"
              icon={<Mail className="w-5 h-5" />}
              required
            />
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                label="비밀번호"
                icon={<Lock className="w-5 h-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-body-m text-gray-700">자동 로그인</span>
              </label>
              <button type="button" className="text-body-m text-primary-600 hover:text-primary-700 transition-colors">
                비밀번호 찾기
              </button>
            </div>
            
            <Button type="submit" variant="primary" fullWidth size="lg" className="mt-6">
              로그인
            </Button>
          </form>
          
          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-body-m text-gray-500">또는</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-body-m shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
                <div className="w-5 h-5 bg-red-500 rounded"></div>
                <span className="text-gray-700">구글로 계속하기</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FEE500] rounded-xl hover:bg-[#FDD800] transition-colors text-body-m">
                <div className="w-5 h-5 bg-black rounded-full"></div>
                <span className="text-gray-900">카카오로 계속하기</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#03C75A] rounded-xl hover:bg-[#02B350] transition-colors text-body-m">
                <div className="w-5 h-5 bg-white rounded"></div>
                <span className="text-white">네이버로 계속하기</span>
              </button>
            </div>
          </div>
          
          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span className="text-body-m text-gray-600">계정이 없으신가요? </span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-body-m text-primary-600 hover:text-primary-700 font-medium"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}