import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaLock, FaUniversity, FaGraduationCap,
  FaIdCard, FaCamera, FaShieldAlt, FaSave, FaEye, FaEyeSlash,
  FaCheckCircle, FaExclamationCircle, FaStar, FaTrash, FaCalendarAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

/* ─── Password input toggle ─────────────────────────────────── */
const PwdInput = ({ name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-slate-600 bg-slate-700/60 text-white rounded-xl px-4 py-3 pr-11 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
        {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
      </button>
    </div>
  );
};

/* ─── Field label wrapper ───────────────────────────────────── */
const Field = ({ label, icon: Icon, iconCls = 'text-violet-400', children }) => (
  <div>
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
      <Icon size={11} className={iconCls} />{label}
    </label>
    {children}
  </div>
);

/* ─── Text / read-only input ────────────────────────────────── */
const TxtInput = ({ name, value, onChange, placeholder, readOnly = false, focusCls = 'focus:ring-violet-500' }) => (
  <input
    type="text" name={name} value={value} onChange={onChange}
    placeholder={placeholder} readOnly={readOnly}
    className={`w-full border border-slate-600 rounded-xl px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:border-transparent ${
      readOnly
        ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
        : `bg-slate-700/60 text-white placeholder-slate-400 ${focusCls}`
    }`}
  />
);

/* ─── Section card ──────────────────────────────────────────── */
const Section = ({ title, icon: Icon, iconCls = 'text-violet-400', borderCls = 'border-violet-500/25', children }) => (
  <div className={`bg-slate-800/60 border ${borderCls} rounded-2xl p-6 backdrop-blur-sm`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl bg-slate-700/60"><Icon size={15} className={iconCls} /></div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '', email: '',
    kampus: '', prodi: '', nim: '',
    currentPassword: '', newPassword: '',
  });
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ text: '', type: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef(null);

  /* Sync form dari context user */
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        kampus: user.kampus || user.university || '',
        prodi: user.prodi || '',
        nim: user.nim || user.student_id || '',
      }));
    }
  }, [user]);

  const showAlert = (text, type = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert({ text: '', type: '' }), 4500);
  };

  /* ── Riwayat acara user ────────────────────────────────────── */
  useEffect(() => {
    if (!user || user.role === 'super_admin' || user.role === 'admin') return;
    if (activeTab !== 'history') return;
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data } = await api.get('/registrations/history');
        setHistory(data);
      } catch (err) {
        console.error('Gagal memuat riwayat', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [activeTab, user]);

  /* ── Hapus akun sendiri (admin/user) ──────────────────────── */
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/users/me');
      logout();
      navigate('/login');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Gagal menghapus akun.', 'error');
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  /* ── Upload foto ──────────────────────────────────────────── */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showAlert('Ukuran file maksimal 5 MB.', 'error'); return; }

    if (isSuperAdmin) {
      /* Super Admin: simpan sebagai Base64 di localStorage */
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        setAvatarPreview(dataUrl);
        updateUser({ photo: dataUrl, avatar: dataUrl });
        showAlert('Foto profil berhasil diperbarui! 🎉');
      };
      reader.readAsDataURL(file);
    } else {
      /* User biasa: upload ke server */
      setUploading(true);
      const data = new FormData();
      data.append('photo', file);
      try {
        const res = await api.post('/users/me/photo', data);
        updateUser({ photo: res.data.photo, avatar: res.data.photo });
        showAlert('Foto profil berhasil diperbarui! 🎉');
      } catch (err) {
        showAlert(err.response?.data?.message || 'Gagal mengunggah foto.', 'error');
      } finally {
        setUploading(false);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Simpan profil ──────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) { showAlert('Username tidak boleh kosong.', 'error'); return; }

    if (isSuperAdmin) {
      /* Super Admin: simpan hanya username ke localStorage via updateUser */
      updateUser({ username: formData.username.trim() });
      showAlert('Profil berhasil diperbarui! ✨');
      return;
    }

    /* User biasa: kirim ke API */
    setLoading(true);
    try {
      const { data } = await api.put('/users/me', formData);
      updateUser(data.user);
      showAlert(data.message || 'Profil berhasil diperbarui! ✨');
      setFormData(p => ({ ...p, currentPassword: '', newPassword: '' }));
    } catch (err) {
      showAlert(err.response?.data?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Avatar URL ─────────────────────────────────────────── */
  const rawPhoto = user?.avatar || user?.photo;
  const avatarSrc = avatarPreview
    ? avatarPreview
    : rawPhoto
      ? rawPhoto.startsWith('data:') || rawPhoto.startsWith('http')
        ? rawPhoto
        : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${rawPhoto}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=7c3aed&color=fff&bold=true&size=200`;

  /* Kelengkapan profil */
  const profileFields = isSuperAdmin
    ? [formData.username, formData.email]
    : [formData.username, formData.email, formData.nim, formData.prodi, formData.kampus];
  const filled = profileFields.filter(Boolean).length;
  const pct = Math.round((filled / profileFields.length) * 100);

  /* Role badge */
  const roleBadge = {
    super_admin: { label: 'Super Admin', cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    admin:       { label: 'Admin',       cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    user:        { label: 'Mahasiswa',   cls: 'bg-violet-500/20 text-violet-300 border border-violet-500/30' },
  }[user?.role] || { label: 'User', cls: 'bg-slate-600 text-slate-200' };

  /* Password strength */
  const pwdStrength = (() => {
    const p = formData.newPassword;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const colors = ['bg-rose-500', 'bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];
    const labels = ['Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
    return { s, color: colors[s - 1] || 'bg-rose-500', label: labels[s - 1] || 'Lemah' };
  })();

  return (
    <div className="min-h-screen bg-slate-900 py-24 px-4 sm:px-6">

      {/* ── Toast Alert ── */}
      {alert.text && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium ${
            alert.type === 'success'
              ? 'bg-emerald-900/80 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-900/80 border border-rose-500/40 text-rose-300'
          }`}
          style={{ backdropFilter: 'blur(16px)', minWidth: '260px' }}
        >
          {alert.type === 'success'
            ? <FaCheckCircle className="text-emerald-400 shrink-0" />
            : <FaExclamationCircle className="text-rose-400 shrink-0" />
          }
          {alert.text}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-600/20 border border-violet-500/30">
            <FaUser className="text-violet-400 text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pengaturan Profil</h1>
            <p className="text-slate-400 text-sm mt-0.5">Kelola informasi akun dan keamanan Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* ══ SIDEBAR ════════════════════════════════════ */}
          <div className="flex flex-col gap-4">

            {/* Avatar card */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center backdrop-blur-sm">
              {/* Avatar with gradient ring */}
              <div className="relative mb-5">
                <div className="w-28 h-28 rounded-full p-[3px]"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#a855f7,#ec4899)' }}>
                  <img
                    src={avatarSrc}
                    alt={user?.username || 'Avatar'}
                    className={`w-full h-full rounded-full object-cover bg-slate-800 transition-opacity duration-300 ${uploading ? 'opacity-40' : 'opacity-100'}`}
                  />
                </div>

                {/* Upload spinner (non-SA only) */}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                  </div>
                )}

                {/* Camera button — semua role bisa ganti foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0.5 right-0.5 w-8 h-8 flex items-center justify-center rounded-full text-white border-2 border-slate-900 shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#9333ea)' }}
                  title="Ganti foto profil"
                >
                  <FaCamera size={11} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
              </div>

              {/* Name & role badge */}
              <h2 className="text-white font-bold text-lg text-center">{user?.username || 'Pengguna'}</h2>
              <span className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${roleBadge.cls}`}>
                {roleBadge.label}
              </span>
              <p className="mt-2 text-slate-400 text-xs text-center truncate max-w-[220px]">{user?.email}</p>

              {/* Info pills (non-SA) */}
              {!isSuperAdmin && (
                <div className="mt-5 w-full flex flex-col gap-2">
                  {[
                    { val: user?.nim || user?.student_id, icon: FaIdCard,        cls: 'text-violet-400', label: 'NIM' },
                    { val: user?.prodi,                    icon: FaGraduationCap, cls: 'text-blue-400',   label: 'Prodi' },
                    { val: user?.kampus || user?.university, icon: FaUniversity,  cls: 'text-emerald-400', label: 'Kampus' },
                  ].filter(f => f.val).map(({ val, icon: I, cls, label }) => (
                    <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-700/40 border border-slate-600/40">
                      <I size={12} className={`${cls} shrink-0`} />
                      <span className="text-slate-300 text-xs truncate">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-4 text-slate-500 text-[11px] text-center leading-relaxed">
                Klik ikon kamera untuk<br />mengganti foto profil
              </p>
            </div>

            {/* Completeness card */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Kelengkapan Profil</p>
              <div className="flex justify-between mb-2">
                <span className="text-white font-bold text-sm">{pct}%</span>
                <span className="text-slate-400 text-xs">{filled}/{profileFields.length} diisi</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7,#c084fc)' }}
                />
              </div>
              {pct === 100 && (
                <div className="flex items-center gap-2 mt-3 text-amber-400 text-xs font-medium">
                  <FaStar size={11} /> Profil sudah lengkap!
                </div>
              )}
            </div>
          </div>

          {/* ══ FORM ════════════════════════════════════════ */}
          <div>
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-2xl mb-5">
              {[
                { id: 'info',     label: 'Informasi Profil', icon: FaUser },
                ...(!isSuperAdmin ? [{ id: 'security', label: 'Keamanan', icon: FaShieldAlt }] : []),
                ...(!isSuperAdmin && !isAdmin ? [{ id: 'history', label: 'Riwayat Acara', icon: FaCalendarAlt }] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                  style={activeTab === tab.id
                    ? { background: 'linear-gradient(135deg,#7c3aed,#9333ea)', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }
                    : {}}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* ─ Tab: Informasi Profil ─ */}
              {activeTab === 'info' && (
                <>
                  <Section title="Informasi Dasar" icon={FaUser} iconCls="text-violet-400" borderCls="border-violet-500/25">
                    {/* Username — bisa diedit semua role */}
                    <Field label="Username" icon={FaUser}>
                      <TxtInput
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Masukkan username..."
                      />
                    </Field>

                    {/* Email — read-only */}
                    <Field label="Email" icon={FaEnvelope} iconCls="text-blue-400">
                      <div className="relative">
                        <TxtInput name="email" value={formData.email} readOnly />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                          Tidak dapat diubah
                        </span>
                      </div>
                    </Field>

                    {/* Role — info saja */}
                    <Field label="Role" icon={FaShieldAlt} iconCls="text-amber-400">
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/40 border border-slate-600 rounded-xl">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge.cls}`}>
                          {roleBadge.label}
                        </span>
                        <span className="text-slate-500 text-xs">— tidak dapat diubah dari sini</span>
                      </div>
                    </Field>
                  </Section>

                  {/* Informasi Akademik — hanya non-SA */}
                  {!isSuperAdmin && (
                    <Section title="Informasi Akademik" icon={FaGraduationCap} iconCls="text-blue-400" borderCls="border-blue-500/25">
                      <Field label="NIM" icon={FaIdCard} iconCls="text-violet-400">
                        <TxtInput name="nim" value={formData.nim} onChange={handleChange} placeholder="Nomor Induk Mahasiswa..." focusCls="focus:ring-violet-500" />
                      </Field>
                      <Field label="Program Studi" icon={FaGraduationCap} iconCls="text-blue-400">
                        <TxtInput name="prodi" value={formData.prodi} onChange={handleChange} placeholder="Mis: Teknik Informatika..." focusCls="focus:ring-blue-500" />
                      </Field>
                      <Field label="Universitas" icon={FaUniversity} iconCls="text-emerald-400">
                        <TxtInput name="kampus" value={formData.kampus} onChange={handleChange} placeholder="Nama universitas Anda..." focusCls="focus:ring-emerald-500" />
                      </Field>
                    </Section>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#9333ea)', boxShadow: '0 4px 18px rgba(124,58,237,0.4)' }}
                    >
                      {loading
                        ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Menyimpan...</>
                        : <><FaSave size={14} />Simpan Perubahan</>
                      }
                    </button>
                  </div>
                </>
              )}

              {/* ─ Tab: Keamanan (non-SA saja) ─ */}
              {activeTab === 'security' && !isSuperAdmin && (
                <>
                  <Section title="Ubah Password" icon={FaShieldAlt} iconCls="text-rose-400" borderCls="border-rose-500/25">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <FaShieldAlt size={13} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-amber-300 text-xs leading-relaxed">
                        Password baru minimal 6 karakter. Kosongkan kedua field jika tidak ingin mengubah password.
                      </p>
                    </div>

                    <Field label="Password Saat Ini" icon={FaLock} iconCls="text-rose-400">
                      <PwdInput name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Masukkan password lama..." />
                    </Field>

                    <Field label="Password Baru" icon={FaLock} iconCls="text-rose-400">
                      <PwdInput name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Masukkan password baru..." />
                    </Field>

                    {pwdStrength && (
                      <div>
                        <div className="flex gap-1.5 mb-1.5">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= pwdStrength.s ? pwdStrength.color : 'bg-slate-600'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-400">
                          Kekuatan: <span className="text-white font-medium">{pwdStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </Section>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg,#dc2626,#e11d48)', boxShadow: '0 4px 18px rgba(220,38,38,0.3)' }}
                    >
                      {loading
                        ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Menyimpan...</>
                        : <><FaShieldAlt size={13} />Perbarui Password</>
                      }
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* ─ Tab: Riwayat Acara (user saja) ─ */}
            {activeTab === 'history' && !isSuperAdmin && !isAdmin && (
              <div className="flex flex-col gap-4 mt-5">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-10 h-10 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin" />
                    <p className="text-sm text-slate-400">Memuat riwayat acara...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-700/40 flex items-center justify-center">
                      <FaCalendarAlt size={24} className="text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Belum ada acara yang didaftarkan.</p>
                  </div>
                ) : (
                  history.map(reg => {
                    const now = new Date();
                    const eventEnded = reg.end_date && new Date(reg.end_date) < now;
                    const eventStarted = reg.start_date && new Date(reg.start_date) <= now;

                    return (
                      <div key={reg.id} className="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-colors">
                        {/* Banner */}
                        {reg.banner && (
                          <div className="relative h-24 overflow-hidden">
                            <img
                              src={reg.banner.startsWith('http') ? reg.banner : `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${reg.banner}`}
                              alt={reg.title}
                              className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-white text-sm leading-tight">{reg.title}</h3>
                            <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                              reg.status === 'registered'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {reg.status === 'registered' ? 'Terdaftar' : 'Dibatalkan'}
                            </span>
                          </div>

                          {/* Date & location */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                            {reg.start_date && (
                              <span>📅 {new Date(reg.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            )}
                            {reg.location && <span>📍 {reg.location}</span>}
                          </div>

                          {/* ─── ATTENDANCE STATUS BANNER ─── */}
                          {reg.status === 'registered' && eventStarted && (
                            <div className="mt-3">
                              {reg.attendance_status === 'Hadir' ? (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <FaCheckCircle className="text-emerald-400" size={14} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-emerald-400">✅ Anda telah hadir</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">Kehadiran Anda pada acara ini telah tercatat.</p>
                                  </div>
                                </div>
                              ) : reg.attendance_status === 'Alpha' ? (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                                    <FaExclamationCircle className="text-rose-400" size={14} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-rose-400">⚠️ Anda telah absen dari acara ini</p>
                                    <p className="text-xs text-rose-600 mt-0.5">Kehadiran Anda tidak tercatat pada acara ini.</p>
                                  </div>
                                </div>
                              ) : !eventEnded ? (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                    <FaCalendarAlt className="text-amber-400" size={13} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-amber-400">🕐 Acara Sedang Berlangsung</p>
                                    <p className="text-xs text-amber-600 mt-0.5">Tunjukkan QR tiket Anda kepada panitia.</p>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ─ Danger Zone: Hapus Akun (non-super_admin) ─ */}
            {!isSuperAdmin && (
              <div className="mt-6 bg-rose-950/30 border border-rose-500/25 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-rose-500/10">
                    <FaTrash size={13} className="text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-rose-300">Hapus Akun</h3>
                    <p className="text-xs text-rose-400/70 mt-0.5">
                      Tindakan ini permanen dan tidak dapat dibatalkan. Seluruh data akun Anda akan dihapus.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-all"
                >
                  <FaTrash size={12} /> Hapus Akun Saya
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Konfirmasi Hapus Akun */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-rose-500/30 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-5 bg-rose-950/50 border-b border-rose-500/20">
              <h3 className="font-bold text-lg text-rose-300 flex items-center gap-2">
                <FaTrash size={15} /> Hapus Akun Saya
              </h3>
            </div>
            <div className="p-5">
              <p className="text-slate-300 text-sm">
                Apakah Anda yakin ingin menghapus akun <strong>{user?.username}</strong> secara permanen?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Semua data, riwayat pendaftaran, dan profil Anda akan hilang dan tidak dapat dipulihkan.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-medium hover:bg-slate-700 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleteLoading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Menghapus...</>
                    : <><FaTrash size={12} />Ya, Hapus Akun</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
