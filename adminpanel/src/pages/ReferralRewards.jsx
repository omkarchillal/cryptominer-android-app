import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  Download,
  Filter,
  Gift,
  Users,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { adminAPI } from '../services/api';

function ReferralRewards() {
  const [page, setPage] = useState(1);
  
  const {
    data: referralData,
    isLoading: loading,
    isPlaceholderData,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['referrals', page],
    queryFn: async () => {
      const response = await adminAPI.getReferrals(page, 20);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });

  const referrals = referralData?.referrals || [];
  const pagination = referralData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };

  const handleRefresh = () => {
    refetch();
  };

  const columns = [
    {
      header: 'Referrer',
      accessor: 'referrerWallet',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
            <Users size={20} />
          </div>
          <span className="font-mono text-blue-400 font-medium">
            {row.referrerWallet
              ? row.referrerWallet.length > 10
                ? `${row.referrerWallet.slice(
                    0,
                    6,
                  )}...${row.referrerWallet.slice(-4)}`
                : row.referrerWallet
              : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Referred User',
      accessor: 'referredWallet',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-sm">
            {row.referredWallet
              ? row.referredWallet.slice(0, 2).toUpperCase()
              : '??'}
          </div>
          <span className="font-mono text-purple-400 font-medium">
            {row.referredWallet
              ? row.referredWallet.length > 10
                ? `${row.referredWallet.slice(
                    0,
                    6,
                  )}...${row.referredWallet.slice(-4)}`
                : row.referredWallet
              : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Referral Code',
      accessor: 'referralCode',
      render: row => (
        <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg font-mono text-purple-400 text-sm font-bold">
          {row.referralCode || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Referrer Bonus',
      accessor: 'referrerBonus',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold">
            {(row.referrerBonus || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'Referred Reward',
      accessor: 'referredReward',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-semibold">
            {(row.referredReward || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'Mining Bonuses',
      accessor: 'miningBonus',
      render: row => (
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-400" />
          <span className="text-orange-400 font-bold">
            {(row.miningBonus || 0).toFixed(2)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: row => (
        <span className="text-gray-400">
          {new Date(row.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  // Calculate totals
  const totalReferrerBonus = referrals.reduce(
    (sum, r) => sum + (r.referrerBonus || 0),
    0,
  );
  const totalReferredReward = referrals.reduce(
    (sum, r) => sum + (r.referredReward || 0),
    0,
  );
  const totalMiningBonuses = referrals.reduce(
    (sum, r) => sum + (r.miningBonus || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Referral Rewards
          </h1>
          <p className="text-gray-400 text-lg">
            Track all referral activities • {pagination.total} total referrals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:border-green-500/30 transition-all font-medium disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefetching ? 'animate-spin' : ''} />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:border-green-500/30 transition-all font-medium">
            <Filter size={20} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center glow-purple">
                <Gift size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Referrals</p>
                <p className="text-3xl font-bold text-purple-400">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center glow-green">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Referrer Bonuses</p>
              <p className="text-2xl font-bold text-green-400">
                {totalReferrerBonus.toFixed(6)} Tokens
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center glow-blue">
              <Gift size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Referred Rewards</p>
              <p className="text-2xl font-bold text-blue-400">
                {totalReferredReward.toFixed(6)} Tokens
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-2xl p-6 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Mining Bonuses</p>
              <p className="text-3xl font-bold text-orange-400">
                {totalMiningBonuses}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={referrals} loading={loading} />

      {/* Pagination */}
      {!loading && referrals.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default ReferralRewards;
