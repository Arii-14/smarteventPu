import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, CalendarDays, Globe, Lock, Play, QrCode, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { AuthContext } from '../context/AuthContext';
import QRScannerModal from '../components/admin/QRScannerModal';

const ITEMS_PER_PAGE = 5;

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [scannerEvent, setScannerEvent] = useState(null); // { id, title }
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Reset page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events');
      setEvents(data.data || data || []);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const ok = await confirm({
      title: 'Hapus Acara',
      message: `Apakah Anda yakin ingin menghapus acara "${title}"? Tindakan ini tidak dapat dibatalkan.`,
      variant: 'danger',
      confirmLabel: 'Ya, Hapus',
      cancelLabel: 'Batal',
    });
    if (!ok) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      toast.success(`Acara "${title}" berhasil dihapus.`);
    } catch (err) {
      toast.error('Gagal menghapus acara. Silakan coba lagi.');
    }
  };

  const handleStart = async (event) => {
    const ok = await confirm({
      title: 'Mulai Acara Sekarang',
      message: `Mulai acara "${event.title}" sekarang? Pendaftar sudah bisa di-scan kehadirannya.`,
      variant: 'warning',
      confirmLabel: 'Mulai Sekarang',
      cancelLabel: 'Batal',
    });
    if (!ok) return;
    try {
      await api.put(`/events/${event.id}/start`);
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_started: true } : e));
      toast.success(`Acara "${event.title}" berhasil dimulai!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memulai acara.');
    }
  };

  const handleFinish = async (event) => {
    const ok = await confirm({
      title: 'Acara Selesai',
      message: `Tandai acara "${event.title}" sebagai selesai?`,
      variant: 'warning',
      confirmLabel: 'Selesai',
      cancelLabel: 'Batal',
    });
    if (!ok) return;
    try {
      await api.put(`/events/${event.id}/finish`);
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, end_date: new Date().toISOString() } : e));
      toast.success(`Acara "${event.title}" telah diselesaikan.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyelesaikan acara.');
    }
  };

  const handleClear = async (event) => {
    const ok = await confirm({
      title: 'Clear Acara',
      message: `Clear acara "${event.title}" karena tidak sesuai prediksi? Acara akan diakhiri paksa.`,
      variant: 'danger',
      confirmLabel: 'Clear Event',
      cancelLabel: 'Batal',
    });
    if (!ok) return;
    try {
      await api.put(`/events/${event.id}/clear`);
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, end_date: new Date().toISOString(), is_started: false } : e));
      toast.success(`Acara "${event.title}" telah di-clear.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal melakukan clear acara.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'draft': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'archived': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => ({
    published: 'Terbit',
    draft: 'Draf',
    archived: 'Arsip',
  }[status] || status);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isOngoing = (event) => {
    const now = new Date();
    return new Date(event.start_date) <= now && new Date(event.end_date) >= now;
  };

  const isFinished = (event) => {
    return event.end_date && new Date(event.end_date) < new Date();
  };

  const isUpcoming = (event) => {
    return event.start_date && new Date(event.start_date) > new Date();
  };

  const getEventTimeStatus = (event) => {
    if (isFinished(event)) return { label: 'Selesai', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
    if (isOngoing(event)) return { label: 'Berlangsung', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    if (isUpcoming(event)) return { label: 'Mendatang', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' };
    return null;
  };

  // Filter
  const filtered = events.filter(e => {
    const matchSearch = !searchTerm ||
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
    <div className="space-y-5 animate-fade-in-up pb-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-md">
              <CalendarDays size={16} className="text-white" />
            </div>
            Manajemen Acara
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total <span className="font-semibold text-slate-700 dark:text-slate-200">{events.length}</span> acara terdaftar
          </p>
        </div>
        <Link
          to="/admin/events/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 hover:-translate-y-0.5 hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} /> Tambah Acara
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Cari judul, kategori, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'published', 'draft', 'archived'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'published' ? 'Terbit' : s === 'draft' ? 'Draf' : 'Arsip'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100 dark:border-indigo-900/30" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 animate-spin" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <CalendarDays size={28} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600 dark:text-slate-400">Tidak ada acara ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm ? 'Coba ubah kata pencarian.' : 'Belum ada acara yang dibuat.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/70">
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acara</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kategori</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal Mulai → Akhir</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginated.map((event, idx) => {
                    const timeStatus = getEventTimeStatus(event);
                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative overflow-hidden rounded-xl shrink-0">
                              <img
                                src={event.banner ? (event.banner.startsWith('http') || event.banner.startsWith('data:') ? event.banner : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${event.banner.startsWith('/') ? '' : '/'}${event.banner}`) : `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100`}
                                alt=""
                                className="w-12 h-12 object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                                {event.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400">ID: #{String(event.id).padStart(4, '0')}</span>
                                {event.visibility === 'private' ? (
                                  <span className="flex items-center gap-0.5 text-[10px] text-rose-500 dark:text-rose-400">
                                    <Lock size={9} /> Privat
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-0.5 text-[10px] text-indigo-500 dark:text-indigo-400">
                                    <Globe size={9} /> Publik
                                  </span>
                                )}
                                {timeStatus && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${timeStatus.cls}`}>
                                    {timeStatus.label}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {event.category_name || 'Umum'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="font-medium">Mulai:</span> {formatDate(event.start_date)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                              <span className="font-medium">Akhir:</span> {formatDate(event.end_date)}
                            </div>
                            {event.registration_deadline && (
                              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                                <span className="font-medium">Deadline:</span> {formatDate(event.registration_deadline)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full border uppercase ${getStatusColor(event.status)}`}>
                            {getStatusLabel(event.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Mulai Sekarang – jika belum dimulai dan belum selesai */}
                            {!event.is_started && !isFinished(event) && (
                              <button
                                onClick={() => handleStart(event)}
                                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 rounded-lg transition-colors"
                                title="Mulai Acara Sekarang"
                              >
                                <Play size={16} />
                              </button>
                            )}
                            {/* Scan QR – khusus Super Admin, acara sudah dimulai */}
                            {user?.role === 'super_admin' && event.is_started && !isFinished(event) && (
                              <button
                                onClick={() => setScannerEvent({ id: event.id, title: event.title })}
                                className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 dark:hover:text-violet-400 rounded-lg transition-colors"
                                title="Scan QR Kehadiran"
                              >
                                <QrCode size={16} />
                              </button>
                            )}
                            {/* Finish & Clear Buttons - when event is playing (started) */}
                            {event.is_started && !isFinished(event) && (
                              <>
                                <button
                                  onClick={() => handleFinish(event)}
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors"
                                  title="Acara Sudah Selesai"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleClear(event)}
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
                                  title="Clear Event"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            <Link
                              to={`/events/${event.id}`}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              to={`/admin/events/edit/${event.id}`}
                              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 rounded-lg transition-colors"
                              title="Edit Acara"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(event.id, event.title)}
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-lg transition-colors"
                              title="Hapus Acara"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginated.map((event) => {
                const timeStatus = getEventTimeStatus(event);
                return (
                  <div key={event.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={event.banner ? (event.banner.startsWith('http') || event.banner.startsWith('data:') ? event.banner : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${event.banner.startsWith('/') ? '' : '/'}${event.banner}`) : `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100`}
                        alt=""
                        className="w-14 h-14 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{event.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{event.category_name || 'Umum'}</p>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${getStatusColor(event.status)}`}>
                            {getStatusLabel(event.status)}
                          </span>
                          {timeStatus && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${timeStatus.cls}`}>
                              {timeStatus.label}
                            </span>
                          )}
                          {event.is_started && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              🟢 Dimulai
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-500 font-medium">Mulai:</span>
                        <span className="text-slate-700 dark:text-slate-300">{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <span className="text-slate-500 font-medium">Akhir:</span>
                        <span className="text-slate-700 dark:text-slate-300">{formatDate(event.end_date)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/events/${event.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <Eye size={14} /> Lihat
                      </Link>
                      <Link to={`/admin/events/edit/${event.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors">
                        <Edit size={14} /> Edit
                      </Link>
                      {!event.is_started && !isFinished(event) && (
                        <button onClick={() => handleStart(event)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors">
                          <Play size={14} /> Mulai
                        </button>
                      )}
                      {(user?.role === 'super_admin' || user?.role === 'admin') && event.is_started && (
                        <button onClick={() => setScannerEvent({ id: event.id, title: event.title })} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl transition-colors">
                          <QrCode size={14} /> Scan QR
                        </button>
                      )}
                      <button onClick={() => handleDelete(event.id, event.title)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-800/20">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-300">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> dari{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> acara
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    p === currentPage
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* QR Scanner Modal – Super Admin only */}
    {scannerEvent && (
      <QRScannerModal
        eventId={scannerEvent.id}
        eventTitle={scannerEvent.title}
        onClose={() => setScannerEvent(null)}
      />
    )}
    </>
  );
};

export default EventManagement;
