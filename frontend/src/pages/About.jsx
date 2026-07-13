import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, BookOpen, Bell, History, Users, Eye, Target,
  CheckCircle, ClipboardList, Globe, UserCheck, Zap, Info,
  Mail, Phone, MapPin, Monitor
} from 'lucide-react';
import api from '../services/api';

// Inline SVG brand icons (lucide-react removed these)
const YoutubeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);
const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);
const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const WhatsappIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

/* =========================================================
   ANIMATION VARIANTS
   ========================================================= */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* Animated section wrapper */
const AnimSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* =========================================================
   MOCK SITE SETTINGS
   ========================================================= */
const siteSettings = {
  universityName: 'Universitas Potensi Utama',
  websiteName: 'SmartEventPU',
  primaryColor: '#4f46e5',
  address1Title: 'Gedung A',
  address1: 'Jl. K.L Yos Sudarso, Km. 6,5 , No. 3-a, Tj. Mulia, Kec. Medan Deli\nKota Medan, Sumatera Utara 20241',
  address2Title: 'Gedung B',
  address2: 'Jl. K.L Yos Sudarso, Gg. Famili No.247, Tj. Mulia, Kec. Medan Deli\nKota Medan, Sumatera Utara 20241',
  phone: '+62 821-2401-8525',
  email: 'tendouariisu@gmail.com',
  website: 'https://potensi-utama.ac.id',
  mapsEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.0189808082853!2d98.69430511470785!3d3.6249139979710783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303132ba5b0b6281%3A0x4ee3bd5b434dca0c!2sUniversitas%20Potensi%20Utama!5e0!3m2!1sid!2sid!4v1625000000000!5m2!1sid!2sid',
  facebookUrl: '#',
  instagramUrl: '#',
  tiktokUrl: '#',
  youtubeUrl: '#',
};

const Logo = ({ src, alt, size = 64, className = '' }) => {
  return <img src="/upu.png" alt={alt || "Logo"} style={{ width: size, height: size }} className={`object-contain ${className}`} />;
};

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const About = () => {
  const s = siteSettings;
  const [developers, setDevelopers] = useState([]);

  useEffect(() => {
    const fetchDevs = async () => {
      try {
        const { data } = await api.get('/about/developers');
        setDevelopers(data);
      } catch (err) {
        console.error('Failed to fetch developers', err);
      }
    };
    fetchDevs();
  }, []);

  const whyCards = [
    { icon: <ClipboardList size={28} className="text-indigo-600" />, title: 'Pendaftaran Mudah', desc: 'Daftar untuk acara kampus hanya dengan beberapa klik menggunakan formulir online yang mulus.' },
    { icon: <Bell size={28} className="text-indigo-600" />, title: 'Informasi Real-time', desc: 'Dapatkan pemberitahuan instan dan pembaruan langsung untuk semua acara mendatang.' },
    { icon: <UserCheck size={28} className="text-indigo-600" />, title: 'Organisasi Terpercaya', desc: 'Semua acara dikelola oleh departemen dan klub universitas yang terverifikasi.' },
    { icon: <Zap size={28} className="text-indigo-600" />, title: 'Platform Aman', desc: 'Data Anda dilindungi dengan praktik keamanan standar industri.' },
  ];

  const stats = [
    { value: '250+', label: 'Acara Kampus' },
    { value: '1500+', label: 'Mahasiswa' },
    { value: '30+', label: 'Organisasi' },
    { value: '98%', label: 'Kepuasan Pengguna' },
  ];

  const orgs = [
    { name: 'Departemen Ilmu Komputer', icon: <Monitor size={28} className="text-indigo-600 dark:text-indigo-400" /> },
    { name: 'Dewan Mahasiswa', icon: <Users size={28} className="text-sky-600 dark:text-sky-400" /> },
    { name: 'Komunitas Desain', icon: <Globe size={28} className="text-emerald-600 dark:text-emerald-400" /> },
    { name: 'Klub Teknologi', icon: <Zap size={28} className="text-amber-600 dark:text-amber-400" /> },
    { name: 'Klub Bisnis', icon: <Target size={28} className="text-rose-600 dark:text-rose-400" /> },
  ];

  const galleryImages = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-sky-900/90 mix-blend-multiply" />
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-30" alt="Background" />
        </div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium mb-8 border border-white/20 shadow-lg">
            <Info size={16} className="text-sky-400" /> Tentang Platform Ini
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">{s.websiteName}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {s.websiteName} adalah platform resmi manajemen acara kampus di {s.universityName}.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white font-bold rounded-full transition-all hover:-translate-y-1 hover:scale-105 shadow-xl shadow-indigo-600/30 group">
              Jelajahi Acara <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimSection className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeLeft} className="relative">
              <div className="gradient-border p-[2px] rounded-3xl">
                <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                    alt="Students collaborating"
                    className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-500/10 p-6 border border-slate-100 dark:border-slate-700 animate-float">
                <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">1500+</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Mahasiswa Aktif</p>
              </div>
            </motion.div>

            <motion.div variants={fadeRight} className="space-y-6">
              <div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span> Siapa Kami
                </span>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-4 leading-tight">
                  Platform yang Dibangun untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Kehidupan Kampus</span>
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {s.websiteName} membantu mahasiswa dan organisasi di {s.universityName} untuk dengan mudah berpartisipasi dalam kehidupan kampus.
              </p>

              <ul className="space-y-5 pt-4">
                {[
                  { icon: <Globe size={22} />, text: 'Temukan acara kampus dari semua departemen dan klub' },
                  { icon: <ClipboardList size={22} />, text: 'Daftar online tanpa dokumen fisik' },
                  { icon: <Bell size={22} />, text: 'Terima pembaruan acara dan notifikasi secara real-time' },
                  { icon: <History size={22} />, text: 'Lihat riwayat partisipasi acara Anda secara lengkap' },
                  { icon: <Users size={22} />, text: 'Bergabung dan ikuti organisasi kampus yang Anda sukai' },
                ].map((item, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-colors shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 pt-3 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimSection>
        </div>
      </section>

      <section className="py-24 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Tujuan Kami</span>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Visi & Misi</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={fadeLeft}
                className="gradient-border p-[1.5px] rounded-3xl group">
                <div className="bg-gradient-to-br from-indigo-600 to-sky-600 p-10 rounded-3xl text-white shadow-xl shadow-indigo-600/20 h-full relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8 backdrop-blur-sm border border-white/30">
                    <Eye size={32} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 relative z-10">Visi Kami</h3>
                  <p className="text-indigo-100 text-lg leading-relaxed relative z-10">
                    Menjadi platform digital utama untuk manajemen acara kampus di {s.universityName}, menciptakan ekosistem mahasiswa yang terhubung dan aktif.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeRight}
                className="gradient-border p-[1.5px] rounded-3xl group">
                <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-lg h-full group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-8 border border-sky-100 dark:border-sky-800">
                    <Target size={32} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Misi Kami</h3>
                  <ul className="space-y-4">
                    {[
                      'Menyederhanakan publikasi acara untuk semua organisasi kampus.',
                      'Meningkatkan partisipasi mahasiswa di semua fakultas.',
                      'Memusatkan semua aktivitas kampus dalam satu platform.',
                      'Mendigitalisasi pendaftaran dan manajemen acara untuk efisiensi.',
                    ].map((m, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle size={24} className="text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </AnimSection>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Keunggulan</span>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Mengapa Memilih {s.websiteName}?</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyCards.map((card, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeUp} 
                  className={`delay-${(i+1)*100}`}
                  whileHover={{ y: -8, scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="gradient-border-always p-[1.5px] rounded-2xl h-full shadow-lg">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 h-full flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                        {card.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{card.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20" alt="Stats background" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-sky-900/90 mix-blend-multiply" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimSection className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center group">
                <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform">{s.value}</div>
                <div className="text-sky-200 font-semibold text-lg uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </AnimSection>
        </div>
      </section>

      {/* MEET THE DEVELOPER(S) */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimSection>
            <motion.div variants={fadeUp} className="mb-12">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Di Balik Layar</span>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Temui Pengembang</h2>
            </motion.div>

            <div className={`grid grid-cols-1 ${developers.length > 1 ? 'md:grid-cols-2' : ''} gap-8`}>
              {developers.length === 0 ? (
                 <p className="text-slate-500 dark:text-slate-400 col-span-full">Belum ada profil pengembang.</p>
              ) : developers.map((dev) => (
                <motion.div key={dev.id} variants={fadeUp} className="gradient-border p-[2px] rounded-[2.5rem]">
                  <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-12 flex flex-col items-center relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 dark:bg-sky-400/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative mb-8 group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-full blur-md opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                      <img 
                        src={dev.photo_url ? `http://localhost:5000${dev.photo_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random`} 
                        alt={dev.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl relative z-10" 
                      />
                    </div>

                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{dev.name}</h3>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 font-bold text-lg mb-6">{dev.role}</p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mb-10 text-lg">
                      {dev.description}
                    </p>

                    <div className="flex gap-4 mt-auto">
                      {dev.github_url && (
                        <a href={dev.github_url} target="_blank" rel="noopener noreferrer"
                          className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-black transition-all hover:-translate-y-1 hover:shadow-lg">
                          <GithubIcon size={24} />
                        </a>
                      )}
                      {dev.instagram_url && (
                        <a href={dev.instagram_url} target="_blank" rel="noopener noreferrer"
                          className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-pink-600 hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg">
                          <InstagramIcon size={24} />
                        </a>
                      )}
                      {dev.facebook_url && (
                        <a href={dev.facebook_url} target="_blank" rel="noopener noreferrer"
                          className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg">
                          <FacebookIcon size={24} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Mitra Kami</span>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Organisasi Kampus</h2>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-6">
              {orgs.map((org, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeUp} 
                  className={`delay-${(i+1)*50}`}
                  whileHover={{ y: -5, scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="gradient-border-always p-[1.5px] rounded-2xl group cursor-pointer shadow-md">
                    <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-800 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {org.icon}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{org.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Momen</span>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Galeri Acara</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {galleryImages.map((img, i) => (
                <motion.div key={i} variants={fadeUp} className={`delay-${(i%3+1)*100}`}>
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-md border border-slate-200 dark:border-slate-700">
                    <img src={img} alt={`Acara ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Lihat Momen</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      <section className="py-0">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900">
            <img src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=20&w=1600" className="w-full h-full object-cover opacity-30" alt="Contact Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80 backdrop-blur-sm" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <AnimSection className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <motion.div variants={fadeLeft} className="space-y-10">
                <div className="flex items-center gap-5">
                  <Logo src={null} alt="Logo Universitas" size={80} className="shadow-2xl shadow-indigo-500/20" />
                  <div>
                    <p className="text-white font-extrabold text-2xl uppercase leading-tight tracking-wide">{s.universityName}</p>
                    <p className="text-sky-400 font-semibold mt-1">Platform {s.websiteName}</p>
                  </div>
                </div>

                <div className="space-y-6 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                  <div className="group">
                    <p className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                      <MapPin size={20} className="text-indigo-400 group-hover:text-sky-400 transition-colors" /> {s.address1Title}
                    </p>
                    <div className="pl-7">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">{s.address1}</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-white/10 my-4"></div>
                  <div className="group">
                    <p className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                      <MapPin size={20} className="text-indigo-400 group-hover:text-sky-400 transition-colors" /> {s.address2Title}
                    </p>
                    <div className="pl-7">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">{s.address2}</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-white/10 my-4"></div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-slate-300 hover:text-white transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                        <Phone size={18} />
                      </div>
                      <p className="font-semibold text-lg">{s.phone}</p>
                    </div>
                    <div className="flex items-center gap-4 text-slate-300 hover:text-white transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                        <Globe size={18} />
                      </div>
                      <a href={s.website} target="_blank" rel="noopener noreferrer" className="font-semibold">{s.website}</a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  {[
                    { href: s.facebookUrl, icon: <FacebookIcon size={20} />, label: 'Facebook', hoverBg: 'hover:bg-[#1877F2]' },
                    { href: s.instagramUrl, icon: <InstagramIcon size={20} />, label: 'Instagram', hoverBg: 'hover:bg-[#E4405F]' },
                    { href: s.tiktokUrl, icon: <TikTokIcon />, label: 'TikTok', hoverBg: 'hover:bg-black' },
                    { href: s.youtubeUrl, icon: <YoutubeIcon size={20} />, label: 'YouTube', hoverBg: 'hover:bg-[#FF0000]' },
                  ].map((social, i) => (
                    <a key={i} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white ${social.hoverBg} transition-all duration-300 hover:-translate-y-2 hover:scale-110 shadow-lg`}>
                      {social.icon}
                    </a>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeRight} className="gradient-border p-[2px] rounded-3xl h-full min-h-[500px]">
                <div className="rounded-3xl overflow-hidden bg-slate-800 h-full w-full relative group">
                  <div className="absolute inset-0 bg-indigo-500/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500 pointer-events-none"></div>
                  <iframe
                    src={s.mapsEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'contrast(1.2)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Universitas Potensi Utama"
                    className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </motion.div>

            </AnimSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
