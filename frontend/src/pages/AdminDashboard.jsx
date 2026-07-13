import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import DashboardHero from '../components/admin/DashboardHero';
import StatCards from '../components/admin/StatCards';
import RecentRegistrations from '../components/admin/RecentRegistrations';
import QuickActions from '../components/admin/QuickActions';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';
import LatestEvents from '../components/admin/LatestEvents';
import ActivityTimeline from '../components/admin/ActivityTimeline';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [latestEvents, setLatestEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading before fetching
    if (authLoading) return;

    const fetchDashboardData = async () => {
      setError(null);
      try {
        const [statsRes, regRes, eventsRes, catRes, orgRes] = await Promise.all([
          api.get('/dashboard/stats').catch(err => ({ data: {}, error: err })),
          api.get('/dashboard/recent-registrations').catch(() => ({ data: [] })),
          api.get('/events').catch(() => ({ data: { data: [] } })),
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/organizers').catch(() => ({ data: [] })),
        ]);

        // Check if stats had an auth error
        if (statsRes.error && statsRes.error.response?.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login ulang.');
          setLoading(false);
          return;
        }

        const rawEvents = eventsRes.data?.data || eventsRes.data || [];
        
        const enhancedStats = {
          ...statsRes.data,
          totalCategories: (catRes.data?.data || catRes.data || []).length,
          totalOrganizers: (orgRes.data?.data || orgRes.data || []).length,
          publishedEvents: rawEvents.filter(e => e.status === 'published').length,
          draftEvents: rawEvents.filter(e => e.status === 'draft').length,
          archivedEvents: rawEvents.filter(e => e.status === 'archived').length,
          todayRegistrations: (() => {
            const arr = Array.isArray(regRes.data) ? regRes.data : [];
            const today = new Date().toDateString();
            const count = arr.filter(r => new Date(r.time).toDateString() === today).length;
            return count;
          })(),
        };

        setStats(enhancedStats);
        setRecentRegistrations(Array.isArray(regRes.data) ? regRes.data : []);
        
        const sortedEvents = [...rawEvents].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setLatestEvents(sortedEvents);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Gagal memuat data dasbor.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100 dark:border-indigo-900/30" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Menyiapkan dasbor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      {/* Top Hero Section */}
      <DashboardHero stats={stats} />

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Charts */}
          <div className="h-[300px]">
             <AnalyticsCharts />
          </div>

          {/* Registrations Table */}
          <RecentRegistrations registrations={recentRegistrations} />
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-4 sm:space-y-6">
          <QuickActions />
          <div className="h-[320px]">
             <LatestEvents events={latestEvents} />
          </div>
          <ActivityTimeline />
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
