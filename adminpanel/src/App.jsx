import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';

// Lazy load pages for performance optimization
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Users = React.lazy(() => import('./pages/Users'));
const Mining = React.lazy(() => import('./pages/Mining'));
const Payment = React.lazy(() => import('./pages/Payment'));
const ReferralRewards = React.lazy(() => import('./pages/ReferralRewards'));
const DailyRewards = React.lazy(() => import('./pages/DailyRewards'));
const Notifications = React.lazy(() => import('./pages/Notifications'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-[#111] text-green-500">
    <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/mining" element={<Mining />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/referral-rewards" element={<ReferralRewards />} />
            <Route path="/daily-rewards" element={<DailyRewards />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
