import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import JobCard from '../components/features/JobCard';
import { getJobs, applyJob } from '../services/api';
import { Search, Briefcase } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { JOB_TYPES } from '../utils/helpers';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCompany, setFilterCompany] = useState('');

  useEffect(() => {
    getJobs().then(r => setJobs(r.data)).catch(console.error);
  }, []);

  const companies = [...new Set(jobs.map(j => j.company))];

  const filtered = jobs.filter(j => {
    const matchType = filterType === 'All' || j.type === filterType;
    const matchCompany = !filterCompany || j.company === filterCompany;
    const matchSearch = !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      (j.requiredSkills || []).some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchCompany && matchSearch;
  });

  const handleApply = async (jobId) => {
    try {
      await applyJob(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, already_applied: true } : j));
    } catch (e) { console.error(e); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
        <PageHeader title="Jobs & Internships" subtitle={`${filtered.length} opportunities available`} />

        <div className="card p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, skill, or company..." className="input pl-8 py-2 text-xs" />
            </div>
            <div className="flex gap-1">
              {JOB_TYPES.map(type => (
                <button key={type} onClick={() => setFilterType(type)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${filterType === type ? 'bg-primary-600 text-white shadow-sm' : 'btn-secondary'}`}>
                  {type}
                </button>
              ))}
            </div>
            <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="input py-2 text-xs w-40">
              <option value="">All Companies</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || filterCompany || filterType !== 'All') && (
              <button onClick={() => { setSearch(''); setFilterType('All'); setFilterCompany(''); }} className="text-xs text-red-500 hover:underline">Clear filters</button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Briefcase className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-600 dark:text-slate-400">No jobs match your filters</p>
            </div>
          ) : (
            filtered.map(job => (
              <JobCard key={job.id} job={job} onApply={handleApply} applied={job.already_applied} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
