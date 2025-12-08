import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NewPlan } from './pages/NewPlan';
import { Challenges } from './pages/Challenges';
import { MyPage } from './pages/MyPage';
import { LoginPage } from './pages/LoginPage';
import { IntroPage } from './pages/IntroPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/intro" element={<IntroPage />} />
        
        {/* Protected/App Routes - With Layout */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new-plan" element={<NewPlan />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/trending" element={<Challenges />} /> {/* Reusing component for demo */}
              <Route path="/hall-of-fame" element={<Challenges />} /> {/* Placeholder */}
              <Route path="/miscellaneous" element={<Challenges />} /> {/* Placeholder */}
              <Route path="/my-page" element={<MyPage />} />
              <Route path="/settings" element={<MyPage />} /> {/* Placeholder */}
              <Route path="/search" element={<Challenges />} /> {/* Placeholder */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </HashRouter>
  );
}

export default App;