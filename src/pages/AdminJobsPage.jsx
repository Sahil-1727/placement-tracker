import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal';
import StatStrip from '../components/ui/StatStrip';
import { getCompanies, createJob, updateJob, deleteJob } from '../services/api';
import { TYPE_BADGE, JOB_TYPES } from '../utils/helpers';
import api from '../services/api';
import { Briefcase, Plus, Search, Pencil, Trash2, X, MapPin, Calendar, DollarSign, Users, Laptop, ClipboardList } from 'lucide-react';

function JobModal({ initial, companies, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ?? {
    title: '', company: '', type: 'Internship', location: '', stipend: '',
    deadline: '', requiredSkills: '', description: ''
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const skills = typeof form.requiredSkills === 'string'
      ? form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      : form.requiredSkills;
    onSave({ ...form, requiredSkills: skills }, initial);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card p-6 w-full max-w-lg animate-fade-in my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-base">{isEdit ? 'Edit Job Listing' : 'Post New Job'}</h2>
          <button onClick={onClose} className="btn-ghost p-1 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Job Title *</label>
              <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Frontend Developer Intern" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Company *</label>
              <select className="input" value={form.company} onChange={set('company')} required>
                <option value="">Select company</option>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Type</label>
              <select className="input" value={form.type} onChange={set('type')}>
                {['Internship', 'Placement'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Stipend / CTC</label>
              <input className="input" value={form.stipend} onChange={set('stipend')} placeholder="15000 or 6.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Required Skills (comma-separated)</label>
              <input className="input" value={Array.isArray(form.requiredSkills) ? form.requiredSkills.join(', ') : form.requiredSkills}
                onChange={set('requiredSkills')} placeholder="React, Node.js, SQL" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button type="submit" className="btn-primary flex-1 text-sm py-2">{isEdit ? 'Save Changes' : 'Post Job'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs]             = useState([]);
  const [companies, setCompanies]   = useState([]);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modal, setModal]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    api.get('/jobs/').then(r => setJobs(r.data)).catch(console.error);
    getCompanies().then(r => setCompanies(r.data)).catch(console.error);
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return (!q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q))
      && (typeFilter === 'All' || j.type === typeFilter);
  });

  const handleSave = async (data, editTarget) => {
    try {
      if (!editTarget) {
        const res = await createJob(data);
        setJobs(prev => [...prev, res.data]);
      } else {
        const res = await updateJob(editTarget.id, data);
        setJobs(prev => prev.map(j => j.id === editTarget.id ? res.data : j));
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(deleteTarget.id);
      setJobs(prev => prev.filter(j => j.id !== deleteTarget.id));
    } catch (e) { console.error(e); }
    setDeleteTarget(null);
  };

  const statItems = [
    { icon: ClipboardList, label: 'Total Listings', value: jobs.length, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { icon: Laptop,        label: 'Internships',    value: jobs.filter(j => j.type === 'Internship').length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Users,         label: 'Placements',     value: jobs.filter(j => j.type === 'Placement').length,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <DashboardLayout hideRight>
      <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
        <PageHeader
          title="Job Listings"
          subtitle="Manage and post job opportunities"
          action={
            <button onClick={() => setModal('add')} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Post Job
            </button>
          }
        />

        <StatStrip items={statItems} />

        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or company..."
              className="input pl-8 py-2 text-xs" />
          </div>
          <div className="flex gap-1">
            {JOB_TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${typeFilter === t ? 'bg-primary-600 text-white shadow-sm' : 'btn-secondary'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  {['Job', 'Type', 'Location', 'Stipend / CTC', 'Deadline', 'Skills', 'Actions'].map(h => (
                    <th key={h} className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide text-left py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(j => (
                  <tr key={j.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {j.logo || j.company?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{j.title}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500">{j.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className={`${TYPE_BADGE[j.type] || 'badge-gray'} badge text-[10px]`}>{j.type}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400"><MapPin className="w-3 h-3" />{j.location || '—'}</div></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-1 text-xs font-medium text-gray-800 dark:text-slate-200"><DollarSign className="w-3 h-3 text-gray-400" />{j.stipend}</div></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-slate-400"><Calendar className="w-3 h-3" />{j.deadline || '—'}</div></td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-0.5">
                        {(j.requiredSkills || []).slice(0, 3).map(sk => (
                          <span key={sk} className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-[9px] font-medium rounded-full">{sk}</span>
                        ))}
                        {(j.requiredSkills || []).length > 3 && <span className="text-[9px] text-gray-400">+{j.requiredSkills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ ...j, requiredSkills: (j.requiredSkills || []).join(', ') })} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(j)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">No job listings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(modal === 'add' || (modal && modal !== 'add')) && (
        <JobModal initial={modal === 'add' ? undefined : modal} companies={companies}
          onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Job Listing"
          message={<>Remove <span className="font-semibold text-gray-800 dark:text-slate-200">{deleteTarget.title}</span> at {deleteTarget.company}?</>}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </DashboardLayout>
  );
}
