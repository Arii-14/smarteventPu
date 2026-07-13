import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, User } from 'lucide-react';

const RecentRegistrations = ({ registrations = [] }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = registrations.filter(
    (r) =>
      r.user?.toLowerCase().includes(search.toLowerCase()) ||
      r.target?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Baru saja';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800/70">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pendaftaran Terbaru</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{registrations.length} total pendaftaran</p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari peserta..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/40">
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Peserta</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Acara</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:table-cell">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/70">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                  {search ? 'Tidak ditemukan hasil pencarian.' : 'Belum ada pendaftaran.'}
                </td>
              </tr>
            ) : (
              paginated.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                        {(reg.user || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{reg.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate block max-w-[200px]">{reg.target}</span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{formatRelativeTime(reg.time)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800/70">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecentRegistrations;
