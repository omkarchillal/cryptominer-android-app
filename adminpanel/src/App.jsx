import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Mining from './pages/Mining';
import Payment from './pages/Payment';
import ReferralRewards from './pages/ReferralRewards';
import DailyRewards from './pages/DailyRewards';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/mining" element={<Mining />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/referral-rewards" element={<ReferralRewards />} />
          <Route path="/daily-rewards" element={<DailyRewards />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
