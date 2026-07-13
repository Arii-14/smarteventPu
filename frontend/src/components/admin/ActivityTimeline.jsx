import React from 'react';
import { motion } from 'framer-motion';
import { Activity, UserPlus, Image, FileEdit, XCircle } from 'lucide-react';

const ActivityTimeline = ({ activities = [] }) => {
  // If activities array is empty or undefined, use some dummy data for visual completion
  // Ideally this comes from the backend.
  const displayActivities = activities.length > 0 ? activities : [
    { id: 1, type: 'register', user: 'Budi Santoso', target: 'Seminar Nasional AI', time: '10 menit lalu', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { id: 2, type: 'event', user: 'Admin', target: 'Workshop ReactJS', action: 'membuat acara baru', time: '1 jam lalu', icon: FileEdit, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { id: 3, type: 'gallery', user: 'Admin', target: 'Dies Natalis', action: 'mengunggah 5 foto ke', time: '3 jam lalu', icon: Image, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { id: 4, type: 'cancel', user: 'Siti Aminah', target: 'Kompetisi UI/UX', action: 'membatalkan pendaftaran', time: 'Kemarin', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Activity size={14} className="text-slate-600 dark:text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Aktivitas Sistem</h3>
      </div>

      <div className="relative pl-3 space-y-5 before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
        {displayActivities.map((act, i) => {
          const Icon = act.icon || UserPlus;
          return (
            <div key={act.id} className="relative flex gap-4 items-start">
              <div className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${act.bg} z-10 top-1.5`} />
              
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ml-2 ${act.bg}`}>
                <Icon size={14} className={act.color} />
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug">
                  <span className="font-semibold text-slate-900 dark:text-white">{act.user}</span>{' '}
                  {act.action || 'mendaftar ke'}{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">{act.target}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{act.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ActivityTimeline;
