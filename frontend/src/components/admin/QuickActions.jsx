import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Tags, Users, Image, Megaphone, ChevronRight,
  Building2, CalendarDays
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const QuickActions = () => {
  const { isSuperAdmin } = useContext(AuthContext);

  const actions = [
    { label: 'Buat Acara', icon: Plus, path: '/admin/events/create', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', gradient: 'from-indigo-500 to-blue-500' },
    { label: 'Kelola Kategori', icon: Tags, path: '/admin/categories', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Lihat Peserta', icon: Users, path: '/admin/participants', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', gradient: 'from-violet-500 to-purple-500' },
    { label: 'Penyelenggara', icon: Building2, path: '/admin/organizers', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5"
    >
      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Aksi Cepat</h3>
      <div className="space-y-1.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group border border-transparent hover:border-slate-200/70 dark:hover:border-slate-700/70"
            >
              <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={15} className={action.color} />
              </div>
              <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {action.label}
              </span>
              <ChevronRight size={13} className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickActions;
