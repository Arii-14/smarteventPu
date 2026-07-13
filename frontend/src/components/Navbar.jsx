import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Menu, X, UserCircle, LogOut, Settings,
  Heart, LayoutDashboard, Trash2, ChevronDown, AlertTriangle
} from 'lucide-react';
import { ThemeContext } from '../App';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/users/me');
      logout();
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus akun. Coba lagi.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Acara', path: '/events' },
    { name: 'Tentang', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const rawPhoto = user?.avatar || user?.photo;
  const avatarSrc = rawPhoto
    ? (rawPhoto.startsWith('data:') || rawPhoto.startsWith('http') || rawPhoto.startsWith('blob:'))
      ? rawPhoto                                          // Base64, https, or blob — pakai langsung
      : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${rawPhoto}`               // path relatif server /uploads/...
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=6366f1&color=fff&size=64`;

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/5 py-2.5 border-b border-slate-200/50 dark:border-slate-800/50'
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/upu.png"
                alt="SmartEventPU"
                className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                SmartEvent<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500">PU</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {isActive(link.path) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none transition-all hover:scale-110"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {isAuthenticated ? (
                /* ─── Profile Dropdown ─────────────────────────────────── */
                <div className="relative" ref={profileRef}>
                  <button
                    id="profile-btn"
                    onClick={() => setProfileOpen(prev => !prev)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group focus:outline-none"
                  >
                    <img src={avatarSrc} alt="Profile" className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/30" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[80px] truncate hidden lg:block">
                      {user?.username}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                      >
                        {/* User Header */}
                        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.username}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                        </div>

                        <div className="py-1.5">
                          {(isAdmin || isSuperAdmin) && (
                            <Link
                              to="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                            >
                              <LayoutDashboard size={16} />
                              Dashboard Admin
                            </Link>
                          )}

                          <Link
                            to="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
                          >
                            <Settings size={16} />
                            Pengaturan Profil
                          </Link>

                          <Link
                            to="/favorites"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
                          >
                            <Heart size={16} />
                            Favorit Saya
                          </Link>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 py-1.5">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                          >
                            <LogOut size={16} />
                            Keluar
                          </button>

                          {user?.role !== 'super_admin' && (
                            <button
                              onClick={() => { setProfileOpen(false); setShowDeleteModal(true); }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-400 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                            >
                              <Trash2 size={16} />
                              Hapus Akun Saya
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ─── Masuk / Daftar (Combined) ───────────────────────── */
                <Link
                  to="/login"
                  id="auth-btn"
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300"
                >
                  <UserCircle size={16} />
                  Masuk / Daftar
                </Link>
              )}
            </div>

            {/* Mobile Buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {isAuthenticated && (
                <img src={avatarSrc} alt="Profile" className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/30" />
              )}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Mobile Menu ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive(link.path)
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
                      <img src={avatarSrc} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                    </div>
                    {(isAdmin || isSuperAdmin) && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                        <LayoutDashboard size={16} /> Dashboard Admin
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <Settings size={16} /> Pengaturan Profil
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <Heart size={16} /> Favorit Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                    {user?.role !== 'super_admin' && (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                      >
                        <Trash2 size={16} /> Hapus Akun Saya
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 transition-all shadow-md shadow-indigo-500/25"
                    >
                      <UserCircle size={16} />
                      Masuk / Daftar
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Delete Account Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleteLoading && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 mx-auto mb-4">
                  <AlertTriangle size={26} className="text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">Hapus Akun?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  Akun Anda akan <span className="font-semibold text-rose-600 dark:text-rose-400">dihapus permanen</span>. Semua data pendaftaran dan favorit akan hilang. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Menghapus...</>
                  ) : (
                    <>🗑️ Hapus Akun</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
