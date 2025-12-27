import { useState, useEffect } from 'react';
import { Download, Filter, Search, RefreshCw, Trash2 } from 'lucide-react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import { adminAPI } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page, searchQuery]);

  const fetchUsers = async (page, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await adminAPI.getUsers(
        page,
        pagination.limit,
        searchQuery,
      );
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers(pagination.page, true);
  };

  const handleSearch = e => {
    setSearchQuery(e.target.value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page on search
  };

  const handleDeleteClick = (walletAddress) => {
    setUserToDelete(walletAddress);
    setDeleteModalOpen(true);
  };

  const  confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await adminAPI.deleteUser(userToDelete);
      // Refresh list
      fetchUsers(pagination.page, true);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
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
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={page => setPagination({ ...pagination, page })}
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
