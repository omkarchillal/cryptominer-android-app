import { useState, useEffect } from 'react';
import {
  Download,
  Filter,
  Award,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { adminAPI } from '../services/api';

function DailyRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchRewards(pagination.page);
  }, [pagination.page]);

  const fetchRewards = async (page, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await adminAPI.getDailyRewards(page, pagination.limit);
      setRewards(response.data.rewards);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch daily rewards:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRewards(pagination.page, true);
  };

  const claimedRewards = rewards.filter(r => r.claimed).length;
  const pendingRewards = rewards.filter(r => !r.claimed).length;
  const totalRewardAmount = rewards.reduce(
    (sum, r) => sum + (r.rewardAmount || 0),
    0,
  );

  const columns = [
    {
      header: 'Wallet Address',
      accessor: 'walletAddress',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center font-bold text-sm">
            {row.walletAddress
              ? row.walletAddress.slice(0, 2).toUpperCase()
              : '??'}
          </div>
          <span className="font-mono text-blue-400 font-medium">
            {row.walletAddress
              ? row.walletAddress.length > 10
                ? `${row.walletAddress.slice(0, 6)}...${row.walletAddress.slice(
                    -4,
                  )}`
                : row.walletAddress
              : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Reward Amount',
      accessor: 'rewardAmount',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold">
            {(row.rewardAmount || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'claimed',
      render: row => (
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
            row.claimed
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}
        >
          {row.claimed ? (
            <>
              <CheckCircle size={14} />
              Claimed
            </>
          ) : (
            <>
              <Clock size={14} />
              Pending
            </>
          )}
        </span>
      ),
    },
    {
      header: 'Claimed At',
      accessor: 'claimedAt',
      render: row =>
        row.claimedAt ? (
          <span className="text-gray-400">
            {new Date(row.claimedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span className="text-gray-600">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Daily Rewards
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor daily reward claims • {pagination.total} total rewards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:border-green-500/30 transition-all font-medium disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:border-green-500/30 transition-all font-medium">
            <Filter size={20} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-2xl p-6 border border-orange-500/20 relative overflow-hidden group hover:border-orange-500/40 transition-all">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 opacity-10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Total Rewards</p>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center glow-orange">
                <Award size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-400">
              {pagination.total}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm font-medium">Claimed</p>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center glow-green">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">{claimedRewards}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm font-medium">Pending</p>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{pendingRewards}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm font-medium">Total Amount</p>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center glow-purple">
              <Award size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-purple-400">
              {totalRewardAmount.toFixed(6)}
            </p>
            <span className="text-gray-500 text-sm">Tokens</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={rewards} loading={loading} />

      {/* Pagination */}
      {!loading && rewards.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={page => setPagination({ ...pagination, page })}
        />
      )}
    </div>
  );
}

export default DailyRewards;
