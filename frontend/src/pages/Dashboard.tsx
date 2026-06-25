import { useEffect, useState } from 'react';
import { dashboardAPI, type DashboardStats } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  Users,
  UserCheck,
  UserPlus,
  Package,
  Warehouse,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
} from 'lucide-react';

// Mini composant de graphique en CSS pur
function MiniBarChart({ data, isDark }: { data: number[]; isDark: boolean }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500 hover:from-blue-600 hover:to-cyan-500"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ percentage, color, isDark }: { percentage: number; color: string; isDark: boolean }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={isDark ? '#374151' : '#E5E7EB'}
          strokeWidth="12"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function AreaSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80}`).join(' ');
  
  return (
    <div className="h-24 w-full">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${color})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme()!;

  async function loadStats() {
    try {
      const res = await dashboardAPI.stats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardClass = isDark
    ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/80'
    : 'bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white hover:shadow-lg';

  const barData = [65, 45, 78, 56, 85, 42, 70];
  const sparklineData = [20, 35, 25, 50, 30, 60, 45, 70, 55, 80, 65, 90];

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500" />
          <p className={`text-lg font-medium ${mutedClass} animate-pulse`}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: Users, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-600 dark:text-blue-400', trend: '+12%', trendUp: true },
    { label: 'Active Users', value: stats?.active_users ?? 0, icon: UserCheck, color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-600 dark:text-emerald-400', trend: '+8%', trendUp: true },
    { label: 'New Registrations', value: stats?.recent_registrations ?? 0, icon: UserPlus, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400', trend: '+24%', trendUp: true },
    { label: 'Total Products', value: stats?.total_products ?? 0, icon: Package, color: 'from-orange-500 to-yellow-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400', trend: '+5%', trendUp: true },
    { label: 'Total Stock', value: stats?.total_stock ?? 0, icon: Warehouse, color: 'from-indigo-500 to-violet-500', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-600 dark:text-indigo-400', trend: '-3%', trendUp: false },
    { label: 'Total Sales', value: stats?.total_sales ?? 0, icon: DollarSign, color: 'from-rose-500 to-red-500', bgColor: 'bg-rose-500/10', textColor: 'text-rose-600 dark:text-rose-400', trend: '+18%', trendUp: true },
  ];

  return (
    <div className={`min-h-screen ${bgClass} p-6 lg:p-8`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className={`text-3xl font-bold ${textClass}`}>Dashboard</h1>
        </div>
        <p className={`${mutedClass} ml-12`}>
          Welcome back! Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group ${cardClass}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <div className="flex items-center gap-1">
                {card.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${card.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                  {card.trend}
                </span>
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium ${mutedClass} mb-1`}>{card.label}</p>
              <p className={`text-3xl font-bold ${textClass}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${card.color} opacity-50`} />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 ${cardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${textClass}`}>Weekly Activity</h3>
              <p className={`text-sm ${mutedClass}`}>Daily transactions</p>
            </div>
            <Activity className={`w-5 h-5 ${mutedClass}`} />
          </div>
          <MiniBarChart data={barData} isDark={isDark} />
        </div>

        {/* Donut + Sparklines */}
        <div className="space-y-6">
          <div className={`rounded-2xl border p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Stock Health</h3>
            <div className="flex items-center justify-center">
              <DonutChart percentage={78} color="#10B981" isDark={isDark} />
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className={`text-xs ${mutedClass}`}>In Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className={`text-xs ${mutedClass}`}>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className={`text-xs ${mutedClass}`}>Out</span>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-2`}>Trend</h3>
            <p className={`text-sm ${mutedClass} mb-4`}>Last 12 periods</p>
            <AreaSparkline data={sparklineData} color="#3B82F6" />

          </div>
        </div>
      </div>
    </div>
  );
}