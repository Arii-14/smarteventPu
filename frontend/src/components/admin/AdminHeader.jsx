import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Sun, Moon, Shield, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../App';
import { AuthContext } from '../../context/AuthContext';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return { text: 'Selamat Pagi', emoji: '🌅' };
  if (h >= 11 && h < 15) return { text: 'Selamat Siang', emoji: '☀️' };
  if (h >= 15 && h < 18) return { text: 'Selamat Sore', emoji: '🌆' };
  return { text: 'Selamat Malam', emoji: '🌙' };
};

const AdminHeader = ({ onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, isSuperAdmin } = useContext(AuthContext);
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

  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between px-4 sm:px-6 shadow-sm shadow-slate-900/5">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-lg">{greeting.emoji}</span>
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">
              {greeting.text}, <span className="text-indigo-600 dark:text-indigo-400">{user?.username || 'Admin'}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <motion.p
              key={formattedTime}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium tabular-nums"
            >
              {formattedTime}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Tombol Beranda */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:text-indigo-600 dark:hover:text-indigo-400"
          title="Kembali ke Beranda"
        >
          <Home size={14} />
          <span className="hidden sm:inline">Beranda</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Ganti tema"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-7 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Profile */}
        <div className="hidden sm:flex items-center gap-2.5 pl-1">
          <img
            src={(() => { const p = user?.avatar || user?.photo; return p ? (p.startsWith('data:') || p.startsWith('http') || p.startsWith('blob:') ? p : `http://localhost:5000${p}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Admin')}&background=6366f1&color=fff&size=64`; })()}
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div className="hidden md:block">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">{user?.username || 'Admin'}</p>
            <div className="flex items-center gap-1">
              <Shield size={9} className="text-indigo-500" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-medium">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
