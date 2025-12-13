import { useState, useEffect } from 'react';
import {
  Download,
  Filter,
  Wallet,
  RefreshCw,
  CheckCircle,
  Send,
} from 'lucide-react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { adminAPI } from '../services/api';

function Payment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchPayments(pagination.page);
  }, [pagination.page]);

  const fetchPayments = async (page, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await adminAPI.getPayments(page, pagination.limit);
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPayments(pagination.page, true);
  };

  const handlePayment = async walletAddress => {
    setProcessingPayment(walletAddress);
    try {
      const response = await adminAPI.processPayment(walletAddress);

      if (response.data.success) {
        // Show success animation
        setShowSuccess(walletAddress);

        // Refresh data after 2 seconds
        setTimeout(() => {
          setShowSuccess(null);
          fetchPayments(pagination.page, true);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const totalBalance = payments.reduce((sum, p) => sum + (p.balance || 0), 0);

  const columns = [
    {
      header: 'Wallet Address',
      accessor: 'walletAddress',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <Wallet size={20} />
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
          <span className="text-green-400 font-bold text-lg">
            {(row.balance || 0).toFixed(8)}
          </span>
          <span className="text-gray-500 text-sm">Tokens</span>
        </div>
      ),
    },
    {
      header: 'USD Value',
      accessor: 'usdValue',
      render: row => (
        <span className="text-gray-300 font-semibold">
          $
          {((row.balance || 0) * 0.09).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      render: row => (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
            row.paymentStatus === 'paid'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : row.paymentStatus === 'pending'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}
        >
          {row.paymentStatus || 'unpaid'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: row => {
        const isProcessing = processingPayment === row.walletAddress;
        const isSuccess = showSuccess === row.walletAddress;
        const isPaid = row.paymentStatus === 'paid';
        const hasBalance = (row.balance || 0) > 0;

        if (isSuccess) {
          return (
            <div className="flex items-center gap-2 text-green-400 animate-pulse">
              <CheckCircle size={20} />
              <span className="font-semibold">Payment Sent!</span>
            </div>
          );
        }

        if (isPaid) {
          return <span className="text-gray-500 text-sm">Already Paid</span>;
        }

        if (!hasBalance) {
          return <span className="text-gray-600 text-sm">No Balance</span>;
        }

        return (
          <button
            onClick={() => handlePayment(row.walletAddress)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={16} />
                Pay Now
              </>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Payments
          </h1>
          <p className="text-gray-400 text-lg">
            View user balances and process payments
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

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-6 border border-green-500/20">
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-green-400">
              {totalBalance.toFixed(8)}
            </p>
            <span className="text-gray-500">Tokens</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-2xl p-6 border border-blue-500/20">
          <p className="text-gray-400 text-sm mb-2">USD Equivalent</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-blue-400">
              ${(totalBalance * 0.09).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-2xl p-6 border border-purple-500/20">
          <p className="text-gray-400 text-sm mb-2">Total Users</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-purple-400">
              {pagination.total}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={payments} loading={loading} />

      {/* Pagination */}
      {!loading && payments.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={page => setPagination({ ...pagination, page })}
        />
      )}
    </div>
  );
}

export default Payment;
