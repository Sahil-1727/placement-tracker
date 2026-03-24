import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, trend, trendValue, color = 'bg-primary-500', gradient }) {
  const isPositive = trend === 'up';

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-2xl ${gradient || color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">{label}</div>
      </div>
    </div>
  );
}
