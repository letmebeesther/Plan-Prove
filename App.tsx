
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NewPlan } from './pages/NewPlan';
import { Challenges } from './pages/Challenges';
import { MyPage } from './pages/MyPage';
import { LoginPage } from './pages/LoginPage';
import { IntroPage } from './pages/IntroPage';
import { HallOfFame } from './pages/HallOfFame';
import { Trending } from './pages/Trending';
import { NewChallenge } from './pages/NewChallenge';
import { ChallengeDetail } from './pages/ChallengeDetail';
import { Miscellaneous } from './pages/Miscellaneous';
import { MonthlyChallengeDetail } from './pages/MonthlyChallengeDetail';
import { Settings } from './pages/Settings';
import { PlanDetail } from './pages/PlanDetail';
import { PlanSearch } from './pages/PlanSearch';
import { PlanBoard } from './pages/PlanBoard';
import { UserProfile } from './pages/UserProfile';
import { ChatPage } from './pages/ChatPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Flame } from 'lucide-react';
import { initEmailService } from './services/emailService';

interface SplashScreenProps {
  onFinish: () => void;
  isLoading?: boolean;
}

function SplashScreen({ onFinish, isLoading }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center animate-fade-in p-4">
        {/* Changed from animate-bounce to animate-fade-up for a more sincere, steady look */}
        <div className="bg-primary-50 p-6 rounded-3xl mb-6 animate-fade-up shadow-sm">
            <Flame className="w-20 h-20 text-primary-600 fill-current" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight animate-fade-in" style={{ animationDelay: '0.3s' }}>Plan & Prove</h1>
        <p className="text-gray-500 font-medium text-lg animate-fade-in mb-16 text-center" style={{ animationDelay: '0.6s' }}>도전하고 계획하고 성공하세요</p>
        
        {isLoading ? (
            <div className="mt-4 flex flex-col items-center gap-3 animate-fade-in">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-100 border-t-primary-600"></div>
                <p className="text-sm text-gray-400 font-medium">로그인 정보를 확인 중입니다...</p>
            </div>
        ) : (
            <button 
                onClick={onFinish}
                className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary-200 transition-all hover:scale-105 active:scale-95 animate-fade-in flex items-center gap-2"
                style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
            >
                JUST DO IT!
            </button>
        )}
    </div>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function MainRoutes() {
  const { currentUser, loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  // Handle Splash Screen Logic inside Router context
  if (showSplash || authLoading) {
    return <SplashScreen 
      onFinish={() => {
        // Safe navigation using React Router instead of window.location
        navigate('/', { replace: true });
        setShowSplash(false);
      }} 
      isLoading={authLoading} 
    />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} />
      <Route path="/intro" element={<IntroPage />} />
      
      {/* Main Routes */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            {/* Home: Redirect to Login if not authenticated */}
            <Route path="/" element={currentUser ? <Home /> : <Navigate to="/login" replace />} />
            
            {/* Protected Routes */}
            <Route path="/new-plan" element={<ProtectedRoute><NewPlan /></ProtectedRoute>} />
            <Route path="/my-page" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/new-challenge" element={<ProtectedRoute><NewChallenge /></ProtectedRoute>} />
            <Route path="/chat/:roomId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            
            {/* Public/Hybrid Routes (Can be viewed without login, but might have limited functionality) */}
            <Route path="/plan/:id" element={<PlanDetail />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetail />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/miscellaneous" element={<Miscellaneous />} />
            <Route path="/miscellaneous/:id" element={<MonthlyChallengeDetail />} />
            <Route path="/user/:id" element={<UserProfile />} />
            
            {/* Search & Board Routes */}
            <Route path="/search" element={<PlanSearch />} />
            <Route path="/plans" element={<PlanBoard />} />
            <Route path="/plans/search" element={<PlanSearch />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    initEmailService();
  }, []);

  return (
    <AuthProvider>
      <HashRouter>
        <MainRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
