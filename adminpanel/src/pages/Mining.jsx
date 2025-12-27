import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Download, Filter, RefreshCw } from 'lucide-react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { adminAPI } from '../services/api';

function Mining() {
  const [page, setPage] = useState(1);
  
  const {
    data: sessionsData,
    isLoading: loading,
    isPlaceholderData,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['mining-sessions', page],
    queryFn: async () => {
      const response = await adminAPI.getMiningSessions(page, 20);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });

  const sessions = sessionsData?.sessions || [];
  const pagination = sessionsData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };

  const handleRefresh = () => {
    refetch();
  };

  const columns = [
    {
      header: 'Wallet Address',
      accessor: 'walletAddress',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-sm">
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
      header: 'Status',
      accessor: 'status',
      render: row => (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
            row.status === 'active'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Mining Rate',
      accessor: 'miningRate',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold">
            {(row.miningRate || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens/h</span>
        </div>
      ),
    },
    {
      header: 'Current Session',
      accessor: 'currentMiningPoints',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="text-orange-400 font-bold">
            {(row.currentMiningPoints || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'Total Balance',
      accessor: 'totalEarned',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {(row.totalEarned || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'Start Time',
      accessor: 'startTime',
      render: row => (
        <span className="text-gray-400">
          {new Date(row.startTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Mining Sessions
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor all mining activities • {pagination.total} total sessions
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
          <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-xl p-5 border border-green-500/20">
          <p className="text-gray-400 text-sm mb-1">Active Sessions</p>
          <p className="text-2xl font-bold text-green-400">
            {sessions.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-xl p-5 border border-blue-500/20">
          <p className="text-gray-400 text-sm mb-1">Completed Sessions</p>
          <p className="text-2xl font-bold text-blue-400">
            {sessions.filter(s => s.status !== 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-xl p-5 border border-purple-500/20">
          <p className="text-gray-400 text-sm mb-1">Avg. Mining Rate</p>
          <p className="text-2xl font-bold text-purple-400">0.00012 Tokens/h</p>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={sessions} loading={loading} />

      {/* Pagination */}
      {!loading && sessions.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default Mining;
