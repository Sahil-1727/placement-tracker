export const STATUS_STYLES = {
  Applied:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Selected: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  Rejected: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

export const TYPE_BADGE = {
  Internship: 'badge-blue',
  Placement:  'badge-green',
};

export const JOB_TYPES = ['All', 'Internship', 'Placement'];

export const DOMAINS = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing',
  'Analytics', 'Consulting', 'E-Commerce', 'Other',
];

export const BRANCHES = [
  'Computer Science (CSE)', 'Information Technology (IT)',
  'Electronics & Communication (ECE)', 'Mechanical Engineering (ME)',
  'Master of Computer Applications (MCA)',
];

export function calculateSkillMatch(userSkills = [], jobSkills = []) {
  if (!jobSkills.length) return { percentage: 0, matched: [], missing: [] };
  const userSet = userSkills.map(s => s.toLowerCase());
  const matched = jobSkills.filter(s => userSet.includes(s.toLowerCase()));
  const missing = jobSkills.filter(s => !userSet.includes(s.toLowerCase()));
  return { percentage: Math.round((matched.length / jobSkills.length) * 100), matched, missing };
}

export function matchScoreColor(score) {
  if (score >= 75) return 'bg-green-400';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}
