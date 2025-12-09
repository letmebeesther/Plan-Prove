
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
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/intro" element={<IntroPage />} />
          
          {/* Protected/App Routes - With Layout */}
          <Route element={<Layout />}>
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
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
