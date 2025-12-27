import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { UserPlus, UserMinus, Pickaxe, Gift, Users, CreditCard, Clock } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'user_created':
      return <UserPlus size={20} className="text-green-400" />;
    case 'user_deleted':
      return <UserMinus size={20} className="text-red-400" />;
    case 'mining_claimed':
    case 'mining_started':
      return <Pickaxe size={20} className="text-yellow-400" />;
    case 'reward_claimed':
      return <Gift size={20} className="text-purple-400" />;
    case 'referral_created':
      return <Users size={20} className="text-blue-400" />;
    case 'payment_processed':
      return <CreditCard size={20} className="text-emerald-400" />;
    default:
      return <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />;
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

function Notifications() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // Fetch more items for the full page view (e.g. 100)
      const response = await adminAPI.getActivities(100);
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Activity Log
        </h1>
        <p className="text-gray-400 mt-1">System-wide notifications and events (30-day retention)</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No activities found</div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {activities.map((activity, index) => (
              <div key={index} className="p-5 hover:bg-[#1f1f1f] transition-colors flex items-start gap-4">
                <div className="mt-1 p-2.5 bg-[#262626] rounded-xl border border-[#333]">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-[#262626] border border-[#333] ${
                      activity.type.includes('deleted') ? 'text-red-400' : 
                      activity.type.includes('created') ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} />
                      {formatTime(activity.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 break-all font-mono">
                    Wallet: {activity.walletAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
