import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Globe } from 'lucide-react';

// Simple inline SVG social icons
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const Footer = () => {
  return (
    <footer className="relative bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #6366f1, #0ea5e9, #10b981)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/upu.png" alt="SmartEventPU Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                SmartEvent<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500">PU</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              Temukan, daftarkan, dan kelola acara kampus dengan mudah dalam satu platform modern dan responsif.
            </p>
            <div className="flex space-x-3 pt-2">
              {[<FacebookIcon />, <TwitterIcon />, <InstagramIcon />, <LinkedinIcon />].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-indigo-500 hover:to-sky-500 transition-all duration-300 hover:scale-110 hover:shadow-md"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li><Link to="/events" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 inline-block duration-200">🎯 Jelajahi Acara</Link></li>
              <li><Link to="/about" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 inline-block duration-200">ℹ️ Tentang Kami</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 inline-block duration-200">Syarat & Ketentuan</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 inline-block duration-200">Kebijakan Privasi</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 inline-block duration-200">Kebijakan Cookie</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <MapPin size={15} className="text-indigo-500" />
                </div>
                <span>Jl. K.L Yos Sudarso, Km. 6,5 , No. 3-a, Tj. Mulia, Kec. Medan Deli<br />Kota Medan, Sumatera Utara 20241</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                  <Phone size={15} className="text-sky-500" />
                </div>
                <span>+62 821-2401-8525</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <Globe size={15} className="text-emerald-500" />
                </div>
                <a href="https://potensi-utama.ac.id/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">potensi-utama.ac.id</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-300">Smart Event Campus</span>. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Berjalan Normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
