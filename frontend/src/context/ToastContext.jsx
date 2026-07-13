import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const ICONS = {
  success: <CheckCircle size={18} className="text-emerald-400" />,
  error: <XCircle size={18} className="text-rose-400" />,
  warning: <AlertTriangle size={18} className="text-amber-400" />,
  info: <Info size={18} className="text-sky-400" />,
};

const BORDERS = {
  success: 'border-emerald-500/40',
  error: 'border-rose-500/40',
  warning: 'border-amber-500/40',
  info: 'border-sky-500/40',
};

const GLOWS = {
  success: 'shadow-emerald-500/20',
  error: 'shadow-rose-500/20',
  warning: 'shadow-amber-500/20',
  info: 'shadow-sky-500/20',
};

const BAR_COLORS = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
};

function ToastItem({ toast, onRemove }) {
  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl
        bg-slate-900/80 ${BORDERS[toast.type]} shadow-xl ${GLOWS[toast.type]}
        animate-slide-in-right min-w-[280px] max-w-[380px] overflow-hidden`}
      style={{ animation: 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] ${BAR_COLORS[toast.type]} rounded-full`}
        style={{
          animation: `shrinkBar ${toast.duration || 4000}ms linear forwards`,
        }}
      />
      <div className="mt-0.5 shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
        )}
        <p className={`text-xs leading-relaxed ${toast.title ? 'text-slate-400 mt-0.5' : 'text-white/90'}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 mt-0.5 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((type, message, options = {}) => {
    const id = ++toastId;
    const duration = options.duration ?? 4000;
    setToasts(prev => [...prev, { id, type, message, title: options.title, duration }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const toast = {
    success: (msg, opts) => add('success', msg, opts),
    error: (msg, opts) => add('error', msg, opts),
    warning: (msg, opts) => add('warning', msg, opts),
    info: (msg, opts) => add('info', msg, opts),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(120%) scale(0.9); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes shrinkBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
