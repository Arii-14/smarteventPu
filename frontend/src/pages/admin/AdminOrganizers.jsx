import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Camera, Mail, Phone, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
  });
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const { data } = await api.get('/organizers');
      setOrganizers(data);
    } catch (err) {
      console.error('Failed to fetch organizers', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (org = null) => {
    if (org) {
      setEditingId(org.id);
      setFormData({
        name: org.name,
        description: org.description || '',
        email: org.email || '',
        phone: org.phone || '',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', email: '', phone: '' });
    }
    setLogo(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(formData).forEach(key => fd.append(key, formData[key]));
    if (logo) fd.append('logo', logo);

    try {
      if (editingId) {
        await api.put(`/organizers/${editingId}`, fd);
      } else {
        await api.post('/organizers', fd);
      }
      setShowModal(false);
      fetchOrganizers();
    } catch (err) {
      toast.error('Gagal menyimpan penyelenggara. Coba lagi.');
    }
  };

  const handleDelete = async (id, orgName) => {
    const ok = await confirm({
      title: 'Hapus Penyelenggara',
      message: `Yakin ingin menghapus penyelenggara "${orgName}"?`,
      variant: 'danger',
      confirmLabel: 'Ya, Hapus',
    });
    if (!ok) return;
    try {
      await api.delete(`/organizers/${id}`);
      setOrganizers(organizers.filter(o => o.id !== id));
      toast.success('Penyelenggara berhasil dihapus.');
    } catch (err) {
      toast.error('Gagal menghapus penyelenggara.');
    }
  };

  const handleContactWA = (phone, name) => {
    if (!phone) return;
    const defaultTemplate = localStorage.getItem('wa_template') || 'Halo [nama_organizer], saya ingin menghubungi Anda terkait acara di SmartEvent Campus. Mohon informasinya.';
    const msg = encodeURIComponent(defaultTemplate.replace('[nama_organizer]', name));
    
    // format phone to international (assumes ID)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
  };

  const handleContactEmail = (email, name) => {
    if (!email) return;
    const subject = encodeURIComponent('Koordinasi Acara - SmartEvent Campus');
    const body = encodeURIComponent(`Halo Tim ${name},\n\n`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Penyelenggara</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar organisasi yang menyelenggarakan acara.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Tambah Penyelenggara
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-slate-500">Memuat data...</p>
        ) : organizers.map((org) => (
          <motion.div key={org.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 group">
            <div className="flex items-start justify-between mb-4">
              <img
                src={org.logo ? `${import.meta.env.PROD ? '' : 'http://localhost:5000'}${org.logo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}`}
                alt={org.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(org)} className="p-1.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"><Edit size={14} /></button>
                <button onClick={() => handleDelete(org.id, org.name)} className="p-1.5 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-900 dark:text-white truncate">{org.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-4 h-8">{org.description}</p>
            
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => handleContactWA(org.phone, org.name)}
                disabled={!org.phone}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button 
                onClick={() => handleContactEmail(org.email, org.name)}
                disabled={!org.email}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 text-xs font-medium hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={14} /> Email
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 dark:text-white">{editingId ? 'Edit' : 'Tambah'} Penyelenggara</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div onClick={() => fileInputRef.current.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden">
                  {logo ? <img src={URL.createObjectURL(logo)} className="w-full h-full object-cover"/> : <Camera className="text-slate-400" />}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => setLogo(e.target.files[0])} />
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Nama Penyelenggara</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email (Opsional)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Nomor HP (Opsional)</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08..." className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Deskripsi</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-indigo-500 resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizers;
