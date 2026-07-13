import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Trash2, UserCheck, UserX, Shield, MoreVertical, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Dropdown aksi per baris pengguna
const ActionMenu = ({ user: targetUser, onPromote, onDemote, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Aksi"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
          {targetUser.role === 'admin' ? (
            <button
              onClick={() => { onDemote(targetUser); setOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              <UserX size={15} />
              Turunkan jadi User
            </button>
          ) : targetUser.role === 'user' ? (
            <button
              onClick={() => { onPromote(targetUser); setOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
            >
              <UserCheck size={15} />
              Jadikan Admin
            </button>
          ) : null}
          <div className="h-px bg-slate-100 dark:bg-slate-700" />
          <button
            onClick={() => { onDelete(targetUser); setOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={15} />
            Hapus Pengguna
          </button>
        </div>
      )}
    </div>
  );
};

const AdminUsers = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ text: '', type: '' });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', target: null });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setAdmins(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      showToast('Gagal memuat daftar pengguna.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = (target) => {
    setConfirmModal({ open: true, type: 'promote', target });
  };

  const handleDemote = (target) => {
    setConfirmModal({ open: true, type: 'demote', target });
  };

  const handleDelete = (target) => {
    setConfirmModal({ open: true, type: 'delete', target });
  };

  const confirmAction = async () => {
    const { type, target } = confirmModal;
    setConfirmModal({ open: false, type: '', target: null });

    try {
      if (type === 'promote') {
        await api.put(`/users/${target.id}/role`, { role: 'admin' });
        setAdmins(prev => prev.map(a => a.id === target.id ? { ...a, role: 'admin' } : a));
        showToast(`${target.username} berhasil dijadikan Admin.`);
      } else if (type === 'demote') {
        await api.put(`/users/${target.id}/role`, { role: 'user' });
        setAdmins(prev => prev.map(a => a.id === target.id ? { ...a, role: 'user' } : a));
        showToast(`${target.username} berhasil dijadikan User Biasa.`);
      } else if (type === 'delete') {
        await api.delete(`/users/${target.id}`);
        setAdmins(prev => prev.filter(a => a.id !== target.id));
        showToast(`Pengguna ${target.username} berhasil dihapus.`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal melakukan aksi.', 'error');
    }
  };

  const filtered = admins.filter(a =>
    a.username?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.kampus?.toLowerCase().includes(search.toLowerCase()) ||
    a.university?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAvatarSrc = (user) => {
    const raw = user.photo;
    if (!raw) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'A')}&background=7c3aed&color=fff&bold=true&size=80`;
    if (raw.startsWith('data:') || raw.startsWith('http')) return raw;
    return `http://localhost:5000${raw}`;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast */}
      {toast.text && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 border border-emerald-500/40 text-emerald-300'
            : 'bg-rose-900/90 border border-rose-500/40 text-rose-300'
        }`} style={{ backdropFilter: 'blur(16px)', minWidth: '260px' }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-sky-500 rounded-full" />
            Manajemen Pengguna
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Hanya Super Admin yang dapat mengelola daftar pengguna dan admin.
          </p>
        </div>
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10">
            <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{admins.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Pengguna</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
            <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{admins.filter(a => a.is_verified).length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pengguna Terverifikasi</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="gradient-border p-[1.5px] rounded-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pengguna</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kampus</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Terdaftar</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filtered.map(admin => (
                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarSrc(admin)}
                            alt={admin.username}
                            className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-500/30"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{admin.username}</p>
                            <p className="text-xs text-slate-400">{admin.prodi || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${admin.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {admin.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-sm">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-sm">
                        {admin.kampus || admin.university || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(admin.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          admin.is_verified
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        }`}>
                          {admin.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionMenu
                          user={admin}
                          onPromote={handlePromote}
                          onDemote={handleDemote}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-14 text-center text-slate-400">
                        <Shield size={36} className="mx-auto mb-3 opacity-30" />
                        <p>Tidak ada pengguna yang ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className={`p-5 ${confirmModal.type === 'delete' ? 'bg-rose-50 dark:bg-rose-500/10' : confirmModal.type === 'promote' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
              <h3 className={`font-bold text-lg ${confirmModal.type === 'delete' ? 'text-rose-700 dark:text-rose-400' : confirmModal.type === 'promote' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {confirmModal.type === 'delete' ? '🗑️ Hapus Pengguna' : confirmModal.type === 'promote' ? '⬆️ Jadikan Admin' : '⬇️ Turunkan Role'}
              </h3>
            </div>
            <div className="p-5">
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                {confirmModal.type === 'delete'
                  ? `Apakah Anda yakin ingin menghapus akun pengguna `
                  : `Apakah Anda yakin ingin mengubah role `
                }
                <strong>{confirmModal.target?.username}</strong>
                {confirmModal.type === 'promote' ? ' menjadi Admin?' : confirmModal.type === 'demote' ? ' menjadi User Biasa?' : '?'}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {confirmModal.type === 'delete'
                  ? 'Akun ini akan dihapus permanen dari database.'
                  : confirmModal.type === 'promote' ? 'Pengguna ini akan diberikan akses ke panel admin.' : 'Admin ini tidak akan dapat mengakses panel admin lagi.'}
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setConfirmModal({ open: false, type: '', target: null })}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 py-2.5 rounded-xl text-white font-medium text-sm transition-colors ${
                    confirmModal.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : confirmModal.type === 'promote' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {confirmModal.type === 'delete' ? 'Ya, Hapus' : confirmModal.type === 'promote' ? 'Ya, Jadikan' : 'Ya, Turunkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
