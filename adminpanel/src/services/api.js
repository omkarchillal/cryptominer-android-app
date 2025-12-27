import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cryptominer-android-app.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const adminAPI = {
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    getActivities: (limit = 50) => api.get(`/admin/activities?limit=${limit}`),
    getUsers: (page = 1, limit = 20, search = '') => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (search) params.append('search', search);
        return api.get(`/admin/users?${params.toString()}`);
    },
    deleteUser: (walletAddress) => api.delete(`/admin/users/${walletAddress}`),
    getMiningSessions: (page = 1, limit = 20) => api.get(`/admin/mining?page=${page}&limit=${limit}`),
    getPayments: (page = 1, limit = 20) => api.get(`/admin/payments?page=${page}&limit=${limit}`),
    processPayment: (walletAddress) => api.post('/admin/payments/process', { walletAddress }),
    getReferrals: (page = 1, limit = 20) => api.get(`/admin/referrals?page=${page}&limit=${limit}`),
    getDailyRewards: (page = 1, limit = 20) => api.get(`/admin/daily-rewards?page=${page}&limit=${limit}`),
};

export default api;
