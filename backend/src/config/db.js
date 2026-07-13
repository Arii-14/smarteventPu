const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Vercel: gunakan CA dari environment variable jika ada
// Lokal: baca dari file ca.pem
let sslOptions;

if (process.env.DB_SSL_CA_CONTENT) {
  // Di Vercel, isi ca.pem dimasukkan sebagai environment variable
  sslOptions = {
    ca: Buffer.from(process.env.DB_SSL_CA_CONTENT, 'base64').toString('utf-8'),
  };
} else {
  // Lokal: baca dari file
  const caPath = path.join(__dirname, '../../../ca.pem');
  if (fs.existsSync(caPath)) {
    sslOptions = {
      ca: fs.readFileSync(caPath),
    };
  } else {
    // Fallback: izinkan koneksi tanpa SSL verify (tidak direkomendasikan di production)
    sslOptions = { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
