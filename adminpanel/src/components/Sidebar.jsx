import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Pickaxe,
  Wallet,
  Gift,
  Award,
  Settings,
  LogOut,
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/mining', icon: Pickaxe, label: 'Mining' },
    { path: '/payment', icon: Wallet, label: 'Payment' },
    { path: '/referral-rewards', icon: Gift, label: 'Referral Rewards' },
    { path: '/daily-rewards', icon: Award, label: 'Daily Rewards' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#141414] to-[#0a0a0a] border-r border-[#262626] shadow-2xl">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center shadow-lg glow-green">
                <span className="text-xl font-bold">C</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">CryptoMiner</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-3 font-semibold">
            Main Menu
          </div>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 shadow-lg border border-green-500/20'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border hover:border-[#2a2a2a]'
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive ? 'text-green-400' : 'group-hover:text-white'
                  }
                />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#262626] space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-all">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
