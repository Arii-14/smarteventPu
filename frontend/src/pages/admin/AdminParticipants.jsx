import React, { useState, useEffect, useContext } from 'react';
import { Search, Users, QrCode, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import QRScannerModal from '../../components/admin/QRScannerModal';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const AttendanceBadge = ({ status }) => {
  if (status === 'Hadir') return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> H
    </span>
  );
  if (status === 'Alpha') return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> A
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-600/30">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> —
    </span>
  );
};

const AdminParticipants = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const toast = useToast();
  const { user } = useContext(AuthContext);

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        const evs = Array.isArray(data) ? data : data?.data || [];
        setEvents(evs);
        if (evs.length > 0) setSelectedEvent(evs[0]);
      } catch (err) {
        console.error('Gagal memuat acara', err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch participants when event changes
  useEffect(() => {
    if (!selectedEvent) return;
    fetchParticipants();
  }, [selectedEvent]);

  const fetchParticipants = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${selectedEvent.id}/participants`);
      setParticipants(data);
    } catch (err) {
      console.error('Gagal memuat peserta', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (registrationId, newStatus) => {
    setUpdatingId(registrationId);
    try {
      await api.put(`/events/${selectedEvent.id}/attendance/${registrationId}`, {
        attendance_status: newStatus
      });
      setParticipants(prev =>
        prev.map(p =>
          p.registration_id === registrationId
            ? { ...p, attendance_status: newStatus }
            : p
        )
      );
      const label = newStatus === 'Hadir' ? '✅ Hadir' : newStatus === 'Alpha' ? '⚠️ Alpha' : 'Direset';
      toast.success(`Status kehadiran diubah: ${label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status kehadiran.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredParticipants = participants.filter(p => {
    const name = (p.username || p.guest_name || '').toLowerCase();
    const email = (p.email || p.guest_email || '').toLowerCase();
    const nim = (p.nim || p.guest_nim || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || nim.includes(q);
  });

  const hadirCount = participants.filter(p => p.attendance_status === 'Hadir').length;
  const alphaCount = participants.filter(p => p.attendance_status === 'Alpha').length;
  const belumCount = participants.filter(p => !p.attendance_status).length;

  return (
    <div className="space-y-6 animate-fade-in-up pb-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
            Daftar Peserta & Kehadiran
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kehadiran peserta per acara secara manual atau via QR Scan.
          </p>
        </div>
        {/* QR Scanner button – Super Admin only when event is started */}
        {(user?.role === 'super_admin' || user?.role === 'admin') && selectedEvent?.is_started && (
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/25 transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95"
          >
            <QrCode size={17} />
            Scan QR Kehadiran
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full sm:max-w-xs">
          <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">Pilih Acara</label>
          <select
            value={selectedEvent?.id || ''}
            onChange={e => setSelectedEvent(events.find(ev => ev.id === parseInt(e.target.value)))}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:flex-1 relative mt-auto">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, NIM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && participants.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', count: participants.length, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
            { label: 'Hadir (H)', count: hadirCount, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' },
            { label: 'Alpha (A)', count: alphaCount, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-black ${color}`}>{count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Participants Table */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden">

        {/* Legend */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/70 flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Keterangan:</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 font-black text-xs border border-emerald-500/30">H</span>
            <span>= Hadir</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/15 text-rose-500 font-black text-xs border border-rose-500/30">A</span>
            <span>= Alpha (Tidak Hadir)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-500/10 text-slate-400 font-black text-xs border border-slate-500/20">—</span>
            <span>= Belum Ditandai</span>
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-[3px] border-indigo-100 dark:border-indigo-900/30 border-t-indigo-500 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Memuat data peserta...</p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Users size={28} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-500 dark:text-slate-400">
              {search ? 'Tidak ada peserta yang sesuai.' : 'Belum ada peserta yang mendaftar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/70">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peserta</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Email / NIM</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Kampus</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reg. Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Kehadiran</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Tandai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredParticipants.map((p) => {
                  const name = p.full_name || p.username || p.guest_name || 'Tamu';
                  const email = p.email || p.guest_email || '—';
                  const nim = p.nim || p.guest_nim || '—';
                  const photo = p.photo || p.avatar;
                  const isUpdating = updatingId === p.registration_id;

                  return (
                    <tr key={p.registration_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                      {/* Peserta */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {photo ? (
                            <img
                              src={photo.startsWith('http') ? photo : `http://localhost:5000${photo.startsWith('/') ? '' : '/'}${photo}`}
                              alt={name}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                              {getInitials(name)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{name}</p>
                            {!p.user_id && (
                              <span className="text-[10px] text-amber-500 font-semibold">Tamu</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email / NIM */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-xs text-slate-600 dark:text-slate-300">{email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">NIM: {nim}</p>
                      </td>

                      {/* Kampus */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-xs text-slate-600 dark:text-slate-300">{p.university || p.kampus || '—'}</p>
                        {p.prodi && <p className="text-[11px] text-slate-400 mt-0.5">{p.prodi}</p>}
                      </td>

                      {/* Registration Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          p.status === 'registered'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}>
                          {p.status === 'registered' ? 'Terdaftar' : 'Dibatalkan'}
                        </span>
                      </td>

                      {/* Attendance Status */}
                      <td className="px-5 py-4 text-center">
                        <AttendanceBadge status={p.attendance_status} />
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {isUpdating ? (
                            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                          ) : (
                            <>
                              {/* H – Hadir */}
                              <button
                                onClick={() => handleAttendance(p.registration_id, p.attendance_status === 'Hadir' ? null : 'Hadir')}
                                title={p.attendance_status === 'Hadir' ? 'Batalkan Hadir' : 'Tandai Hadir'}
                                className={`w-8 h-8 rounded-xl font-black text-xs transition-all hover:scale-110 active:scale-95 border ${
                                  p.attendance_status === 'Hadir'
                                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                                    : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                }`}
                              >
                                H
                              </button>
                              {/* A – Alpha */}
                              <button
                                onClick={() => handleAttendance(p.registration_id, p.attendance_status === 'Alpha' ? null : 'Alpha')}
                                title={p.attendance_status === 'Alpha' ? 'Batalkan Alpha' : 'Tandai Alpha'}
                                className={`w-8 h-8 rounded-xl font-black text-xs transition-all hover:scale-110 active:scale-95 border ${
                                  p.attendance_status === 'Alpha'
                                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                                    : 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                                }`}
                              >
                                A
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary footer */}
        {!loading && participants.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan <strong className="text-slate-700 dark:text-slate-300">{filteredParticipants.length}</strong> dari <strong className="text-slate-700 dark:text-slate-300">{participants.length}</strong> peserta
            </span>
            <span className="flex gap-4">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{hadirCount} Hadir</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">{alphaCount} Alpha</span>
              <span className="text-slate-500 font-medium">{belumCount} Belum</span>
            </span>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && selectedEvent && (
        <QRScannerModal
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          onClose={() => { setShowScanner(false); fetchParticipants(); }}
        />
      )}
    </div>
  );
};

export default AdminParticipants;
