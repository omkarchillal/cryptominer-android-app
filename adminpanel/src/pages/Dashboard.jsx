import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Activity,
  Gift,
  Award,
  TrendingUp,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { adminAPI } from '../services/api';

function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);

  // Stats Query
  const { 
    data: stats, 
    isLoading: loadingStats, 
    refetch: refetchStats,
    isRefetching: isRefetchingStats 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await adminAPI.getDashboardStats();
      return res.data;
    },
    // Reasonable default for stats
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  // Activities Query
  const { 
    data: activities, 
    refetch: refetchActivities 
  } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: async () => {
      const res = await adminAPI.getActivities(50);
      return res.data.activities;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const handleRefresh = () => {
    refetchStats();
    refetchActivities();
  };
  
  // Safe defaults
  const safeStats = stats || {
    totalUsers: 0,
    activeMiningSessions: 0,
    totalReferrals: 0,
    totalRewardsClaimed: 0,
    totalBalance: 0,
    avgMiningRate: 0,
    totalTransactions: 0,
    successRate: 0,
  };
  const safeActivities = activities || [];
  const refreshing = isRefetchingStats;
  const loading = loadingStats;

  const getActivityIcon = type => {
    switch (type) {
      case 'user_created':
        return <Users size={20} className="text-blue-400" />;
      case 'mining_started':
        return <Activity size={20} className="text-green-400" />;
      case 'mining_claimed':
        return <Gift size={20} className="text-purple-400" />;
      case 'reward_claimed':
        return <Award size={20} className="text-orange-400" />;
      case 'referral_created':
        return <TrendingUp size={20} className="text-pink-400" />;
      case 'payment_processed':
        return <DollarSign size={20} className="text-emerald-400" />;
      default:
        return <Activity size={20} className="text-gray-400" />;
    }
  };

  const getTimeAgo = date => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Activity Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Overview of your crypto mining platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:border-green-500/30 transition-all font-medium disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 glow-green">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={safeStats.totalUsers.toLocaleString()}
          icon={Users}
          trend={12.5}
          color="blue"
        />
        <StatsCard
          title="Active Mining"
          value={safeStats.activeMiningSessions.toLocaleString()}
          icon={Activity}
          trend={8.2}
          color="green"
        />
        <StatsCard
          title="Total Referrals"
          value={safeStats.totalReferrals.toLocaleString()}
          icon={Gift}
          trend={15.3}
          color="purple"
        />
        <StatsCard
          title="Rewards Claimed"
          value={safeStats.totalRewardsClaimed.toLocaleString()}
          icon={Award}
          trend={-2.4}
          color="orange"
        />
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#262626] relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">
                  Total Platform Balance
                </p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    {(safeStats.totalBalance || 0).toFixed(4)}
                  </h2>
                  <span className="text-2xl text-gray-500 font-semibold">
                    Tokens
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg glow-green">
                <DollarSign size={32} className="text-white" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp size={20} />
              <span className="font-semibold">+5.2% from last week</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-2xl p-6 border border-[#262626]">
          <h3 className="text-lg font-bold mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-[#262626]">
              <span className="text-gray-400 text-sm">Avg. Mining Rate</span>
              <span className="font-bold text-green-400">
                {safeStats.avgMiningRate.toFixed(4)} BTC/h
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-[#262626]">
              <span className="text-gray-400 text-sm">Total Transactions</span>
              <span className="font-bold text-blue-400">
                {safeStats.totalTransactions.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-[#262626]">
              <span className="text-gray-400 text-sm">Success Rate</span>
              <span className="font-bold text-purple-400">
                {safeStats.successRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-2xl p-6 border border-[#262626]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <button
            onClick={() => setShowNotifications(true)}
            className="text-sm text-green-400 hover:text-green-300 font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {safeActivities.slice(0, 4).map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-[#262626] hover:border-green-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500 font-mono">
                    {activity.walletAddress
                      ? activity.walletAddress.length > 10
                        ? `${activity.walletAddress.slice(
                            0,
                            6,
                          )}...${activity.walletAddress.slice(-4)}`
                        : activity.walletAddress
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {getTimeAgo(activity.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#262626]">
              <h2 className="text-2xl font-bold">All Activities</h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-[#262626] hover:border-green-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500 font-mono">
                          {activity.walletAddress
                            ? activity.walletAddress.length > 10
                              ? `${activity.walletAddress.slice(
                                  0,
                                  6,
                                )}...${activity.walletAddress.slice(-4)}`
                              : activity.walletAddress
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {getTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
