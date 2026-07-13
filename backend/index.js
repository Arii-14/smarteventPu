const express = require('express');
const cors = require('cors');

// Di Vercel, env vars sudah di-inject langsung — tidak perlu dotenv dari file
// Di lokal, dotenv dibaca dari .env di folder parent
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  const path = require('path');
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const initDB = require('./src/config/dbInit');

// Route imports
const authRoutes         = require('./src/routes/authRoutes');
const userRoutes         = require('./src/routes/userRoutes');
const eventRoutes        = require('./src/routes/eventRoutes');
const categoryRoutes     = require('./src/routes/categoryRoutes');
const organizerRoutes    = require('./src/routes/organizerRoutes');
const speakerRoutes      = require('./src/routes/speakerRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const favoriteRoutes     = require('./src/routes/favoriteRoutes');
const galleryRoutes      = require('./src/routes/galleryRoutes');
const dashboardRoutes    = require('./src/routes/dashboardRoutes');
const aboutRoutes        = require('./src/routes/aboutRoutes');
const imageRoutes        = require('./src/routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // allow any vercel.app subdomain
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ── DB Init (Production / Vercel) ─────────────────────────────────────────────
// Di production (Vercel): mulai init DB segera saat module di-load (cold start)
// Gate middleware dipasang di sini (sebelum routes) agar request tertahan sampai DB siap
let dbReady;
if (process.env.NODE_ENV === 'production') {
  dbReady = initDB().then(() => {
    console.log('[DB] Initialized on Vercel cold start');
    return true;
  }).catch(err => {
    console.error('[DB] Init error on cold start:', err.message);
    return false;
  });

  // Gate: tahan request sampai DB siap (max 10 detik) — HARUS sebelum routes!
  app.use(async (req, res, next) => {
    const ready = await Promise.race([
      dbReady,
      new Promise(resolve => setTimeout(() => resolve(false), 10000)),
    ]);
    if (!ready) {
      return res.status(503).json({ message: 'Database belum siap, coba lagi sebentar.' });
    }
    next();
  });
}

// ── API Routes ────────────────────────────────────────────────────────────────
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
app.use('/api/images',        imageRoutes);  // serve gambar dari DB

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SmartEvent Campus API is running!', status: 'success' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Start (lokal) / Export (Vercel) ──────────────────────────────────────────
// Vercel serverless: cukup export app — tidak perlu listen()
// Lokal: jalankan listen() secara normal
if (process.env.NODE_ENV !== 'production') {
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
}

module.exports = app;
