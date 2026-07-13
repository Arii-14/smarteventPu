import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, CheckCircle, FileText, Archive,
  Users, ClipboardList, Building2, Tags
} from 'lucide-react';

const cards = (stats) => [
  {
    label: 'Total Acara',
    value: stats.totalEvents || 0,
    icon: CalendarDays,
    gradient: 'from-indigo-500 to-blue-500',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    trend: 'Total',
  },
  {
    label: 'Acara Terbit',
    value: stats.publishedEvents || 0,
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    trend: 'Terbit',
  },
  {
    label: 'Acara Draf',
    value: stats.draftEvents || 0,
    icon: FileText,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    trend: 'Draf',
  },
  {
    label: 'Diarsipkan',
    value: stats.archivedEvents || 0,
    icon: Archive,
    gradient: 'from-slate-400 to-slate-500',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    trend: 'Arsip',
  },
  {
    label: 'Total Peserta',
    value: stats.activeUsers || 0,
    icon: Users,
    gradient: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    trend: 'Pengguna',
  },
  {
    label: 'Pendaftaran Hari Ini',
    value: stats.todayRegistrations || 0,
    icon: ClipboardList,
    gradient: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    trend: 'Hari ini',
  },
  {
    label: 'Penyelenggara',
    value: stats.totalOrganizers || 0,
    icon: Building2,
    gradient: 'from-sky-500 to-cyan-500',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    trend: 'Aktif',
  },
  {
    label: 'Kategori',
    value: stats.totalCategories || 0,
    icon: Tags,
    gradient: 'from-fuchsia-500 to-pink-500',
    bgLight: 'bg-fuchsia-50',
    bgDark: 'dark:bg-fuchsia-500/10',
    text: 'text-fuchsia-600 dark:text-fuchsia-400',
    trend: 'Total',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
};

const StatCards = ({ stats }) => {
  const items = cards(stats);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
    >
      {items.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative group bg-white dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800/70 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors cursor-default overflow-hidden"
          >
            {/* Gradient glow on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06] transition-opacity rounded-2xl`} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bgLight} ${card.bgDark} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={18} className={card.text} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${card.bgLight} ${card.bgDark} ${card.text}`}>
                  {card.trend}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums mb-0.5">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatCards;
