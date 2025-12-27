import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Download, Filter, Search, RefreshCw, Trash2 } from 'lucide-react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import { adminAPI } from '../services/api';

function Users() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search (simplified via effect or just query key)
  // For now relying on React Query's deduplication

  // Users Query
  const {
    data: usersData,
    isLoading: loading,
    isPlaceholderData,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['users', page, searchQuery],
    queryFn: async () => {
      const response = await adminAPI.getUsers(page, 20, searchQuery);
      return response.data;
    },
    placeholderData: keepPreviousData, // Keep old data while fetching new page
    staleTime: 1000 * 60, // 1 minute
  });

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (walletAddress) => adminAPI.deleteUser(walletAddress),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleSearch = e => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleDeleteClick = (walletAddress) => {
    setUserToDelete(walletAddress);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  const columns = [
    {
      header: 'Wallet Address',
      accessor: 'walletAddress',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center font-bold text-sm">
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
      header: 'Balance',
      accessor: 'balance',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold">
            {(row.balance || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'Mining Rate',
      accessor: 'miningRate',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {(row.miningRate || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens/h</span>
        </div>
      ),
    },
    {
      header: 'Referral Code',
      accessor: 'referralCode',
      render: row => (
        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg font-mono text-purple-400 text-sm">
          {row.referralCode || 'N/A'}
        </span>
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
          {row.status || 'inactive'}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: row => (
        <span className="text-gray-400">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: row => (
        <button 
          onClick={() => handleDeleteClick(row.walletAddress)}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete User"
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-gray-400 text-lg">
            Manage all registered users • {pagination.total} total users
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

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by wallet address..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <Table columns={columns} data={users} loading={loading} />

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will permanently remove all associated data, including mining history, rewards, and bonuses."
        confirmText="Delete User"
        type="danger"
      />
    </div>
  );
}

export default Users;
