import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
  const [waTemplate, setWaTemplate] = useState('Halo [nama_organizer], saya ingin menghubungi Anda terkait acara di SmartEvent Campus. Mohon informasinya.');
  const toast = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('wa_template');
    if (saved) setWaTemplate(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem('wa_template', waTemplate);
    toast.success('Pengaturan berhasil disimpan!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Sistem</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Konfigurasi preferensi panel admin.</p>
      </div>

      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Template Pesan WhatsApp</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Pesan otomatis ini akan digunakan ketika Anda menghubungi Penyelenggara via WhatsApp.
          <br/>Gunakan <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">[nama_organizer]</code> sebagai placeholder nama.
        </p>
        
        <textarea
          rows={4}
          value={waTemplate}
          onChange={(e) => setWaTemplate(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
        />

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Save size={16} /> Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
