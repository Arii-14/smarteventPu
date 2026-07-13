import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Camera, Mic2, X, Building2, User } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminSpeakers = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    institution: '',
    biography: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      const { data } = await api.get('/speakers');
      setSpeakers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Failed to fetch speakers', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (sp = null) => {
    if (sp) {
      setEditingId(sp.id);
      setFormData({
        name: sp.name,
        position: sp.position || '',
        institution: sp.institution || '',
        biography: sp.biography || '',
      });
      setPhotoPreview(sp.photo ? `http://localhost:5000${sp.photo}` : null);
    } else {
      setEditingId(null);
      setFormData({ name: '', position: '', institution: '', biography: '' });
      setPhotoPreview(null);
    }
    setPhoto(null);
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(formData).forEach(key => fd.append(key, formData[key]));
    if (photo) fd.append('photo', photo);

    try {
      if (editingId) {
        await api.put(`/speakers/${editingId}`, fd);
      } else {
        await api.post('/speakers', fd);
      }
      setShowModal(false);
      toast.success(editingId ? 'Pembicara diperbarui.' : 'Pembicara ditambahkan.');
      fetchSpeakers();
    } catch (err) {
      toast.error('Gagal menyimpan pembicara.');
    }
  };

  const handleDelete = async (id, speakerName) => {
    const ok = await confirm({
      title: 'Hapus Pembicara',
      message: `Yakin ingin menghapus pembicara "${speakerName}"?`,
      variant: 'danger',
      confirmLabel: 'Ya, Hapus',
    });
    if (!ok) return;
    try {
      await api.delete(`/speakers/${id}`);
      setSpeakers(speakers.filter(s => s.id !== id));
      toast.success('Pembicara dihapus.');
    } catch (err) {
      toast.error('Gagal menghapus pembicara.');
    }
  };

  const filtered = speakers.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.institution?.toLowerCase().includes(search.toLowerCase()) ||
    s.position?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
              <Mic2 size={16} className="text-white" />
            </div>
            Kelola Pembicara
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{speakers.length}</span> pembicara terdaftar
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-500/20 hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={16} /> Tambah Pembicara
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm group">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
        <input
          type="text"
          placeholder="Cari pembicara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 animate-pulse">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Mic2 size={28} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              {search ? 'Pembicara tidak ditemukan' : 'Belum ada pembicara'}
            </p>
            {!search && (
              <button
                onClick={() => openModal()}
                className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Tambah pembicara pertama →
              </button>
            )}
          </div>
        ) : (
          filtered.map((sp) => (
            <div
              key={sp.id}
              className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 group relative hover:border-violet-300 dark:hover:border-violet-700/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
            >
              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <button
                  onClick={() => openModal(sp)}
                  className="p-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={13} />
                </button>
                <button
                  onClick={() => handleDelete(sp.id, sp.name)}
                  className="p-1.5 text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Card Content */}
              <div className="flex flex-col items-center text-center pt-2">
                <div className="relative mb-3">
                  <img
                    src={sp.photo ? `http://localhost:5000${sp.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(sp.name)}&background=7c3aed&color=fff&size=80&bold=true`}
                    alt={sp.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center border-2 border-white dark:border-slate-800">
                    <Mic2 size={10} className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{sp.name}</h3>
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-0.5">{sp.position || 'Pembicara'}</p>
                {sp.institution && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Building2 size={10} className="text-slate-400 shrink-0" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{sp.institution}</p>
                  </div>
                )}
                {sp.biography && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 line-clamp-2 leading-relaxed">{sp.biography}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mic2 size={16} className="text-violet-600 dark:text-violet-400" />
                {editingId ? 'Edit Pembicara' : 'Tambah Pembicara'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Photo Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-violet-300 dark:border-violet-700 flex items-center justify-center cursor-pointer overflow-hidden hover:border-violet-500 transition-colors group bg-violet-50 dark:bg-violet-900/10"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Camera size={22} className="text-violet-400 group-hover:text-violet-600 transition-colors" />
                        <span className="text-[9px] text-violet-400 font-medium">Foto</span>
                      </div>
                    )}
                  </div>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-md"
                    >
                      <X size={10} />
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400">Klik untuk upload foto profil</p>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Nama Lengkap *</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Dr. Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Posisi / Jabatan</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contoh: Dosen"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Institusi</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Contoh: Univ. X"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Biografi Singkat</label>
                <textarea
                  rows="3"
                  value={formData.biography}
                  onChange={e => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Deskripsi singkat tentang pembicara..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-500/25 hover:-translate-y-0.5"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Pembicara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpeakers;
