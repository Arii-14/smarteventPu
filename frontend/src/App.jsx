import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import EventManagement from './pages/EventManagement';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import ScanResult from './pages/ScanResult';
import AdminUsers from './pages/AdminUsers';
import AdminAboutSettings from './pages/AdminAboutSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Import New Admin Pages
import AdminCategories from './pages/admin/AdminCategories';
import AdminSpeakers from './pages/admin/AdminSpeakers';
import AdminOrganizers from './pages/admin/AdminOrganizers';
import AdminParticipants from './pages/admin/AdminParticipants';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminSettings from './pages/admin/AdminSettings';

// Theme Context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const Layout = () => {
  const location = useLocation();
  // Only show footer on Home (/), Events (/events...), and About (/about)
  const showFooter = location.pathname === '/' || location.pathname.startsWith('/events') || location.pathname.startsWith('/about');

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="events" element={<EventList />} />
                  <Route path="events/:id" element={<EventDetail />} />
                  <Route path="about" element={<About />} />
                  
                  {/* Auth Routes */}
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="verify-otp" element={<VerifyOTP />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password/:token" element={<ResetPassword />} />

                  {/* Protected User Routes */}
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                  <Route path="scan/:token" element={<ScanResult />} />
                </Route>
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="events" element={<EventManagement />} />
                  <Route path="events/create" element={<CreateEvent />} />
                  <Route path="events/edit/:id" element={<EditEvent />} />
                  
                  {/* New Admin Pages */}
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="speakers" element={<AdminSpeakers />} />
                  <Route path="organizers" element={<AdminOrganizers />} />
                  <Route path="participants" element={<AdminParticipants />} />
                  <Route path="registrations" element={<AdminRegistrations />} />
                  <Route path="settings" element={<AdminSettings />} />
                  
                  {/* Super Admin Only */}
                  <Route path="users" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminUsers /></ProtectedRoute>} />
                  <Route path="about-settings" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminAboutSettings /></ProtectedRoute>} />
                </Route>
              </Routes>
            </Router>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
