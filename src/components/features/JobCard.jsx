import { useState } from 'react';
import { MapPin, Clock, Briefcase, CheckCircle, TrendingUp } from 'lucide-react';
import { calculateSkillMatch } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import SkillMatchBar from '../ui/SkillMatchBar';

export default function JobCard({ job, onApply, applied = false }) {
  const { user } = useAuth();
  const { percentage, missing } = calculateSkillMatch(user?.skills || [], job.requiredSkills);
  const [expanded, setExpanded] = useState(false);

  const matchColor = percentage >= 75 ? 'badge-green' : percentage >= 50 ? 'badge-yellow' : 'badge-red';

  return (
    <div className="card p-5 hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className={`w-12 h-12 rounded-2xl ${job.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
          {job.logo}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{job.title}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">{job.company}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={matchColor}>{percentage}% match</span>
              <span className={job.type === 'Internship' ? 'badge-blue' : 'badge badge-purple bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}>
                {job.type}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
              <MapPin className="w-3 h-3" />{job.location}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
              <Briefcase className="w-3 h-3" />{job.stipend}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />Due {job.deadline}
            </span>
          </div>

          {/* Skills chips */}
          <div className="flex flex-wrap gap-1 mt-2">
            {job.requiredSkills.map(skill => {
              const has = (user?.skills || []).map(s => s.toLowerCase()).includes(skill.toLowerCase());
              return (
                <span key={skill} className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${has ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-400 border border-transparent'}`}>
                  {has && <CheckCircle className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />}
                  {skill}
                </span>
              );
            })}
          </div>

          {/* Skill match bar */}
          <div className="mt-3">
            <SkillMatchBar percentage={percentage} missing={missing} compact />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
          {expanded ? 'Hide details' : 'View details'}
        </button>
        <button
          onClick={() => !applied && onApply(job.id)}
          disabled={applied}
          className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all duration-200 ${applied ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default' : 'btn-primary text-xs py-1.5'}`}
        >
          {applied ? <><CheckCircle className="w-3 h-3 inline mr-1" />Applied</> : 'Apply Now'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 animate-fade-in">
          <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">{job.description}</p>
        </div>
      )}
    </div>
  );
}
