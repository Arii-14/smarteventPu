import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Star, MapPin, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState([
    { label: 'Total Acara', value: '0', icon: <Calendar className="text-indigo-500" />, color: 'from-blue-500 to-cyan-400' },
    { label: 'Peserta Aktif', value: '0+', icon: <Users className="text-indigo-500" />, color: 'from-purple-500 to-pink-400' },
    { label: 'Rating Rata-rata', value: '0/5', icon: <Star className="text-amber-500" />, color: 'from-amber-400 to-orange-500' },
    { label: 'Tingkat Kepuasan', value: '0%', icon: <TrendingUp className="text-emerald-500" />, color: 'from-emerald-400 to-teal-500' },
  ]);

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          api.get('/dashboard/stats').catch(() => ({ data: {} })),
          api.get('/events?limit=4&status=published')
        ]);
        
        if (eventsRes.data && eventsRes.data.data) {
          setFeaturedEvents(eventsRes.data.data);
        }

        const s = statsRes.data;
        if (s && s.totalEvents !== undefined) {
          setStats([
            { label: 'Total Acara', value: s.totalEvents.toString(), icon: <Calendar className="text-indigo-500" />, color: 'from-blue-500 to-cyan-400' },
            { label: 'Peserta Aktif', value: s.activeUsers ? `${s.activeUsers}+` : '100+', icon: <Users className="text-indigo-500" />, color: 'from-purple-500 to-pink-400' },
            { label: 'Rating Rata-rata', value: '4.8/5', icon: <Star className="text-amber-500" />, color: 'from-amber-400 to-orange-500' },
            { label: 'Tingkat Kepuasan', value: '98%', icon: <TrendingUp className="text-emerald-500" />, color: 'from-emerald-400 to-teal-500' },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl opacity-60 dark:bg-indigo-900/30 mix-blend-multiply dark:mix-blend-screen animate-float" />
          <div className="absolute top-[30%] right-[10%] w-96 h-96 bg-sky-400/20 rounded-full blur-3xl opacity-60 dark:bg-sky-900/20 mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-medium text-sm mb-6 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm transition-transform hover:scale-105">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                Acara baru ditambahkan hari ini
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                Temukan Acara <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 dark:from-indigo-400 dark:to-sky-400 animate-pulse">
                  Kampus dengan Mudah
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Temukan seminar, lokakarya, kompetisi, program pelatihan, aktivitas mahasiswa, webinar, dan acara kampus dalam satu platform modern.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/events" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:-translate-y-1 hover:scale-105 group">
                  Jelajahi Acara <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center hover:-translate-y-1 hover:scale-105">
                  Daftar Sekarang
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none animate-fade-in-up delay-200">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl glass gradient-border-always">
                <div className="p-1.5 rounded-2xl bg-white dark:bg-slate-900 h-full w-full absolute inset-0 -z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                  alt="Mahasiswa berkolaborasi" 
                  className="w-full h-[400px] object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className={`flex flex-col items-center justify-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-md border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 relative bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 animate-fade-in-up">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Acara Unggulan</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl">Jangan lewatkan acara-acara yang sangat dinanti ini.</p>
            </div>
            <Link to="/events" className="hidden sm:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors group">
              Lihat semua <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : featuredEvents.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-5">
                  <Calendar size={36} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Acara</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Saat ini belum ada acara yang tersedia. Silakan cek kembali nanti.</p>
              </div>
            ) : (
              featuredEvents.map((event, idx) => {
                const now = new Date();
                const start = event.start_date ? new Date(event.start_date) : null;
                const end = event.end_date ? new Date(event.end_date) : null;
                const isOngoing = start && end && start <= now && end >= now;
                const isFinished = end && end < now;

                return (
                <motion.div 
                  key={event.id} 
                  className={`animate-fade-in-up delay-${(idx+1)*100} h-full`}
                  whileHover={{ y: -8, scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link to={`/events/${event.id}`} className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl h-full gradient-border-always p-[1.5px] block">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden h-full flex flex-col relative z-10">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={event.banner ? (event.banner.startsWith('http') || event.banner.startsWith('data:') ? event.banner : `http://localhost:5000${event.banner.startsWith('/') ? '' : '/'}${event.banner}`) : `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60`} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Tags */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-300 border border-white/20">
                            {event.category_name || 'Acara'}
                          </span>
                          {isOngoing && (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md bg-blue-100/90 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300 border border-white/20 animate-pulse">
                              🔴 Berlangsung
                            </span>
                          )}
                          {isFinished && (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md bg-slate-100/90 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border border-white/20">
                              ✅ Selesai
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            <Calendar size={16} className="mr-2 shrink-0 text-indigo-400" />
                            <span>
                              {new Date(event.start_date).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            <MapPin size={16} className="mr-2 shrink-0 text-emerald-400" />
                            <span className="truncate">{event.location || 'Lokasi belum ditentukan'}</span>
                          </div>
                        </div>
                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center relative overflow-hidden">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate pr-2 relative z-10">
                            Oleh {event.organizer_name || 'Penyelenggara'}
                          </span>
                          <span className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 relative z-10 hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                            Detail
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );})
            )}
          </div>
          
          <div className="mt-10 text-center sm:hidden animate-fade-in-up delay-500">
            <Link to="/events" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
              Lihat semua acara <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
