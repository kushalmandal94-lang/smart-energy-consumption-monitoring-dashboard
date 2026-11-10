import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to permanently delete this item? This action cannot be undone.',
  itemName = '',
  itemType = 'record',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-900 border border-rose-900/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="mt-2 p-2.5 bg-dark-950 border border-slate-800 rounded-xl font-mono text-xs text-rose-300">
                <span className="text-slate-500 uppercase text-[10px] block">
                  Target {itemType}:
                </span>
                <span className="font-bold">{itemName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2.5 pt-5 mt-5 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-dark-850 hover:bg-dark-800 border border-slate-800 text-slate-300 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-900/30 transition flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

