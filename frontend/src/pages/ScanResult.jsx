import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, MapPin, User, Hash, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';

const ScanResult = () => {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await api.get(`/registrations/scan/${token}`);
        setTicket(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Tiket tidak ditemukan atau tidak valid.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100 dark:border-indigo-900/30" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Memverifikasi tiket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 text-center space-y-6 border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto">
            <XCircle size={40} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tiket Tidak Valid</h1>
          <p className="text-slate-500 dark:text-slate-400">{error || 'Tiket tidak ditemukan.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isAttended = ticket.status === 'attended';
  const isCancelled = ticket.status === 'cancelled';
  const isRegistered = ticket.status === 'registered';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
        
        {/* Status Header */}
        <div className={`px-8 py-8 text-center ${
          isCancelled ? 'bg-gradient-to-br from-rose-500 to-pink-600' :
          isAttended ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
          'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}>
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            {isCancelled ? (
              <XCircle size={40} className="text-white" />
            ) : (
              <CheckCircle size={40} className="text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isCancelled ? 'Pendaftaran Dibatalkan' : isAttended ? 'Sudah Hadir' : 'Sudah Terdaftar'}
          </h1>
          <p className="text-white/80 text-sm">
            {isCancelled ? 'Peserta ini telah membatalkan pendaftaran' : isAttended ? 'Peserta ini telah menghadiri acara' : 'Peserta ini terdaftar dan aktif'}
          </p>
        </div>

        {/* Details */}
        <div className="p-8 space-y-5">
          <div className="space-y-4">
            <DetailRow icon={<User size={18} className="text-indigo-500" />} label="Nama Peserta" value={ticket.guest_name || 'Pengguna Terdaftar'} />
            {ticket.guest_nim && (
              <DetailRow icon={<Hash size={18} className="text-violet-500" />} label="NIM" value={ticket.guest_nim} />
            )}
            <DetailRow icon={<Calendar size={18} className="text-sky-500" />} label="Acara" value={ticket.title} />
            {ticket.start_date && (
              <DetailRow icon={<Calendar size={18} className="text-amber-500" />} label="Tanggal"
                value={new Date(ticket.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
            )}
            {ticket.location && (
              <DetailRow icon={<MapPin size={18} className="text-emerald-500" />} label="Lokasi" value={ticket.location} />
            )}
          </div>

          {/* QR Code */}
          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-5 text-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${window.location.href}`}
              alt="QR Code"
              className="mx-auto rounded-lg"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-mono break-all">{token}</p>
          </div>

          <Link to="/" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white text-sm">{value}</p>
    </div>
  </div>
);

export default ScanResult;
