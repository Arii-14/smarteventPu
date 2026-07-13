import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, Plus, Tags, Mic2, Building2, Image,
  Users, ClipboardList, Ticket, Info, Shield, Settings, LogOut,
  ChevronLeft, ChevronRight, X, Sparkles, Home, MessageCircle
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const menuGroups = (isSuperAdmin) => [
  {
    label: 'Navigasi',
    items: [
      { name: 'Beranda', icon: Home, path: '/' },
      { name: 'Dasbor', icon: LayoutDashboard, path: '/admin' },
    ],
  },
  {
    label: 'Manajemen Acara',
    items: [
      { name: 'Acara', icon: CalendarDays, path: '/admin/events' },
      { name: 'Tambah Acara', icon: Plus, path: '/admin/events/create' },
      { name: 'Kategori', icon: Tags, path: '/admin/categories' },
      { name: 'Pembicara', icon: Mic2, path: '/admin/speakers' },
      { name: 'Penyelenggara', icon: Building2, path: '/admin/organizers' },
    ],
  },
  {
    label: 'Pendaftaran',
    items: [
      { name: 'Peserta', icon: Users, path: '/admin/participants' },
      { name: 'Pendaftaran', icon: ClipboardList, path: '/admin/registrations' },
    ],
  },
  {
    label: 'Konten',
    items: [
      { name: 'Tentang', icon: Info, path: '/admin/about-settings' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      ...(isSuperAdmin ? [{ name: 'Manajemen Pengguna', icon: Shield, path: '/admin/users' }] : []),
      { name: 'Pengaturan', icon: Settings, path: '/admin/settings' },
    ],
  },
];

const AdminSidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSuperAdmin, logout } = useContext(AuthContext);

  const groups = menuGroups(isSuperAdmin);

  const isActive = (path) => {
    if (path === '/') return false; // beranda never "active" in admin context
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    if (window.innerWidth < 1024) onClose();
    if (path === '/') {
      navigate('/');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-[70] flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-[80px]' : 'w-[280px]'}
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl
          border-r border-slate-200/70 dark:border-slate-800/70
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-20 shrink-0 border-b border-slate-200/70 dark:border-slate-800/70 ${collapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-3 group" onClick={() => handleNavClick('/admin')}>
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <Sparkles size={18} className="text-white" />
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-[17px] text-slate-900 dark:text-white tracking-tight">SmartEvent</span>
                <span className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 block -mt-0.5 tracking-wider uppercase">Panel Admin</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to="/admin" className="group" onClick={() => handleNavClick('/admin')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Sparkles size={18} className="text-white" />
              </div>
            </Link>
          )}

          {/* Collapse toggle (desktop) */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronLeft size={15} />
            </button>
          )}

          {/* Close (mobile) */}
          {!collapsed && (
            <button
              onClick={onClose}
              className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-2.5 border-b border-slate-200/70 dark:border-slate-800/70">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 custom-scrollbar">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400/80 dark:text-slate-600">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 mx-auto my-1" />}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  const isHome = item.path === '/';
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => handleNavClick(item.path)}
                      title={collapsed ? item.name : ''}
                      className={`
                        relative flex items-center gap-2.5 rounded-xl text-[13px] font-medium
                        transition-all duration-200 group overflow-hidden
                        ${collapsed ? 'justify-center px-0 py-2.5 mx-auto w-11 h-11' : 'px-3 py-2'}
                        ${isHome
                          ? 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-800/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                          : active
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/5'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }
                      `}
                    >
                      {active && !collapsed && !isHome && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon
                        size={collapsed ? 18 : 16}
                        className={`shrink-0 transition-all duration-200 ${active ? '' : 'group-hover:scale-110'}`}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                      {active && !collapsed && !isHome && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                      {isHome && !collapsed && (
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400">
                          Publik
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom — Profile & Logout */}
        <div className="shrink-0 border-t border-slate-200/70 dark:border-slate-800/70 p-2.5 space-y-1.5">
          {/* Profile */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
              <img
                src={(() => { const p = user?.avatar || user?.photo; return p ? (p.startsWith('data:') || p.startsWith('http') || p.startsWith('blob:') ? p : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${p}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Admin')}&background=6366f1&color=fff&size=64`; })()}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{user?.username || 'Admin'}</p>
                <div className="flex items-center gap-1">
                  <Shield size={9} className="text-indigo-500 shrink-0" />
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed avatar */}
          {collapsed && (
            <div className="flex justify-center py-1">
              <img
                src={(() => { const p = user?.avatar || user?.photo; return p ? (p.startsWith('data:') || p.startsWith('http') || p.startsWith('blob:') ? p : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${p}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Admin')}&background=6366f1&color=fff&size=64`; })()}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            </div>
          )}

          {/* Hubungi Pengelola Data */}
          <a
            href="https://wa.me/6281396368305"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'Hubungi Pengelola Data' : ''}
            className={`
              flex w-full items-center gap-2.5 rounded-xl text-[13px] font-medium
              text-emerald-600 dark:text-emerald-400
              hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group
              ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'}
            `}
          >
            <MessageCircle size={16} className="shrink-0 group-hover:-translate-y-0.5 transition-transform" />
            {!collapsed && <span>Hubungi Pengelola Data</span>}
          </a>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Keluar' : ''}
            className={`
              flex w-full items-center gap-2.5 rounded-xl text-[13px] font-medium
              text-rose-500 dark:text-rose-400
              hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group
              ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'}
            `}
          >
            <LogOut size={16} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
