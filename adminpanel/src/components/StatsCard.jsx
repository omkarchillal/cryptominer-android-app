import { TrendingUp, TrendingDown } from 'lucide-react';

function StatsCard({ title, value, icon: Icon, trend, color = 'green' }) {
  const colorClasses = {
    green: {
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      glow: 'glow-green',
    },
    blue: {
      gradient: 'from-blue-400 via-blue-500 to-cyan-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: 'glow-blue',
    },
    purple: {
      gradient: 'from-purple-400 via-purple-500 to-pink-600',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      glow: 'glow-purple',
    },
    orange: {
      gradient: 'from-orange-400 via-amber-500 to-yellow-600',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      glow: 'glow-orange',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`relative bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-2xl p-6 border ${colors.border} hover:scale-105 transition-all duration-300 overflow-hidden group`}
    >
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-2 font-medium">{title}</p>
          <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {value}
          </h3>
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp size={16} className="text-green-400" />
              ) : (
                <TrendingDown size={16} className="text-red-400" />
              )}
              <p
                className={`text-sm font-semibold ${
                  trend > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend > 0 ? '+' : ''}
                {trend}%
              </p>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.glow} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={28} className="text-white" />
        </div>
      </div>

      {/* Decorative corner */}
      <div
        className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full blur-2xl`}
      ></div>
    </div>
  );
}

export default StatsCard;
