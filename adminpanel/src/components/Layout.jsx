import Sidebar from './Sidebar';
import { Bell, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';

function Layout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#262626]">
          <div className="flex items-center justify-end px-8 py-4">
            <div className="flex items-center gap-3" ref={dropdownRef}>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-xl border transition-all ${
                    showNotifications 
                      ? 'bg-[#1a1a1a] border-green-500/50 text-green-400' 
                      : 'bg-[#1a1a1a] border-[#262626] hover:bg-[#1f1f1f] hover:border-green-500/30 text-gray-400'
                  }`}
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                </button>
                {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1a1a1a] border border-[#262626] hover:border-green-500/30 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Admin</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
