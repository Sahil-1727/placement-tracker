import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getAdminApplications, updateApplicationStatus } from '../services/api';
import { Search, FileText, ChevronDown } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { STATUS_STYLES, TYPE_BADGE, matchScoreColor } from '../utils/helpers';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updating, setUpdating]         = useState(null);

  useEffect(() => {
    getAdminApplications()
      .then(r => setApplications(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.studentName.toLowerCase().includes(q) ||
      a.company.toLowerCase().includes(q) ||
      a.jobTitle.toLowerCase().includes(q) ||
      a.branch.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    All: applications.length,
    Applied:  applications.filter(a => a.status === 'Applied').length,
    Selected: applications.filter(a => a.status === 'Selected').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updateApplicationStatus(id, newStatus);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (e) { console.error(e); }
    setUpdating(null);
  };

  return (
    <DashboardLayout hideRight>
      <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
        <PageHeader title="All Applications" subtitle="View and manage every student application" />

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(counts).map(([label, value]) => (
            <div key={label} className="card p-4 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by student, company, job or branch..."
              className="input pl-8 py-2 text-xs" />
          </div>
          <div className="flex gap-1">
            {['All', 'Applied', 'Selected', 'Rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${statusFilter === s ? 'bg-primary-600 text-white shadow-sm' : 'btn-secondary'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  {['Student', 'Branch', 'Job', 'Company', 'Type', 'Match', 'Applied On', 'Status'].map(h => (
                    <th key={h} className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide text-left py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">Loading…</td></tr>
                )}
                {!loading && filtered.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {a.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{a.studentName}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500">{a.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-slate-400">{a.branch || '—'}</td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-800 dark:text-slate-200 max-w-[140px] truncate">{a.jobTitle}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                          {a.company.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-700 dark:text-slate-300">{a.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-[10px] ${TYPE_BADGE[a.type] || 'badge-gray'}`}>{a.type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${matchScoreColor(a.matchScore)}`}
                            style={{ width: `${a.matchScore}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-slate-400">{Math.round(a.matchScore)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-gray-500 dark:text-slate-400 whitespace-nowrap">{a.appliedOn}</td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <select
                          value={a.status}
                          disabled={updating === a.id}
                          onChange={e => handleStatusChange(a.id, e.target.value)}
                          className={`text-[10px] font-semibold pl-2 pr-6 py-1 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${STATUS_STYLES[a.status]} ${updating === a.id ? 'opacity-50' : ''}`}>
                          <option value="Applied">Applied</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none text-current opacity-60" />
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <FileText className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 dark:text-slate-500">No applications found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
