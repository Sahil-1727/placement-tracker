import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import { AdminBarChart } from '../components/charts/Charts';
import { getStudents, getCompanies, getReports } from '../services/api';
import { Users, Building2, FileText, TrendingUp, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [reports, setReports] = useState({});

  useEffect(() => {
    getStudents().then(r => setStudents(r.data)).catch(console.error);
    getCompanies().then(r => setCompanies(r.data)).catch(console.error);
    getReports().then(r => setReports(r.data)).catch(console.error);
  }, []);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.branch || '').toLowerCase().includes(search.toLowerCase())
  );

  const chartData = [
    { month: 'Jan', applications: 10, selected: 3 },
    { month: 'Feb', applications: 18, selected: 5 },
    { month: 'Mar', applications: reports.total_applications || 0, selected: reports.selected_students || 0 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
        <PageHeader title="Admin Dashboard" subtitle="Manage students, companies and placements" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}      label="Total Students" value={reports.total_students || 0}      gradient="bg-gradient-to-br from-primary-500 to-primary-600" />
          <StatCard icon={Building2}  label="Companies"      value={reports.companies || 0}           gradient="bg-gradient-to-br from-accent-500 to-accent-600" />
          <StatCard icon={FileText}   label="Applications"   value={reports.total_applications || 0}  gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
          <StatCard icon={TrendingUp} label="Selected"       value={reports.selected_students || 0}   gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Placement Overview</h2>
          <AdminBarChart data={chartData} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Student List</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search students..." className="input pl-8 py-2 text-xs w-48" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {['Name','Branch','Skills','Applications','Status'].map(h => (
                    <th key={h} className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide text-left py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-gray-800 dark:text-slate-200">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-slate-400">{s.branch}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-0.5">
                        {(s.skills || []).slice(0,3).map(skill => (
                          <span key={skill} className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-[9px] font-medium rounded-full">{skill}</span>
                        ))}
                        {(s.skills || []).length > 3 && <span className="text-[9px] text-gray-400">+{s.skills.length-3}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-800 dark:text-slate-200 font-medium">{s.application_count || 0}</td>
                    <td className="py-3 px-3">
                      <span className={s.selected ? 'badge-green' : 'badge-gray'}>{s.selected ? 'Selected' : 'Pending'}</span>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400 dark:text-slate-500">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Registered Companies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companies.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.name.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{c.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{c.openings} openings · {c.roles} roles</p>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {(c.requiredSkills || []).slice(0,3).map(sk => (
                      <span key={sk} className="px-1.5 py-0.5 bg-white dark:bg-slate-600 text-gray-500 dark:text-slate-300 text-[9px] rounded-full border border-gray-200 dark:border-slate-500">{sk}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
