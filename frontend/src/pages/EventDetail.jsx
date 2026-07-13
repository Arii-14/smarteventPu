import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Share2, Users, ArrowLeft, Heart, Globe, Lock, CheckCircle, AlertCircle, Mic2, Building2, Mail, X, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

/* ─── Custom Toast ───────────────────────────────────────────────────────── */
const Toast = ({ msg, onClose }) => {
  if (!msg.text) return null;
  const colors = msg.type === 'success'
    ? 'bg-emerald-600 text-white'
    : 'bg-rose-600 text-white';
  return (
    <div className={`fixed top-24 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 ${colors} animate-slide-in-right max-w-sm`}>
      {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-semibold">{msg.text}</span>
      <button onClick={onClose} className="ml-auto hover:opacity-70 transition-opacity"><X size={16} /></button>
    </div>
  );
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });



  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        const ev = data.data || data;
        setEvent(ev);

        if (isAuthenticated && user) {
          try {
            const [regRes, favRes] = await Promise.all([
              api.get('/registrations/me').catch(() => ({ data: [] })),
              api.get('/favorites').catch(() => ({ data: [] })),
            ]);
            setIsRegistered(regRes.data.some(r => r.event_id === parseInt(id)));
            setIsFavorited(favRes.data.some(f => f.id === parseInt(id)));
          } catch (err) {
            console.error('Failed to fetch user specific event stats', err);
          }
        }
      } catch (err) {
        setError('Acara tidak ditemukan atau terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [id, isAuthenticated, user]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    
    try {
      await api.post(`/registrations/${id}`);
      setIsRegistered(true);
      showToast('Berhasil mendaftar ke acara ini! 🎉', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mendaftar.', 'error');
    } finally {
      setRegistering(false);
    }
  };


  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFavoriting(true);
    
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`);
        setIsFavorited(false);
      } else {
        await api.post('/favorites', { event_id: parseInt(id) });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Favorite action failed', err);
    } finally {
      setFavoriting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Tautan berhasil disalin ke clipboard!', 'success');
  };

  /* ─── Loading ──────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex justify-center items-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100 dark:border-indigo-900/30" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col justify-center items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <AlertCircle size={36} className="text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{error || 'Acara tidak ditemukan'}</h2>
        <Link to="/events" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">Kembali ke Acara</Link>
      </div>
    );
  }

  /* ─── Computed ──────────────────────────────────────────────────────────── */
  const now = new Date();
  const startDate = event.start_date ? new Date(event.start_date) : null;
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;

  const isOngoing = startDate && endDate && startDate <= now && endDate >= now;
  const isFinished = endDate && endDate < now;
  const isPrivate = event.visibility === 'private';
  const isPublished = event.status === 'published';

  const deadlinePassed = deadline && deadline < now;
  const quotaFull = event.max_quota > 0 && (event.participants || 0) >= event.max_quota;
  const registrationClosed = isOngoing || isFinished || deadlinePassed;
  const canRegister = isPublished && !registrationClosed && !quotaFull && !isRegistered;
  
  const remainingQuota = event.max_quota > 0 ? Math.max(0, event.max_quota - (event.participants || 0)) : null;
  const speakers = event.speakers || [];

  const formatDate = (d) => d ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const formatTime = (d) => d ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
      <Toast msg={toast} onClose={() => setToast({ text: '', type: '' })} />

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div className="relative h-[40vh] md:h-[50vh] w-full group">
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
          <img
            src={event.banner ? (event.banner.startsWith('http') || event.banner.startsWith('data:') ? event.banner : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${event.banner.startsWith('/') ? '' : '/'}${event.banner}`) : `https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1600`}
            alt={event.title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <Link to="/events" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-medium transition-all border border-white/20 shadow-lg hover:-translate-x-1">
            <ArrowLeft size={18} /> Kembali
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-white/20 shadow-sm">
                {event.category_name || 'Acara'}
              </span>
              {isPrivate ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md bg-rose-100/90 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border border-white/20">
                  <Lock size={12} /> Privat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border border-white/20">
                  <Globe size={12} /> Publik
                </span>
              )}
              {isOngoing && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md bg-blue-100/90 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-white/20 animate-pulse">
                  🔴 Sedang Berlangsung
                </span>
              )}
              {isFinished && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md bg-slate-100/90 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-white/20">
                  ✅ Selesai
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl leading-tight drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={<Calendar className="text-indigo-600 dark:text-indigo-400" size={22} />} iconBg="bg-indigo-50 dark:bg-indigo-900/30" label="Tanggal Mulai" value={formatDate(startDate)} sub={formatTime(startDate)} />
              <InfoCard icon={<Clock className="text-rose-600 dark:text-rose-400" size={22} />} iconBg="bg-rose-50 dark:bg-rose-900/30" label="Tanggal Selesai" value={formatDate(endDate)} sub={formatTime(endDate)} />
              <InfoCard icon={<MapPin className="text-sky-600 dark:text-sky-400" size={22} />} iconBg="bg-sky-50 dark:bg-sky-900/30" label="Lokasi" value={event.location || '—'}
                link={event.maps_link || `https://maps.google.com/?q=${encodeURIComponent(event.location || '')}`} linkText="Lihat di Peta" />
              <InfoCard icon={<Users className="text-violet-600 dark:text-violet-400" size={22} />} iconBg="bg-violet-50 dark:bg-violet-900/30" label="Peserta"
                value={<>{event.participants || 0}{event.max_quota > 0 && <span className="text-slate-400 font-normal"> / {event.max_quota}</span>}</>}
                sub={event.max_quota > 0 ? <ProgressBar current={event.participants || 0} total={event.max_quota} /> : null} />
            </div>

            {/* Deadline */}
            {deadline && (
              <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-semibold ${deadlinePassed
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'}`}>
                <Clock size={16} className="shrink-0" />
                <span>
                  Batas Pendaftaran: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {deadlinePassed && <span className="ml-2 font-bold text-slate-500">(Sudah lewat)</span>}
                </span>
              </div>
            )}

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-sky-500 rounded-full" />
                Tentang Acara Ini
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-slate-600 dark:text-slate-400 leading-relaxed">
                {event.description || 'Tidak ada deskripsi.'}
              </div>
            </div>

            {/* ── Speakers Section ───────────────────────────────────────── */}
            {speakers.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Mic2 size={20} className="text-indigo-500" />
                  Pembicara
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {speakers.map(spk => (
                    <div key={spk.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-600/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                      <img
                        src={spk.photo ? (spk.photo.startsWith('http') || spk.photo.startsWith('data:') ? spk.photo : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${spk.photo.startsWith('/') ? '' : '/'}${spk.photo}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(spk.name)}&background=6366f1&color=fff&size=80&bold=true`}
                        alt={spk.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-200 dark:ring-indigo-800 group-hover:ring-indigo-400 transition-all shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{spk.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{spk.position || spk.institution || 'Pembicara'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column - Sticky Sidebar ───────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">

              {/* ── Registration Card ─────────────────────────────────────── */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admission</span>
                  {registrationClosed ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">Closed</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400">Open</span>
                  )}
                </div>

                {/* Admission Info */}
                <div className="mb-6 relative z-10">
                  {event.max_quota > 0 ? (
                    <>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                        {remainingQuota > 0 ? `${remainingQuota} Tempat Tersedia` : 'Penuh'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Terbatas</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Terbuka Untuk Umum</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Gratis</p>
                    </>
                  )}
                </div>

                {/* Closed msg */}
                {registrationClosed && (
                  <div className="mb-4 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <span>{isFinished ? '✅' : isOngoing ? '🔴' : '⏰'}</span>
                    <span>{isFinished ? 'Acara telah selesai' : isOngoing ? 'Sedang berlangsung' : 'Batas pendaftaran lewat'}</span>
                  </div>
                )}

                {/* CTA Button */}
                <div className="relative z-10">
                  {isRegistered ? (
                    <div className="w-full py-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-center font-bold border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Anda Sudah Terdaftar
                    </div>
                  ) : isPrivate && !isAuthenticated ? (
                    <Link
                      to="/login"
                      className="block w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Lock size={16} /> Login untuk Mendaftar
                    </Link>
                  ) : canRegister ? (
                    <button 
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {registering ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Mendaftar...
                        </>
                      ) : 'Daftar Sekarang'}
                    </button>
                  ) : !isRegistered && (
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed"
                    >
                      {isFinished ? 'Acara Ini Telah Selesai' : 'Pendaftaran Ditutup'}
                    </button>
                  )}
                </div>
                
                {/* Share & Favorite */}
                <div className="flex gap-3 mt-4 relative z-10">
                  <button 
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm"
                  >
                    <Share2 size={16} /> Membagikan
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    disabled={favoriting}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all duration-300 active:scale-95 text-sm group ${
                      isFavorited 
                        ? 'border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 dark:hover:border-rose-900/50'
                    }`}
                  >
                    <Heart size={16} className={`${isFavorited ? 'fill-rose-500 text-rose-500 animate-[bounce_0.6s_ease-in-out]' : 'group-hover:text-rose-400'} transition-all duration-300`} /> 
                    {isFavorited ? 'Disimpan' : 'Menyimpan'}
                  </button>
                </div>
              </div>

              {/* ── Organizer Card ─────────────────────────────────────────── */}
              {event.organizer_name && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">Disusun Oleh</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-sky-100 dark:from-indigo-900/30 dark:to-sky-900/30 flex items-center justify-center text-base font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 uppercase shrink-0">
                      {event.organizer_name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{event.organizer_name}</p>
                      {event.organizer_email && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.organizer_email}</p>
                      )}
                    </div>
                  </div>
                  {event.organizer_email && (
                    <a
                      href={`mailto:${event.organizer_email}`}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
                    >
                      <Mail size={15} /> Hubungi Penyelenggara
                    </a>
                  )}
                  <a
                    href="https://wa.me/6281396368305"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all text-sm"
                  >
                    Chat Superadmin
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>



      {/* ── CSS Animations ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(80px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.4s ease-out; }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

/* ─── Sub-components ───────────────────────────────────────────────────── */
const InfoCard = ({ icon, iconBg, label, value, sub, link, linkText }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300 group">
    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-bold text-slate-900 dark:text-white text-sm">{value}</p>
      {sub && <div className="mt-1">{typeof sub === 'string' ? <p className="text-sm text-slate-500">{sub}</p> : sub}</div>}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium mt-1 inline-block">
          {linkText || 'Lihat'} →
        </a>
      )}
    </div>
  </div>
);

const ProgressBar = ({ current, total }) => (
  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-full mt-1">
    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, (current / total) * 100)}%` }} />
  </div>
);

export default EventDetail;
