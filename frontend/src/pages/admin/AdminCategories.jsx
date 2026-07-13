import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cat = null) => {
    if (cat) {
      setEditingId(cat.id);
      setName(cat.name);
    } else {
      setEditingId(null);
      setName('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
      } else {
        await api.post('/categories', { name });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id, catName) => {
    const ok = await confirm({
      title: 'Hapus Kategori',
      message: `Yakin ingin menghapus kategori "${catName}"?`,
      variant: 'danger',
      confirmLabel: 'Ya, Hapus',
    });
    if (!ok) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Kategori berhasil dihapus.');
    } catch (err) {
      toast.error('Gagal menghapus kategori.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Kategori</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar kategori acara.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500">Memuat data...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800/70">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nama Kategori</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Slug</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">{cat.name}</td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">{cat.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openModal(cat)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg mx-1"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg mx-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">Belum ada kategori</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-4 dark:text-white">{editingId ? 'Edit' : 'Tambah'} Kategori</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Nama Kategori</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:border-indigo-500" />
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

export default AdminCategories;
