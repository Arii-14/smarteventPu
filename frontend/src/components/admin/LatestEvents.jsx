import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Eye, ArrowRight, Zap, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusBadge = (status) => {
  const map = {
    published: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    draft: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    archived: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };
  return map[status] || map.draft;
};

const statusLabel = (status) => ({ published: 'Terbit', draft: 'Draf', archived: 'Arsip' }[status] || status);

const visibilityBadge = (visibility) => {
  return visibility === 'private' 
    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400';
};

const LatestEvents = ({ events = [] }) => {
  // Only take latest 3 for the dashboard widget
  const latestEvents = events.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden flex flex-col h-full"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Zap size={14} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Acara Terbaru</h3>
          </div>
        </div>
        <Link to="/admin/events" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group transition-colors">
          Semua <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {latestEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
            <CalendarDays size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Belum ada acara</p>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/70">
          {latestEvents.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
              <div className="relative shrink-0 overflow-hidden rounded-xl h-12 w-16 border border-slate-200/70 dark:border-slate-700/70">
                <img
                  src={ev.banner ? (ev.banner.startsWith('http') || ev.banner.startsWith('data:') ? ev.banner : `http://localhost:5000${ev.banner.startsWith('/') ? '' : '/'}${ev.banner}`) : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format'}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {ev.title}
                </p>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <MapPin size={10} /> {ev.location?.split(',')[0] || 'TBD'}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <Users size={10} /> {ev.participants || 0}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBadge(ev.status)}`}>
                  {statusLabel(ev.status)}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${visibilityBadge(ev.visibility)}`}>
                  {ev.visibility === 'public' ? 'Publik' : 'Privat'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LatestEvents;
