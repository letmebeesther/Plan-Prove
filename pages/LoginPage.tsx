import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Flame, Facebook, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signInWithFacebook, signupWithEmail, loginWithEmail, currentUser } = useAuth();
  
  const isSignup = location.pathname === '/signup';
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState(''); // For debugging
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      console.log("User already logged in, redirecting to Home");
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Reset error when switching modes
  useEffect(() => {
    setError('');
    setErrorCode('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
  }, [isSignup]);

  const handleError = (err: any, method: string) => {
    console.error(`${method} failed`, err);
    const code = err.code || 'unknown';
    setErrorCode(code);
    
    let msg = `로그인 실패: ${err.message}`;
    
    if (code === 'auth/unauthorized-domain') {
      msg = '[도메인 승인 필요] 현재 도메인이 Firebase 승인 목록에 없습니다.';
      const domainMsg = `[Firebase 설정 필요]\n현재 도메인(${window.location.hostname})이 승인되지 않았습니다.\n\nFirebase Console > Authentication > Settings > Authorized Domains 에 도메인을 추가해주세요.`;
      alert(domainMsg);
    } else if (code === 'auth/popup-closed-by-user') {
      msg = '로그인이 취소되었습니다.';
    } else if (code === 'auth/operation-not-allowed') {
      msg = 'Firebase 콘솔에서 해당 로그인 방식(이메일/구글 등)이 활성화되지 않았습니다.';
      alert(msg);
    } else if (code === 'auth/email-already-in-use') {
      msg = '이미 사용 중인 이메일입니다.';
    } else if (code === 'auth/invalid-email') {
      msg = '유효하지 않은 이메일 주소입니다.';
    } else if (code === 'auth/weak-password') {
      msg = '비밀번호는 6자 이상이어야 합니다.';
    } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
    } else if (code === 'auth/network-request-failed') {
      msg = '네트워크 연결을 확인해주세요.';
    }
    
    setError(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit clicked", { isSignup, email });
    
    setError('');
    setErrorCode('');
    setIsLoading(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        if (nickname.length < 2) {
          throw new Error('닉네임은 2글자 이상이어야 합니다.');
        }
        console.log("Attempting Signup...");
        await signupWithEmail(email, password, nickname);
        // AuthContext will handle redirection via useEffect
      } else {
        console.log("Attempting Login...");
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      handleError(err, 'Email Auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("Google Login Clicked");
    setError('');
    setErrorCode('');
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      handleError(error, 'Google Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    console.log("Facebook Login Clicked");
    setError('');
    setErrorCode('');
    try {
      setIsLoading(true);
      await signInWithFacebook();
    } catch (error: any) {
      handleError(error, 'Facebook Login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-full mb-4 shadow-sm border border-primary-100 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Flame className="w-10 h-10 text-primary-500 fill-primary-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 tracking-tight">Plan & Prove</h1>
          <p className="text-body-m text-gray-500 font-medium">
            {isSignup ? '새로운 여정을 시작해보세요! 🚀' : '파란 불꽃처럼 타오르는 당신의 열정 🔥'}
          </p>
        </div>
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_12px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)] p-6 sm:p-8 border border-gray-100">
          
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-50 p-1 rounded-xl">
            <button 
              onClick={() => navigate('/login')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isSignup ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              로그인
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isSignup ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              회원가입
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <Input
                type="text"
                placeholder="닉네임을 입력하세요"
                label="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                icon={<User className="w-5 h-5" />}
                required
              />
            )}

            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                label="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignup && (
              <Input
                type="password"
                placeholder="비밀번호를 한번 더 입력하세요"
                label="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />
            )}
            
            {!isSignup && (
              <div className="flex items-center justify-end pt-1">
                <button type="button" className="text-xs text-gray-500 hover:text-primary-600 font-medium transition-colors">
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex flex-col gap-1 font-medium animate-fade-in break-words border border-red-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {errorCode && (
                    <div className="text-[10px] text-red-400 ml-6">Code: {errorCode}</div>
                )}
                {(error.includes('도메인 승인') || errorCode === 'auth/unauthorized-domain') && (
                   <div className="ml-6 mt-1 text-red-500">
                      <p className="mb-1">1. Firebase 콘솔 &gt; Authentication &gt; Settings &gt; Authorized Domains</p>
                      <p className="mb-1">2. 아래 도메인을 추가하세요:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-white border border-red-200 px-2 py-1 rounded font-mono select-all text-red-700">
                          {window.location.hostname}
                        </code>
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.hostname);
                            alert('도메인이 복사되었습니다.');
                          }}
                          className="text-[10px] underline hover:text-red-800"
                        >
                          복사
                        </button>
                      </div>
                   </div>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              className="mt-2" 
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : (isSignup ? '가입하고 시작하기' : '로그인')}
            </Button>
          </form>
          
          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {isSignup ? 'SNS 계정으로 간편 가입' : 'SNS 계정으로 로그인'}
                </span>
              </div>
            </div>
            
            <div className="mt-5 space-y-3">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-body-m font-medium text-gray-700 shadow-sm disabled:opacity-70 hover:shadow-md"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span>{isSignup ? '구글로 가입하기' : '구글로 계속하기'}</span>
              </button>

              <button 
                type="button"
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2] border border-[#1877F2] rounded-xl hover:bg-[#166fe5] transition-colors text-body-m font-medium text-white shadow-sm disabled:opacity-70 hover:shadow-md"
              >
                <Facebook className="w-5 h-5 fill-current" />
                <span>{isSignup ? '페이스북으로 가입하기' : '페이스북으로 계속하기'}</span>
              </button>
            </div>
          </div>
          
          {/* Toggle Link */}
          <div className="mt-8 text-center pt-2 border-t border-gray-50">
            <span className="text-body-m text-gray-500">
              {isSignup ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}
            </span>
            <button
              type="button"
              onClick={() => navigate(isSignup ? '/login' : '/signup')}
              className="text-body-m text-primary-600 hover:text-primary-700 font-bold ml-1 hover:underline underline-offset-2 inline-flex items-center gap-0.5"
            >
              {isSignup ? '로그인하기' : '회원가입하기'} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}