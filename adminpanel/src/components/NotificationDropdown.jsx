import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { UserPlus, UserMinus, Pickaxe, Gift, Users, CreditCard } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'user_created':
      return <UserPlus size={16} className="text-green-400" />;
    case 'user_deleted':
      return <UserMinus size={16} className="text-red-400" />;
    case 'mining_claimed':
    case 'mining_started':
      return <Pickaxe size={16} className="text-yellow-400" />;
    case 'reward_claimed':
      return <Gift size={16} className="text-purple-400" />;
    case 'referral_created':
      return <Users size={16} className="text-blue-400" />;
    case 'payment_processed':
      return <CreditCard size={16} className="text-emerald-400" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-gray-400" />;
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

function NotificationDropdown({ onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await adminAPI.getActivities(20); // Get last 20
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="p-4 border-b border-[#262626] flex items-center justify-between">
        <h3 className="font-bold text-white">Notifications</h3>
        <span className="text-xs text-gray-500 bg-[#262626] px-2 py-1 rounded-full">Recent</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No recent activities</div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {activities.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-[#1f1f1f] transition-colors flex items-start gap-3">
                <div className="mt-1 p-2 bg-[#262626] rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 font-medium break-words">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-[#1f1f1f] border-t border-[#262626] text-center">
        <button className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors">
          View All Activities
        </button>
      </div>
    </div>
  );
}

export default NotificationDropdown;
