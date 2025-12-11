import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/intro" element={<IntroPage />} />
        
        {/* Protected/App Routes - With Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new-plan" element={<NewPlan />} />
              <Route path="/plan/:id" element={<PlanDetail />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
              <Route path="/new-challenge" element={<NewChallenge />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/hall-of-fame" element={<HallOfFame />} />
              <Route path="/miscellaneous" element={<Miscellaneous />} />
              <Route path="/miscellaneous/:id" element={<MonthlyChallengeDetail />} />
              <Route path="/my-page" element={<MyPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<Challenges />} /> {/* Placeholder */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </HashRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;