import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 dark:bg-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs text-white">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export function ApplicationsAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="selGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-slate-700" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2.5} fill="url(#appGrad)" name="Applications" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
        <Area type="monotone" dataKey="selected" stroke="#d946ef" strokeWidth={2.5} fill="url(#selGrad)" name="Selected" dot={false} activeDot={{ r: 4, fill: '#d946ef' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AdminBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }} barSize={10} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-slate-700" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
        <Bar dataKey="students"     fill="#6366f1" radius={[4,4,0,0]} name="Students" />
        <Bar dataKey="applications" fill="#d946ef" radius={[4,4,0,0]} name="Applications" />
        <Bar dataKey="selected"     fill="#10b981" radius={[4,4,0,0]} name="Selected" />
      </BarChart>
    </ResponsiveContainer>
  );
}
