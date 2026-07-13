import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, MoreVertical, Trash2, XCircle, Ban, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// Format tanggal ke WIB (Asia/Jakarta)
const formatWIB = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
};

// Dropdown titik-3 per baris
const ActionMenu = ({ reg, onDelete, onReject, onCancelReg }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
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
        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Batalkan Pendaftaran */}
          {reg.status === 'registered' && (
            <>
              <button
                onClick={() => { onCancelReg(reg); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
              >
                <XCircle size={15} />
                Batalkan Pendaftaran
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700" />
            </>
          )}
          {/* Tolak Akun (hanya jika ada user_id, bukan tamu) */}
          {reg.user_id && (
            <>
              <button
                onClick={() => { onReject(reg); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Ban size={15} />
                Tolak Akun User
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700" />
            </>
          )}
          {/* Hapus Pendaftaran */}
          <button
            onClick={() => { onDelete(reg); setOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Trash2 size={15} />
            Hapus Data Pendaftaran
          </button>
        </div>
      )}
    </div>
  );
};

// Modal Tolak + Alasan
const RejectModal = ({ reg, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(reg, reason.trim());
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border-b border-rose-100 dark:border-rose-500/20">
          <h3 className="font-bold text-lg text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <Ban size={18} /> Tolak Akun User
          </h3>
          <p className="text-xs text-rose-500 dark:text-rose-400/70 mt-1">
            Akun <strong>{reg.user}</strong> akan dihapus dan email pemberitahuan akan dikirim.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Alasan Penolakan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Jelaskan alasan penolakan akun ini..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim & Tolak Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal konfirmasi hapus / batal pendaftaran
const ConfirmModal = ({ title, desc, confirmLabel, confirmCls, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{desc}</p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium text-sm transition-colors ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AdminRegistrations = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ text: '', type: '' });

  // Modal states
  const [rejectModal, setRejectModal] = useState({ open: false, reg: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, reg: null });
  const [cancelRegModal, setCancelRegModal] = useState({ open: false, reg: null });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4500);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/recent-registrations');
      setRegistrations(data);
    } catch (err) {
      console.error('Failed to fetch registrations', err);
      showToast('Gagal memuat data pendaftaran.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = registrations.filter(r =>
    r.user?.toLowerCase().includes(search.toLowerCase()) ||
    r.target?.toLowerCase().includes(search.toLowerCase())
  );

  // Aksi: Batalkan pendaftaran (admin)
  const handleCancelRegistration = async (reg) => {
    setCancelRegModal({ open: false, reg: null });
    try {
      await api.delete(`/registrations/admin/${reg.id}`);
      setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'cancelled' } : r));
      showToast(`Pendaftaran ${reg.user} berhasil dibatalkan.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal membatalkan pendaftaran.', 'error');
    }
  };

  // Aksi: Tolak akun user + kirim email
  const handleRejectUser = async (reg, reason) => {
    try {
      await api.post(`/users/${reg.user_id}/reject`, { reason });
      setRegistrations(prev => prev.filter(r => r.user_id !== reg.user_id));
      showToast(`Akun ${reg.user} ditolak. Email pemberitahuan telah dikirim.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menolak akun.', 'error');
    }
  };

  // Aksi: Hapus data pendaftaran
  const handleDeleteRegistration = async () => {
    const reg = deleteModal.reg;
    setDeleteModal({ open: false, reg: null });
    try {
      // Tidak ada endpoint hapus pendaftaran langsung, gunakan cancel sebagai gantinya
      await api.delete(`/registrations/admin/${reg.id}`);
      setRegistrations(prev => prev.filter(r => r.id !== reg.id));
      showToast(`Data pendaftaran ${reg.user} berhasil dihapus.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus pendaftaran.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      registered: { label: 'Terdaftar', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
      cancelled:  { label: 'Dibatalkan', cls: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
    };
    return map[status] || { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.text && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 border border-emerald-500/40 text-emerald-300'
            : 'bg-rose-900/90 border border-rose-500/40 text-rose-300'
        }`} style={{ backdropFilter: 'blur(16px)', minWidth: '260px' }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pendaftaran Global</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola semua pendaftaran acara. Waktu ditampilkan dalam zona WIB (Asia/Jakarta).
          </p>
        </div>
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari peserta atau acara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800/70">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Peserta</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acara</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waktu Daftar (WIB)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filtered.map((r, idx) => {
                  const badge = getStatusBadge(r.status || 'registered');
                  return (
                    <tr key={r.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                            {(r.user || 'U')[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{r.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{r.target}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatWIB(r.time)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionMenu
                          reg={{ ...r, status: r.status || 'registered' }}
                          onDelete={reg => setDeleteModal({ open: true, reg })}
                          onReject={reg => setRejectModal({ open: true, reg })}
                          onCancelReg={reg => setCancelRegModal({ open: true, reg })}
                        />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-slate-400">
                      Tidak ada data pendaftaran ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tolak Akun */}
      {rejectModal.open && (
        <RejectModal
          reg={rejectModal.reg}
          onClose={() => setRejectModal({ open: false, reg: null })}
          onConfirm={handleRejectUser}
        />
      )}

      {/* Modal: Hapus Pendaftaran */}
      {deleteModal.open && (
        <ConfirmModal
          title="🗑️ Hapus Data Pendaftaran"
          desc={`Apakah Anda yakin ingin menghapus/membatalkan data pendaftaran milik ${deleteModal.reg?.user}?`}
          confirmLabel="Ya, Hapus"
          confirmCls="bg-slate-700 hover:bg-slate-800"
          onClose={() => setDeleteModal({ open: false, reg: null })}
          onConfirm={handleDeleteRegistration}
        />
      )}

      {/* Modal: Batalkan Pendaftaran */}
      {cancelRegModal.open && (
        <ConfirmModal
          title="⚠️ Batalkan Pendaftaran"
          desc={`Apakah Anda yakin ingin membatalkan pendaftaran ${cancelRegModal.reg?.user} untuk acara ${cancelRegModal.reg?.target}?`}
          confirmLabel="Ya, Batalkan"
          confirmCls="bg-amber-600 hover:bg-amber-700"
          onClose={() => setCancelRegModal({ open: false, reg: null })}
          onConfirm={() => handleCancelRegistration(cancelRegModal.reg)}
        />
      )}
    </div>
  );
};

export default AdminRegistrations;
