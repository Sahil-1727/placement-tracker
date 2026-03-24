export default function StatStrip({ items }) {
  return (
    <div className={`grid grid-cols-${items.length} gap-4`}>
      {items.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="card p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
