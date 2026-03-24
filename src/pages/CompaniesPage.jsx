import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal';
import StatStrip from '../components/ui/StatStrip';
import { getCompanies, addCompany, updateCompany, deleteCompany } from '../services/api';
import { DOMAINS } from '../utils/helpers';
import { Building2, Plus, Search, Pencil, Trash2, X, Globe, Mail, Phone, Briefcase, Users } from 'lucide-react';

function CompanyModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial ?? { name: '', domain: '', website: '', contactEmail: '', contactPhone: '', roles: 1, openings: 1, requiredSkills: '' }
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skills = typeof form.requiredSkills === 'string'
      ? form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      : form.requiredSkills;
    await onSave({ ...form, requiredSkills: skills }, initial);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-base">{isEdit ? 'Edit Company' : 'Add Company'}</h2>
          <button onClick={onClose} className="btn-ghost p-1 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Company Name *</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Google" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Domain / Industry</label>
              <select className="input" value={form.domain} onChange={set('domain')}>
                <option value="">Select domain</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Website</label>
              <input className="input" value={form.website} onChange={set('website')} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Contact Email</label>
              <input type="email" className="input" value={form.contactEmail} onChange={set('contactEmail')} placeholder="hr@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Contact Phone</label>
              <input className="input" value={form.contactPhone} onChange={set('contactPhone')} placeholder="+91 9000000000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">No. of Roles</label>
              <input type="number" min="1" className="input" value={form.roles} onChange={set('roles')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Total Openings</label>
              <input type="number" min="1" className="input" value={form.openings} onChange={set('openings')} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Required Skills (comma-separated)</label>
              <input className="input" value={Array.isArray(form.requiredSkills) ? form.requiredSkills.join(', ') : form.requiredSkills}
                onChange={set('requiredSkills')} placeholder="React, Node.js, SQL" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button type="submit" className="btn-primary flex-1 text-sm py-2">{isEdit ? 'Save Changes' : 'Add Company'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies]       = useState([]);
  const [search, setSearch]             = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [modal, setModal]               = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getCompanies().then(r => setCompanies(r.data)).catch(console.error);
  }, []);

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.domain?.toLowerCase().includes(q))
      && (!domainFilter || c.domain === domainFilter);
  });

  const handleSave = async (data, editTarget) => {
    try {
      if (!editTarget) {
        const res = await addCompany(data);
        setCompanies(prev => [...prev, res.data]);
      } else {
        const res = await updateCompany(editTarget.id, data);
        setCompanies(prev => prev.map(c => c.id === editTarget.id ? res.data : c));
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    try {
      await deleteCompany(deleteTarget.id);
      setCompanies(prev => prev.filter(c => c.id !== deleteTarget.id));
    } catch (e) { console.error(e); }
    setDeleteTarget(null);
  };

  const statItems = [
    { icon: Building2, label: 'Total Companies', value: companies.length, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { icon: Briefcase, label: 'Total Roles',     value: companies.reduce((s, c) => s + Number(c.roles || 0), 0), color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-50 dark:bg-accent-900/20' },
    { icon: Users,     label: 'Total Openings',  value: companies.reduce((s, c) => s + Number(c.openings || 0), 0), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <DashboardLayout hideRight>
      <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
        <PageHeader
          title="Companies"
          subtitle="Manage registered partner companies"
          action={
            <button onClick={() => setModal('add')} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Company
            </button>
          }
        />

        <StatStrip items={statItems} />

        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..."
              className="input pl-8 py-2 text-xs" />
          </div>
          <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="input py-2 text-xs w-40">
            <option value="">All Domains</option>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(search || domainFilter) && (
            <button onClick={() => { setSearch(''); setDomainFilter(''); }} className="text-xs text-red-500 hover:underline">Clear</button>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  {['Company', 'Domain', 'Contact', 'Roles', 'Openings', 'Skills', 'Actions'].map(h => (
                    <th key={h} className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide text-left py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{c.name}</p>
                          {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-[10px] text-primary-500 hover:underline flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> Website</a>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="badge badge-blue text-[10px]">{c.domain || '—'}</span></td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {c.contactEmail && <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-slate-400"><Mail className="w-2.5 h-2.5" />{c.contactEmail}</div>}
                        {c.contactPhone && <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-slate-400"><Phone className="w-2.5 h-2.5" />{c.contactPhone}</div>}
                        {!c.contactEmail && !c.contactPhone && <span className="text-[10px] text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-800 dark:text-slate-200">{c.roles}</td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-800 dark:text-slate-200">{c.openings}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-0.5">
                        {(c.requiredSkills || []).slice(0, 3).map(sk => (
                          <span key={sk} className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-[9px] font-medium rounded-full">{sk}</span>
                        ))}
                        {(c.requiredSkills || []).length > 3 && <span className="text-[9px] text-gray-400">+{c.requiredSkills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal(c)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">No companies found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(modal === 'add' || (modal && modal !== 'add')) && (
        <CompanyModal
          initial={modal === 'add' ? undefined : { ...modal, requiredSkills: (modal.requiredSkills || []).join(', ') }}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Company"
          message={<>Are you sure you want to remove <span className="font-semibold text-gray-800 dark:text-slate-200">{deleteTarget.name}</span>? This cannot be undone.</>}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </DashboardLayout>
  );
}
