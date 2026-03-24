import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import { ApplicationsAreaChart, AdminBarChart } from '../components/charts/Charts';
import api from '../services/api';
import { Users, Building2, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function ReportsPage() {
  const [summary, setSummary] = useState({});
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    api.get('/reports/summary').then(r => setSummary(r.data)).catch(console.error);
    api.get('/reports/branch').then(r => setBranches(r.data)).catch(console.error);
  }, []);

  const selectionRate = summary.total_students
    ? Math.round((summary.selected_students / summary.total_students) * 100) : 0;

  const chartData = branches.map(b => ({
    month: b.branch, applications: b.applied, selected: b.selected
  }));

  return (
    <DashboardLayout hideRight>
      <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
        <PageHeader title="Reports & Analytics" subtitle="System-wide placement statistics" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}       label="Total Students"    value={summary.total_students || 0}     gradient="bg-gradient-to-br from-primary-500 to-primary-600" />
          <StatCard icon={Building2}   label="Companies"         value={summary.companies || 0}          gradient="bg-gradient-to-br from-accent-500 to-accent-600" />
          <StatCard icon={FileText}    label="Applications"      value={summary.total_applications || 0} gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
          <StatCard icon={CheckCircle} label="Selected Students" value={summary.selected_students || 0}  gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Branch-wise Applications</h2>
            <ApplicationsAreaChart data={chartData} />
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Placement Overview</h2>
            <AdminBarChart data={chartData} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Branch-wise Performance</h2>
          <div className="space-y-3">
            {branches.map(b => {
              const rate = b.total ? Math.round((b.selected / b.total) * 100) : 0;
              return (
                <div key={b.branch}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 w-16">{b.branch}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">{b.total} students · {b.selected} selected</span>
                    </div>
                    <span className={`text-xs font-bold ${rate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{rate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-700 ${rate >= 50 ? 'bg-green-400' : 'bg-amber-400'}`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Selection Rate', value: `${selectionRate}%`, sub: `${summary.selected_students || 0} of ${summary.total_students || 0} placed`, color: 'from-green-500 to-emerald-600' },
            { label: 'Total Applications', value: summary.total_applications || 0, sub: `Across ${summary.companies || 0} companies`, color: 'from-primary-500 to-primary-600' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-soft`}>
              <p className="text-white/70 text-xs font-medium">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              <p className="text-white/60 text-[10px] mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
