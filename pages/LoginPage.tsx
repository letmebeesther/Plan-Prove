
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Flame, Facebook, User as UserIcon, ArrowRight, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signInWithFacebook, signupWithEmail, loginWithEmail, resetPassword, currentUser } = useAuth();
  
  const isSignup = location.pathname === '/signup';
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // Clear state on mode change
  useEffect(() => {
    setError(null);
    setEmail('');
    setPassword('');
    setNickname('');
  }, [isSignup]);

  const mapAuthError = (errCode: string) => {
    switch (errCode) {
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return '이메일 또는 비밀번호가 올바르지 않습니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/weak-password':
        return '비밀번호는 6자 이상이어야 합니다.';
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 형식입니다.';
      case 'auth/too-many-requests':
        return '너무 많은 시도가 감지되었습니다. 잠시 후 다시 시도해주세요.';
      case 'auth/network-request-failed':
        return '네트워크 연결을 확인해주세요.';
      default:
        return '로그인/가입 중 오류가 발생했습니다.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignup) {
        if (!nickname) throw new Error('닉네임을 입력해주세요.');
        if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
        await signupWithEmail(email, password, nickname);
      } else {
        await loginWithEmail(email, password);
      }
      // Success is handled by the useEffect redirecting to /
    } catch (err: any) {
      // Suppress console error for validation issues
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          // Expected auth errors
      } else {
          console.error(err);
      }

      if (err.message === '닉네임을 입력해주세요.' || err.message === '비밀번호는 6자 이상이어야 합니다.') {
          setError(err.message);
      } else {
          setError(mapAuthError(err.code));
      }
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        setError(null);
        await signInWithGoogle();
    } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
            setError('Google 로그인에 실패했습니다.');
        }
    }
  };

  const handleFacebookLogin = async () => {
    try {
        setError(null);
        await signInWithFacebook();
    } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
            setError('Facebook 로그인에 실패했습니다.');
        }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setResetStatus('sending');
    try {
      await resetPassword(resetEmail);
      setResetStatus('sent');
    } catch (error) {
      setResetStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-500/30">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Plan & Prove</h1>
          <p className="text-gray-500 mt-2">
            당신의 꿈들이 기다리고 있습니다
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl mb-8">
            <button
              onClick={() => navigate('/login')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                !isSignup 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => navigate('/signup')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                isSignup 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <Input
                label="닉네임"
                type="text"
                placeholder="사용할 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                icon={<UserIcon className="w-5 h-5" />}
                required
              />
            )}

            <Input
              label="이메일"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-body-s font-medium text-gray-700">비밀번호</label>
                {!isSignup && (
                  <button 
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="6자 이상 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-gray-300 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus:border-primary-500 focus:ring-primary-500 text-body-m py-2.5 pl-10 pr-10 border bg-white"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                disabled={isSubmitting}
                className="mt-6 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <>
                    {isSignup ? '계정 만들기' : '로그인'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </>
              )}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-100"></div>
            <span className="text-xs font-medium text-gray-400">또는</span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button 
                onClick={handleFacebookLogin}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-xl hover:bg-[#1864D9] transition-colors font-medium text-sm"
            >
              <Facebook className="w-5 h-5 fill-current" />
              Facebook
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500">
          계속 진행하면 Plan & Prove의{' '}
          <a href="#" className="text-gray-900 font-semibold hover:underline">이용약관</a> 및{' '}
          <a href="#" className="text-gray-900 font-semibold hover:underline">개인정보처리방침</a>에
          동의하게 됩니다.
        </p>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowResetModal(false)}>
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-2">비밀번호 재설정</h3>
                
                {resetStatus === 'sent' ? (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-gray-800 font-medium mb-1">이메일이 전송되었습니다.</p>
                        <p className="text-sm text-gray-500 mb-6">받은 편지함(또는 스팸함)을 확인하여<br/>비밀번호를 재설정해주세요.</p>
                        <Button fullWidth onClick={() => setShowResetModal(false)}>확인</Button>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <p className="text-sm text-gray-500 mb-6">
                            가입 시 사용한 이메일 주소를 입력하시면<br/>
                            비밀번호 재설정 링크를 보내드립니다.
                        </p>
                        
                        <div className="mb-6">
                            <Input 
                                label="이메일" 
                                type="email" 
                                value={resetEmail} 
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                            {resetStatus === 'error' && (
                                <p className="text-xs text-red-500 mt-1.5 ml-1">해당 이메일로 가입된 계정을 찾을 수 없거나 오류가 발생했습니다.</p>
                            )}
                        </div>

                        <Button type="submit" fullWidth disabled={resetStatus === 'sending'}>
                            {resetStatus === 'sending' ? '전송 중...' : '재설정 메일 보내기'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
