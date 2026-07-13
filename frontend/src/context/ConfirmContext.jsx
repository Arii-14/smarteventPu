import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Trash2, LogOut, CheckCircle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

const ICONS = {
  danger:  <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center"><Trash2 size={26} className="text-rose-400" /></div>,
  warning: <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center"><AlertTriangle size={26} className="text-amber-400" /></div>,
  success: <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center"><CheckCircle size={26} className="text-emerald-400" /></div>,
  info:    <div className="w-14 h-14 rounded-2xl bg-sky-500/15 flex items-center justify-center"><AlertTriangle size={26} className="text-sky-400" /></div>,
};

const CONFIRM_BTN = {
  danger:  'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
  warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
  info:    'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30',
};

function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  const variant = dialog.variant || 'danger';
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ animation: 'fadeInBackdrop 0.2s ease forwards' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6"
        style={{ animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {ICONS[variant]}

          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {dialog.title || 'Konfirmasi'}
            </h3>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              {dialog.message || 'Apakah Anda yakin ingin melanjutkan?'}
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              {dialog.cancelLabel || 'Batal'}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 ${CONFIRM_BTN[variant]}`}
            >
              {dialog.confirmLabel || 'Ya, Lanjutkan'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = React.useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog(typeof options === 'string' ? { message: options } : options);
    });
  }, []);

  const handleConfirm = () => {
    resolverRef.current?.(true);
    setDialog(null);
  };

  const handleCancel = () => {
    resolverRef.current?.(false);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <ConfirmDialog dialog={dialog} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}
