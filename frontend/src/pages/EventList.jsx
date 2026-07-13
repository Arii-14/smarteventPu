import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Clock, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const categories = ['Semua', 'Seminar', 'Lokakarya', 'Kompetisi', 'Pelatihan', 'Webinar'];

const EventList = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let url = '/events';
        if (search) url += `?search=${search}`;
        
        // Match activeCategory to slug logic if real categories exist, but for now just frontend filtering or sending as param if we have them matched
        // Let's fetch all and filter on frontend for simplicity if they aren't real DB categories, or just use the DB categories
        
        const { data } = await api.get(url);
        let results = data.data || [];
        
        if (activeCategory !== 'Semua') {
          results = results.filter(e => e.category_name === activeCategory || e.category_slug === activeCategory.toLowerCase());
        }

        setEvents(results);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce for search
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 pt-16">
      {/* Top Header Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pt-10 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-sky-50/50 dark:from-indigo-900/10 dark:to-sky-900/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Jelajahi Acara</h1>
              <p className="text-slate-600 dark:text-slate-400">Temukan dan daftar untuk aktivitas kampus yang akan datang.</p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500 text-slate-400">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari acara berdasarkan judul, penyelenggara, atau lokasi..." 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white shadow-sm hover:shadow-md"
                />
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap shadow-sm hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
                  <Calendar size={18} /> Tanggal
                </button>
                <button className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap shadow-sm hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
                  <Filter size={18} /> Filter
                </button>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:-translate-y-0.5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex justify-between items-center mb-6 animate-fade-in-up delay-100">
          <p className="text-slate-600 dark:text-slate-400 font-medium">Menampilkan <span className="text-slate-900 dark:text-white font-bold">{events.length}</span> acara</p>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
            Urutkan: <span className="text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Terbaru</span> <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tidak ada acara ditemukan</h3>
            <p className="text-slate-500">Coba ubah kata kunci pencarian atau filter kategori.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, idx) => (
              <motion.div 
                key={event.id} 
                className={`animate-fade-in-up delay-${(idx % 3 + 1)*100}`}
                whileHover={{ y: -8, scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl h-full gradient-border-always p-[1.5px]">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden h-full flex flex-col relative z-10">
                    <div className="relative h-56 overflow-hidden">
                      <img src={event.banner ? (event.banner.startsWith('http') || event.banner.startsWith('data:') ? event.banner : `http://localhost:5000${event.banner.startsWith('/') ? '' : '/'}${event.banner}`) : `https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800`} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Tags */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-300 border border-white/20`}>
                          {event.category_name || 'Acara'}
                        </span>
                        {(() => {
                          const now = new Date();
                          const start = event.start_date ? new Date(event.start_date) : null;
                          const end = event.end_date ? new Date(event.end_date) : null;
                          const isOngoing = start && end && start <= now && end >= now;
                          const isFinished = end && end < now;
                          
                          if (isOngoing) return (
                            <span className="px-3 py-1.5 text-xs font-bold rounded-full shadow-sm backdrop-blur-md bg-blue-100/90 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300 border border-white/20 animate-pulse">
                              🔴 Berlangsung
                            </span>
                          );
                          if (isFinished) return (
                            <span className="px-3 py-1.5 text-xs font-bold rounded-full shadow-sm backdrop-blur-md bg-slate-100/90 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border border-white/20">
                              ✅ Selesai
                            </span>
                          );
                          return null;
                        })()}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-4">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-sky-500 transition-all line-clamp-2 leading-snug">
                          {event.title}
                        </h3>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                          <Calendar size={18} className="mr-3 text-indigo-400 shrink-0" />
                          <span>
                            {new Date(event.start_date).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-start text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                          <MapPin size={18} className="mr-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 mt-auto">
                        {event.description}
                      </p>

                      <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-100 dark:border-slate-700 relative overflow-hidden">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate pr-2">
                          Oleh {event.organizer_name || 'Penyelenggara'}
                        </span>
                        <Link to={`/events/${event.id}`} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-sky-500 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                          Daftar
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
