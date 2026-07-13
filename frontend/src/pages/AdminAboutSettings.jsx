import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, Plus, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const AdminAboutSettings = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role_title: '',
    github_url: '',
    instagram_url: '',
    facebook_url: '',
    description: ''
  });
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const { data } = await api.get('/about/developers');
      setDevelopers(data);
    } catch (err) {
      console.error('Failed to fetch developers', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (dev = null) => {
    setPhoto(null);
    if (dev) {
      setEditingId(dev.id);
      setFormData({
        name: dev.name,
        role_title: dev.role_title || '',
        github_url: dev.github_url || '',
        instagram_url: dev.instagram_url || '',
        facebook_url: dev.facebook_url || '',
        description: dev.description || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        role_title: '',
        github_url: '',
        instagram_url: '',
        facebook_url: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id, devName) => {
    const ok = await confirm({
      title: 'Hapus Profil',
      message: `Apakah Anda yakin ingin menghapus profil developer "${devName}"?`,
      variant: 'danger',
      confirmLabel: 'Ya, Hapus',
    });
    if (!ok) return;
    try {
      await api.delete(`/about/developers/${id}`);
      setDevelopers(developers.filter(d => d.id !== id));
      toast.success('Profil berhasil dihapus.');
    } catch (err) {
      toast.error('Gagal menghapus profil.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    if (photo) {
      submitData.append('photo', photo);
    }

    try {
      if (editingId) {
        await api.put(`/about/developers/${editingId}`, submitData);
      } else {
        await api.post('/about/developers', submitData);
      }

      await fetchDevelopers();
      setShowModal(false);
      toast.success(editingId ? 'Profil diperbarui.' : 'Profil ditambahkan.');
    } catch (err) {
      toast.error('Gagal menyimpan profil.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-sky-500 rounded-full"></span>
            Pengaturan Profil Pengembang
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Halaman Tentang Kami: Kelola profil pengembang (Hanya Super Admin).</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Pengembang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : developers.map((dev) => (
          <div key={dev.id} className="gradient-border p-[1.5px] rounded-2xl group">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(dev)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(dev.id, dev.name)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <img
                  src={dev.photo ? `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${dev.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random`}
                  alt={dev.name}
                  className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-700 object-cover mb-4"
                />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{dev.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4">{dev.role_title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3">{dev.description}</p>
                <div className="flex gap-4 mt-auto w-full justify-center pt-4 border-t border-slate-100 dark:border-slate-700">
                  {dev.github_url && <a href={dev.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium">GitHub</a>}
                  {dev.facebook_url && <a href={dev.facebook_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 text-sm font-medium">Facebook</a>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Profil' : 'Tambah Profil'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col items-center mb-6">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative overflow-hidden"
                >
                  {photo ? (
                    <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="text-slate-400 mb-1" size={24} />
                      <span className="text-[10px] text-slate-500">Pilih Foto</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peran / Jabatan</label>
                <input required type="text" value={formData.role_title} onChange={e => setFormData({ ...formData, role_title: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" placeholder="misal: Full Stack Developer" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                  <input type="url" value={formData.github_url} onChange={e => setFormData({ ...formData, github_url: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram URL</label>
                  <input type="url" value={formData.instagram_url} onChange={e => setFormData({ ...formData, instagram_url: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook URL</label>
                  <input type="url" value={formData.facebook_url} onChange={e => setFormData({ ...formData, facebook_url: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi Singkat</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAboutSettings;
