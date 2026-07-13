import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Users, TrendingUp, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return { text: 'Selamat Pagi', emoji: '🌅' };
  if (h >= 11 && h < 15) return { text: 'Selamat Siang', emoji: '☀️' };
  if (h >= 15 && h < 18) return { text: 'Selamat Sore', emoji: '🌆' };
  return { text: 'Selamat Malam', emoji: '🌙' };
};

const DashboardHero = ({ stats }) => {
  const { user } = useContext(AuthContext);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = getGreeting();

  const formattedDate = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const summaryItems = [
    { label: 'Pendaftaran Baru', value: stats?.todayRegistrations || 0, color: 'text-emerald-400', dot: 'bg-emerald-400' },
    { label: 'Acara Mendatang', value: stats?.upcomingEvents || 0, color: 'text-violet-400', dot: 'bg-violet-400' },
    { label: 'Acara Berlangsung', value: stats?.ongoingEvents || 0, color: 'text-amber-400', dot: 'bg-amber-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 sm:p-8 shadow-xl shadow-indigo-500/15"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full" />

      <div className="relative z-10">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{greeting.emoji}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {greeting.text} 👋
              </h1>
            </div>
            <p className="text-indigo-100 text-sm sm:text-base">
              Selamat datang kembali, <span className="font-semibold text-white">{user?.username || 'Admin'}</span>.
              {stats?.totalEvents > 0 && (
                <> Kamu mengelola <span className="font-semibold text-white">{stats.totalEvents}</span> acara universitas aktif.</>
              )}
            </p>
          </div>

          {/* Date & Time */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
            <p className="text-indigo-200 text-xs sm:text-sm">{formattedDate}</p>
            <p className="text-white font-mono text-lg sm:text-2xl font-bold tabular-nums tracking-wide">
              {formattedTime}
            </p>
          </div>
        </div>

        {/* Summary line */}
        <div className="mt-5 pt-5 border-t border-white/15">
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-3">Ringkasan Hari Ini</p>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            {summaryItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                <span className="text-white font-bold text-sm">{item.value}</span>
                <span className="text-indigo-200 text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHero;
