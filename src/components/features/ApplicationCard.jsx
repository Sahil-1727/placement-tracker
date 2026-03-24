import { CheckCircle, Clock, XCircle, Building2 } from 'lucide-react';

const statusConfig = {
  Applied:  { icon: Clock,         cls: 'badge-yellow', dot: 'bg-amber-400' },
  Selected: { icon: CheckCircle,   cls: 'badge-green',  dot: 'bg-green-400' },
  Rejected: { icon: XCircle,       cls: 'badge-red',    dot: 'bg-red-400' },
};

export default function ApplicationCard({ application }) {
  const { icon: Icon, cls, dot } = statusConfig[application.status] || statusConfig.Applied;
  const matchColor = application.matchScore >= 75 ? 'text-green-600 dark:text-green-400' : application.matchScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors animate-fade-in">
      <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
        <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">{application.jobTitle}</p>
        <p className="text-[10px] text-gray-400 dark:text-slate-500">{application.company} · {application.appliedOn}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={cls}><Icon className="w-3 h-3 inline mr-1" />{application.status}</span>
        <span className={`text-[10px] font-bold ${matchColor}`}>{application.matchScore}% match</span>
      </div>
    </div>
  );
}
