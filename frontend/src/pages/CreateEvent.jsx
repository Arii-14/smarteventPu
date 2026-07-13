import React, { useState, useEffect } from 'react';
import {
  Upload, X, Calendar as CalendarIcon, Clock, MapPin, Link as LinkIcon,
  Users, Image as ImageIcon, Mic2, Building2, Globe, Lock,
  Plus, Trash2, CheckCircle, ChevronDown, Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// ─── Sub Components ───────────────────────────────────────────────────────────

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
        <Icon size={14} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

const InputField = ({ label, required, children, hint }) => (
  <div className="group">
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
  </div>
);

const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateEvent = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Speaker Creation
  const [showNewSpeakerForm, setShowNewSpeakerForm] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState({ name: '', position: '', institution: '' });
  const [newSpeakerPhoto, setNewSpeakerPhoto] = useState(null);
  const [creatingSpeaker, setCreatingSpeaker] = useState(false);

  // Lists from API
  const [categories, setCategories] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedSpeakers, setSelectedSpeakers] = useState([]);
  const [speakerSearch, setSpeakerSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    organizer_id: '',
    location: '',
    maps_link: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_quota: '',
    visibility: 'public',
    status: 'draft',
  });

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [catRes, orgRes, spkRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/organizers').catch(() => ({ data: [] })),
          api.get('/speakers').catch(() => ({ data: [] })),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
        setOrganizers(Array.isArray(orgRes.data) ? orgRes.data : orgRes.data?.data || []);
        setSpeakers(Array.isArray(spkRes.data) ? spkRes.data : spkRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load lists', err);
      }
    };
    fetchLists();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const processFile = (f) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleSpeaker = (spk) => {
    setSelectedSpeakers(prev =>
      prev.find(s => s.id === spk.id)
        ? prev.filter(s => s.id !== spk.id)
        : [...prev, spk]
    );
  };

  const handleCreateSpeaker = async () => {
    if (!newSpeaker.name) {
      toast.error('Nama pembicara wajib diisi');
      return;
    }
    setCreatingSpeaker(true);
    try {
      const payload = new FormData();
      payload.append('name', newSpeaker.name);
      if (newSpeaker.position) payload.append('position', newSpeaker.position);
      if (newSpeaker.institution) payload.append('institution', newSpeaker.institution);
      if (newSpeakerPhoto) payload.append('photo', newSpeakerPhoto);

      const res = await api.post('/speakers', payload);
      const created = { 
        id: res.data.speaker_id || res.data.id, 
        name: newSpeaker.name, 
        position: newSpeaker.position, 
        institution: newSpeaker.institution,
        photo: res.data.photo 
      };
      setSpeakers([...speakers, created]);
      setSelectedSpeakers([...selectedSpeakers, created]);
      setShowNewSpeakerForm(false);
      setNewSpeaker({ name: '', position: '', institution: '' });
      setNewSpeakerPhoto(null);
      toast.success('Pembicara berhasil ditambahkan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pembicara baru');
    } finally {
      setCreatingSpeaker(false);
    }
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setFormError('');

    // Manual required fields validation since buttons are type="button"
    if (!formData.title.trim()) {
      setFormError('Judul acara wajib diisi.');
      return window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (status === 'published') {
      if (!formData.location.trim()) {
        setFormError('Lokasi wajib diisi untuk acara yang diterbitkan.');
        return window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (!formData.start_date) {
        setFormError('Tanggal mulai wajib diisi untuk acara yang diterbitkan.');
        return window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // Real-time Date Validations
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        setFormError('Tanggal berakhir harus setelah tanggal mulai.');
        return window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    if (formData.registration_deadline && formData.start_date) {
      const deadline = new Date(formData.registration_deadline);
      const start = new Date(formData.start_date);
      // Deadline must be before or equal to start date
      if (deadline > start) {
        setFormError('Batas pendaftaran harus sebelum atau sama dengan tanggal mulai acara.');
        return window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Deadline must be >= now
      const now = new Date();
      if (deadline < now) {
        setFormError('Batas pendaftaran tidak boleh di masa lalu.');
        return window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries({ ...formData, status }).forEach(([k, v]) => {
        if (v !== '' && k !== 'max_quota') payload.append(k, v);
      });
      // Handle Quota
      if (formData.visibility !== 'public' && formData.max_quota) {
        payload.append('max_quota', formData.max_quota);
      }
      
      if (selectedSpeakers.length > 0) {
        payload.append('speaker_ids', JSON.stringify(selectedSpeakers.map(s => s.id)));
      }
      if (file) payload.append('banner', file);

      await api.post('/events', payload);

      setSuccess(true);
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      console.error('Failed to create event', err);
      setFormError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan acara.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const filteredSpeakers = speakers.filter(s =>
    s.name.toLowerCase().includes(speakerSearch.toLowerCase())
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Acara Berhasil Disimpan!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Mengarahkan ke halaman manajemen acara...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-indigo-500 transition-colors">Beranda</Link>
            <span>/</span>
            <Link to="/admin/events" className="hover:text-indigo-500 transition-colors">Acara (Sinkron Data)</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200">Buat Baru</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-md">
              <Plus size={16} className="text-white" />
            </div>
            Buat Acara Baru
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Isi semua detail untuk menerbitkan atau menyimpan draf acara.</p>
        </div>
        <Link
          to="/admin/events"
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
        >
          ← Kembali
        </Link>
      </div>

      {/* Error Message UI */}
      {formError && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4 rounded-r-xl animate-fade-in-up">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-rose-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-rose-700 dark:text-rose-400 font-semibold">{formError}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. Banner Upload ─────────────────────────────────────────────── */}
      <FormSection title="Spanduk / Banner Acara" icon={ImageIcon}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-300 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/*"
          />
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Preview" className="w-full h-52 object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold text-sm">Klik untuk ganti gambar</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <ImageIcon size={26} className="text-slate-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1">Klik atau seret gambar ke sini</p>
              <p className="text-slate-400 text-xs">PNG, JPG, WEBP — maks. 5 MB</p>
            </div>
          )}
        </div>
      </FormSection>

      {/* ── 2. Informasi Dasar ───────────────────────────────────────────── */}
      <FormSection title="Informasi Dasar" icon={CalendarIcon}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InputField label="Judul Acara" required>
              <input
                name="title" value={formData.title} onChange={handleChange} required
                type="text" placeholder="Contoh: Seminar Nasional AI 2026"
                className={inputClass}
              />
            </InputField>
          </div>

          <InputField label="Kategori">
            <div className="relative">
              <select name="category_id" value={formData.category_id} onChange={handleChange} className={inputClass + ' appearance-none pr-10 cursor-pointer'}>
                <option value="">-- Pilih Kategori --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Belum ada kategori. Tambahkan kategori terlebih dahulu melalui API.
              </p>
            )}
          </InputField>

          <InputField label="Visibilitas" hint="Private = hanya pengguna terdaftar">
            <div className="grid grid-cols-2 gap-2">
              {['public', 'private'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, visibility: v }))}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    formData.visibility === v
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {v === 'public' ? <Globe size={15} /> : <Lock size={15} />}
                  {v === 'public' ? 'Publik' : 'Privat'}
                </button>
              ))}
            </div>
          </InputField>

          <InputField label="Kuota Peserta" hint={formData.visibility === 'public' ? 'Otomatis dinonaktifkan (tanpa batas) untuk acara publik' : 'Kosongkan jika tidak terbatas'}>
            <div className="relative">
              <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                name="max_quota" value={formData.visibility === 'public' ? '' : formData.max_quota} onChange={handleChange}
                type="number" min="0" placeholder={formData.visibility === 'public' ? 'Tanpa Batas' : 'Contoh: 200'}
                disabled={formData.visibility === 'public'}
                className={`${inputClass} pl-10 ${formData.visibility === 'public' ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
              />
            </div>
          </InputField>

          <InputField label="Lokasi" required>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                name="location" value={formData.location} onChange={handleChange}
                type="text" placeholder="Contoh: Auditorium Utama"
                className={inputClass + ' pl-10'}
              />
            </div>
          </InputField>

          <InputField label="Tautan Maps" hint="Link Google Maps (opsional)">
            <div className="relative">
              <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                name="maps_link" value={formData.maps_link} onChange={handleChange}
                type="url" placeholder="https://maps.google.com/..."
                className={inputClass + ' pl-10'}
              />
            </div>
          </InputField>

          <InputField label="Tanggal Mulai" required>
            <div className="relative">
              <CalendarIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input name="start_date" value={formData.start_date} onChange={handleChange} required type="datetime-local" className={inputClass + ' pl-10'} />
            </div>
          </InputField>

          <InputField label="Tanggal Berakhir">
            <div className="relative">
              <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input name="end_date" value={formData.end_date} onChange={handleChange} type="datetime-local" className={inputClass + ' pl-10'} />
            </div>
          </InputField>

          <InputField label="Batas Pendaftaran">
            <div className="relative">
              <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input name="registration_deadline" value={formData.registration_deadline} onChange={handleChange} type="datetime-local" className={inputClass + ' pl-10'} />
            </div>
          </InputField>

          <div className="md:col-span-2">
            <InputField label="Deskripsi Acara">
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                rows={5} placeholder="Tuliskan deskripsi lengkap acara, rundown, persyaratan peserta, dll."
                className={inputClass + ' resize-none'}
              />
            </InputField>
          </div>
        </div>
      </FormSection>

      {/* ── 3. Organisasi Penyelenggara ──────────────────────────────────── */}
      <FormSection title="Organisasi Penyelenggara" icon={Building2}>
        <InputField label="Pilih Penyelenggara" hint="Organisasi atau unit yang bertanggung jawab atas acara ini">
          <div className="relative">
            <select name="organizer_id" value={formData.organizer_id} onChange={handleChange} className={inputClass + ' appearance-none pr-10 cursor-pointer'}>
              <option value="">-- Tidak ada penyelenggara --</option>
              {organizers.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </InputField>
        {formData.organizer_id && organizers.find(o => o.id == formData.organizer_id) && (
          <div className="flex items-center gap-3 p-3.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
              <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                {organizers.find(o => o.id == formData.organizer_id)?.name}
              </p>
              <p className="text-xs text-indigo-600/70 dark:text-indigo-500">
                {organizers.find(o => o.id == formData.organizer_id)?.email || 'Tidak ada email'}
              </p>
            </div>
          </div>
        )}
        {organizers.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
            Belum ada penyelenggara. Tambahkan penyelenggara terlebih dahulu melalui API.
          </p>
        )}
      </FormSection>

      {/* ── 4. Pembicara ─────────────────────────────────────────────────── */}
      <FormSection title="Pembicara Acara" icon={Mic2}>
        {/* Selected */}
        {selectedSpeakers.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Terpilih ({selectedSpeakers.length})</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSpeakers.map(spk => (
                <span key={spk.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm rounded-full border border-indigo-200 dark:border-indigo-800 font-medium">
                  <span>{spk.name}</span>
                  <button type="button" onClick={() => toggleSpeaker(spk)} className="hover:text-rose-500 transition-colors">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search & Create New Speaker Action */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari pembicara..."
              value={speakerSearch}
              onChange={e => setSpeakerSearch(e.target.value)}
              className={inputClass + ' pl-10'}
            />
          </div>
          <button 
            type="button" 
            onClick={() => setShowNewSpeakerForm(!showNewSpeakerForm)}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap"
          >
            + Buat Baru
          </button>
        </div>

        {/* Inline Speaker Creation Form */}
        {showNewSpeakerForm && (
          <div className="mb-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/10 space-y-4 animate-fade-in-up">
            <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">Buat Pembicara Baru</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Nama Lengkap *" required value={newSpeaker.name} onChange={e => setNewSpeaker({...newSpeaker, name: e.target.value})} className={inputClass} />
              <div>
                <label className="block text-xs text-slate-500 mb-1">Foto Profil (Opsional)</label>
                <input type="file" accept="image/*" onChange={e => setNewSpeakerPhoto(e.target.files[0])} className="text-sm w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewSpeakerForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">Batal</button>
              <button type="button" disabled={creatingSpeaker} onClick={handleCreateSpeaker} className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">
                {creatingSpeaker ? 'Menyimpan...' : 'Simpan Pembicara'}
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {speakers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {filteredSpeakers.map(spk => {
                const isSelected = !!selectedSpeakers.find(s => s.id === spk.id);
                return (
                  <button
                    key={spk.id}
                    type="button"
                    onClick={() => toggleSpeaker(spk)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <img
                      src={spk.photo ? `http://localhost:5000${spk.photo.startsWith('/') ? '' : '/'}${spk.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(spk.name)}&background=6366f1&color=fff&size=40`}
                      alt={spk.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{spk.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{spk.position || spk.institution || 'Pembicara'}</p>
                    </div>
                    {isSelected && <CheckCircle size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 ml-auto" />}
                  </button>
                );
              })}
            </div>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 mt-3">
            Belum ada data pembicara di server. Silakan buat pembicara baru.
          </p>
        )}
      </FormSection>

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'draft')}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          💾 Simpan sebagai Draf
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'published')}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 flex items-center gap-2 justify-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>🚀 Terbitkan Acara</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
