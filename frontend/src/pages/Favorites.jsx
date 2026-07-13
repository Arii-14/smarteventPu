import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data } = await api.get('/favorites');
        setFavorites(data);
      } catch (err) {
        console.error('Failed to fetch favorites', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const removeFavorite = async (eventId) => {
    try {
      await api.delete(`/favorites/${eventId}`);
      setFavorites(favorites.filter((f) => f.id !== eventId));
    } catch (err) {
      console.error('Failed to remove favorite', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FaHeart className="text-rose-500" /> Acara Favorit Saya
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 mb-4">
              <FaHeart size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Favorit</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Anda belum menambahkan acara ke daftar favorit.</p>
            <Link
              to="/events"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Cari Acara
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 dark:border-slate-700 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={event.banner ? (event.banner.startsWith('http') || event.banner.startsWith('data:') ? event.banner : `http://localhost:5000${event.banner.startsWith('/') ? '' : '/'}${event.banner}`) : `https://source.unsplash.com/random/800x600?event,${event.id}`}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full shadow-sm">
                      {event.category_name || 'Event'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFavorite(event.id)}
                    className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-rose-500 hover:scale-110 transition-transform shadow-sm"
                  >
                    <FaHeart size={18} />
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <FaCalendarAlt className="mr-2 text-indigo-500" />
                      {new Date(event.start_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link
                      to={`/events/${event.id}`}
                      className="block w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-sm"
                    >
                      Lihat Detail Acara
                    </Link>
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

export default Favorites;
