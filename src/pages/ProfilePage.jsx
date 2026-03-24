import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import { Save, Plus, X, User, Code, BookOpen } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { BRANCHES } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', branch: '', bio: '', phone: '',
    linkedin: '', github: '', graduation: '', skillInput: '', skills: []
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    else if (form.name.trim().length > 100) errs.name = 'Name must be under 100 characters.';
    else if (!/^[a-zA-Z\s.'-]+$/.test(form.name.trim())) errs.name = 'Name can only contain letters, spaces, dots, hyphens.';

    if (form.phone) {
      const digits = form.phone.replace(/[\s\-+()]/g, '');
      if (!/^\d+$/.test(digits)) errs.phone = 'Phone must contain only digits (spaces, +, - allowed).';
      else if (digits.length !== 10) errs.phone = 'Phone must be exactly 10 digits.';
    }

    if (form.graduation) {
      const yr = parseInt(form.graduation, 10);
      if (!/^\d{4}$/.test(form.graduation)) errs.graduation = 'Enter a valid 4-digit year.';
      else if (yr < 2000 || yr > 2035) errs.graduation = 'Year must be between 2000 and 2035.';
    }

    if (form.linkedin && form.linkedin.trim()) {
      if (!/linkedin\.com/i.test(form.linkedin)) errs.linkedin = 'Must be a valid LinkedIn URL (linkedin.com/...)';
      else if (form.linkedin.length > 200) errs.linkedin = 'URL too long (max 200 chars).';
    }

    if (form.github && form.github.trim()) {
      if (!/github\.com/i.test(form.github)) errs.github = 'Must be a valid GitHub URL (github.com/...)';
      else if (form.github.length > 200) errs.github = 'URL too long (max 200 chars).';
    }

    if (form.bio && form.bio.length > 500) errs.bio = `Bio too long (${form.bio.length}/500 chars).`;

    if (form.skills.length > 20) errs.skills = 'Maximum 20 skills allowed.';

    return errs;
  };

  useEffect(() => {
    getProfile().then(r => {
      const d = r.data;
      setForm(f => ({ ...f, name: d.name || '', email: d.email || '', branch: d.branch || '',
        bio: d.bio || '', phone: d.phone || '', linkedin: d.linkedin || '',
        github: d.github || '', graduation: d.graduation || '', skills: d.skills || [] }));
    }).catch(console.error);
  }, []);

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (!s) return;
    if (s.length > 30) { setFieldErrors(e => ({ ...e, skills: 'Skill name too long (max 30 chars).' })); return; }
    if (form.skills.length >= 20) { setFieldErrors(e => ({ ...e, skills: 'Maximum 20 skills allowed.' })); return; }
    if (!form.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())) {
      setForm({ ...form, skills: [...form.skills, s], skillInput: '' });
      setFieldErrors(e => ({ ...e, skills: '' }));
    } else {
      setForm({ ...form, skillInput: '' });
    }
  };

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) });

  const handleSave = async () => {
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Please fix the errors below before saving.');
      return;
    }
    setFieldErrors({});
    try {
      const { skillInput, ...payload } = form;
      const res = await updateProfile(payload);
      const updated = res.data;
      setForm(f => ({ ...f, ...updated, skillInput: '', skills: updated.skills || [] }));
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Failed to save profile. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <PageHeader
          title="My Profile"
          action={<button onClick={handleSave} className="btn-primary flex items-center gap-1.5 text-sm"><Save className="w-4 h-4" />{saved ? '✓ Saved!' : 'Save Profile'}</button>}
        />

        {saved && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
            <span className="text-base">✓</span> Profile saved successfully!
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <span className="text-base">✕</span> {error}
          </div>
        )}

        <div className="card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-glow flex-shrink-0">
            {form.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white">{form.name || 'Your Name'}</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{form.email}</p>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-400 dark:text-slate-500">Profile Strength</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{user?.profileCompletion || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700" style={{ width: `${user?.profileCompletion || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2"><User className="w-4 h-4 text-primary-500" />Personal Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Full Name *</label>
                  <input className={`input ${fieldErrors.name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.name} maxLength={100}
                    onChange={e => setForm({...form, name: e.target.value})} placeholder="Rahul Sharma" />
                  {fieldErrors.name && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Branch</label>
                  <select className="input" value={form.branch} onChange={e => setForm({...form, branch: e.target.value})}>
                    <option value="">Select branch</option>
                    {['CSE','IT','ECE','Mechanical','Civil','MCA','MBA','BCA'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Phone</label>
                  <input className={`input ${fieldErrors.phone ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.phone} maxLength={10}
                    onChange={e => setForm({...form, phone: e.target.value.replace(/[^\d]/g, '')})} placeholder="9000000000" />
                  {fieldErrors.phone && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Graduation Year</label>
                  <input className={`input ${fieldErrors.graduation ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.graduation} maxLength={4}
                    onChange={e => setForm({...form, graduation: e.target.value.replace(/\D/g, '')})} placeholder="2025" />
                  {fieldErrors.graduation && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.graduation}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">LinkedIn</label>
                  <input className={`input ${fieldErrors.linkedin ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.linkedin} maxLength={200}
                    onChange={e => setForm({...form, linkedin: e.target.value})} placeholder="linkedin.com/in/yourname" />
                  {fieldErrors.linkedin && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.linkedin}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">GitHub</label>
                  <input className={`input ${fieldErrors.github ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.github} maxLength={200}
                    onChange={e => setForm({...form, github: e.target.value})} placeholder="github.com/yourusername" />
                  {fieldErrors.github && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.github}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                  Bio <span className="font-normal text-gray-400">({form.bio.length}/500)</span>
                </label>
                <textarea className={`input resize-none ${fieldErrors.bio ? 'border-red-400 focus:ring-red-400' : ''}`} rows={3}
                  value={form.bio} maxLength={500}
                  onChange={e => setForm({...form, bio: e.target.value})} placeholder="A short bio about yourself..." />
                {fieldErrors.bio && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.bio}</p>}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2 mb-4"><Code className="w-4 h-4 text-primary-500" />Skills</h3>
              <div className="flex gap-2 mb-3">
                <input className="input flex-1 text-sm" value={form.skillInput}
                  onChange={e => setForm({...form, skillInput: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter..." />
                <button onClick={addSkill} className="btn-primary flex items-center gap-1 text-sm px-3">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full border border-primary-100 dark:border-primary-800">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-primary-400 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {form.skills.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500">No skills added yet</p>}
              </div>
              {fieldErrors.skills && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.skills}</p>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-3">Profile Tips</h3>
            <div className="space-y-2">
              {[
                { done: !!form.name, tip: 'Add your full name' },
                { done: !!form.branch, tip: 'Select your branch' },
                { done: form.skills.length >= 3, tip: 'Add at least 3 skills' },
                { done: !!form.bio, tip: 'Write a short bio' },
                { done: !!form.phone, tip: 'Add phone number' },
                { done: !!form.linkedin, tip: 'Add LinkedIn profile' },
              ].map((t, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${t.done ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.done ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-slate-500'}`}>
                    {t.done && <span className="text-white text-[8px]">✓</span>}
                  </div>
                  {t.tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
