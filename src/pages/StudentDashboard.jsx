import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import ApplicationCard from '../components/features/ApplicationCard';
import { ApplicationsAreaChart } from '../components/charts/Charts';
import { useAuth } from '../context/AuthContext';
import { getApplications, getJobs } from '../services/api';
import { FileText, TrendingUp, User, Briefcase, ChevronRight } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const firstName = user?.name?.split(' ')[0] || 'Student';

  useEffect(() => {
    getApplications().then(r => setApplications(r.data)).catch(console.error);
    getJobs().then(r => {
      const top = r.data.filter(j => !j.already_applied)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 3);
      setSuggestedJobs(top);
    }).catch(console.error);
  }, []);

  const avgMatch = applications.length
    ? Math.round(applications.reduce((a, app) => a + (app.matchScore || 0), 0) / applications.length) : 0;
  const selected = applications.filter(a => a.status === 'Selected').length;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const chartData = [
    { month: 'Applied', applications: applications.length, selected },
    { month: 'Selected', applications: selected, selected },
    { month: 'Rejected', applications: applications.filter(a => a.status === 'Rejected').length, selected: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
        <PageHeader
          title={`Hello, ${firstName} 👋`}
          subtitle={today}
          action={<button onClick={() => navigate('/jobs')} className="btn-primary text-sm flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Browse Jobs</button>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={FileText}   label="Total Applications" value={applications.length}          trendValue="+2 this week" trend="up" gradient="bg-gradient-to-br from-primary-500 to-primary-600" />
          <StatCard icon={TrendingUp} label="Avg Match Score"    value={`${avgMatch}%`}               trendValue="+5%" trend="up" gradient="bg-gradient-to-br from-accent-500 to-accent-600" />
          <StatCard icon={User}       label="Profile Strength"   value={`${user?.profileCompletion || 0}%`} trendValue={user?.profileCompletion >= 80 ? 'Great!' : 'Needs update'} trend={user?.profileCompletion >= 80 ? 'up' : 'down'} gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="card p-5 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Application Activity</h2>
            </div>
            <ApplicationsAreaChart data={chartData} />
          </div>

          <div className="card p-5 lg:col-span-2 flex flex-col gap-3">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Quick Summary</h2>
            {[
              { label: 'Applied',   value: applications.length, color: 'bg-amber-400' },
              { label: 'Selected',  value: selected, color: 'bg-green-400' },
              { label: 'Rejected',  value: applications.filter(a => a.status === 'Rejected').length, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="flex-1 text-xs text-gray-600 dark:text-slate-400">{item.label}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
            {applications.length > 0 && (
              <div className="mt-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Selection rate</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{Math.round((selected / applications.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mt-1.5">
                  <div className="h-1.5 bg-green-400 rounded-full" style={{ width: `${(selected / applications.length) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Recent Applications</h2>
            <button onClick={() => navigate('/applications')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {applications.length === 0
            ? <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-6">No applications yet. Browse jobs to get started!</p>
            : <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {applications.slice(0, 5).map(app => <ApplicationCard key={app.id} application={app} />)}
              </div>
          }
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Suggested Jobs for You</h2>
            <button onClick={() => navigate('/jobs')} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
              See all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {suggestedJobs.map(job => (
              <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => navigate('/jobs')}>
                <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{job.logo}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">{job.title}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{job.company}</p>
                </div>
                <span className={`badge text-[10px] ${(job.matchScore||0) >= 75 ? 'badge-green' : (job.matchScore||0) >= 50 ? 'badge-yellow' : 'badge-gray'}`}>{job.matchScore || 0}%</span>
              </div>
            ))}
            {suggestedJobs.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">Apply to some jobs first to see suggestions!</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
