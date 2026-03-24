import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ title, message, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-sm animate-fade-in text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
          <button onClick={onConfirm} className="flex-1 text-sm py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}
