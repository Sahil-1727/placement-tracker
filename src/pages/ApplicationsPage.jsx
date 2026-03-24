import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ApplicationCard from '../components/features/ApplicationCard';
import { getApplications } from '../services/api';
import { FileText } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getApplications().then(r => setApplications(r.data)).catch(console.error);
  }, []);

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter);
  const counts = {
    All: applications.length,
    Applied: applications.filter(a => a.status === 'Applied').length,
    Selected: applications.filter(a => a.status === 'Selected').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
        <PageHeader title="My Applications" subtitle="Track all your job applications" />

        <div className="flex gap-2 flex-wrap">
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setFilter(status)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${filter === status ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>
              {status} <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === status ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'}`}>{count}</span>
            </button>
          ))}
        </div>

        <div className="card p-5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-600 dark:text-slate-400">No applications in this category</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {filtered.map(app => <ApplicationCard key={app.id} application={app} />)}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
