import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SkillMatchBar({ percentage, missing = [], compact = false }) {
  const color = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = percentage >= 75 ? 'text-green-600 dark:text-green-400' : percentage >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400';

  return (
    <div className={compact ? '' : 'card p-4'}>
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary-500" />Skill Match
          </span>
          <span className={`text-lg font-bold ${textColor}`}>{percentage}%</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className={`flex-1 bg-gray-100 dark:bg-slate-700 rounded-full ${compact ? 'h-1.5' : 'h-2'}`}>
          <div
            className={`h-full rounded-full ${color} transition-all duration-700`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {compact && <span className={`text-[10px] font-bold ${textColor}`}>{percentage}%</span>}
      </div>

      {!compact && missing.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-slate-500 mb-1.5 tracking-wide flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />Missing Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {missing.map(skill => (
              <span key={skill} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-medium rounded-full border border-red-100 dark:border-red-800">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
