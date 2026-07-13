const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const initDB = require('./src/config/dbInit');

// Route imports
const authRoutes        = require('./src/routes/authRoutes');
const userRoutes        = require('./src/routes/userRoutes');
const eventRoutes       = require('./src/routes/eventRoutes');
const categoryRoutes    = require('./src/routes/categoryRoutes');
const organizerRoutes   = require('./src/routes/organizerRoutes');
const speakerRoutes     = require('./src/routes/speakerRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const favoriteRoutes    = require('./src/routes/favoriteRoutes');
const galleryRoutes     = require('./src/routes/galleryRoutes');
const dashboardRoutes   = require('./src/routes/dashboardRoutes');
const aboutRoutes       = require('./src/routes/aboutRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174'
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/organizers',    organizerRoutes);
app.use('/api/speakers',      speakerRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/favorites',     favoriteRoutes);
app.use('/api/gallery',       galleryRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/about',         aboutRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SmartEvent Campus API is running!', status: 'success' });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`[SERVER] Running on http://localhost:${PORT}`);
      console.log(`[DB]     Connected to ${process.env.DB_HOST}`);
    });
  } catch (err) {
    console.error('[FATAL] Could not start server:', err.message);
    process.exit(1);
  }
};

start();
