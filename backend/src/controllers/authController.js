const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dns = require('dns').promises;
const pool = require('../config/db');
const { sendOTPEmail, sendResetEmail } = require('../services/emailService');
const { generateOTP, storeOTP, verifyOTP, canRequestOTP } = require('../services/otpStore');

const validateEmailDomain = async (email) => {
  const domain = email.split('@')[1];
  if (!domain) return false;
  try {
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (err) {
    return false;
  }
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 12;

/** Generate JWT token */
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, student_id, university } = req.body;

    if (!username || !email || !password || !confirmPassword || !student_id || !university) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password tidak cocok.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    // Block Super Admin email from registering as regular user
    if (email.toLowerCase() === process.env.Super_Admin_Email_?.toLowerCase()) {
      return res.status(400).json({ message: 'Email ini tidak dapat digunakan untuk registrasi.' });
    }

    const rateLimit = canRequestOTP(email);
    if (!rateLimit.allowed) {
      return res.status(429).json({ message: rateLimit.reason });
    }

    const isValidDomain = await validateEmailDomain(email);
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Alamat email tidak valid (domain tidak ditemukan).' });
    }

    const [existing] = await pool.query('SELECT id, is_verified FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      if (!existing[0].is_verified) {
        // If not verified, update data instead of blocking
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await pool.query(
          'UPDATE users SET username=?, password=?, student_id=?, university=? WHERE email=?',
          [username.trim(), passwordHash, student_id, university, email.toLowerCase()]
        );
      } else {
        return res.status(409).json({ message: 'Email sudah terdaftar.' });
      }
    } else {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query(
        'INSERT INTO users (username, email, password, student_id, university, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)',
        [username.trim(), email.toLowerCase(), passwordHash, student_id, university]
      );
    }

    // Generate and store OTP (server-side only, never returned in response)
    const otp = generateOTP();
    storeOTP(email, otp);
    
    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error('[register email error]', emailErr.message);
      console.log(`[DEV OTP]: ${otp} for ${email}`); // Fallback for dev mode
    }

    return res.status(201).json({
      message: 'Registrasi berhasil. Kode OTP telah dikirim ke email Anda.',
      email: email.toLowerCase(),
    });
  } catch (err) {
    console.error('[register]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────────────────────
const verifyOTPHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email dan OTP wajib diisi.' });
    }

    const isValid = verifyOTP(email, otp.trim());
    if (!isValid) {
      return res.status(400).json({ message: 'OTP tidak valid atau sudah kedaluwarsa.' });
    }

    await pool.query('UPDATE users SET is_verified = TRUE WHERE email = ?', [email.toLowerCase()]);
    return res.json({ message: 'Akun berhasil diverifikasi. Silakan login.' });
  } catch (err) {
    console.error('[verifyOTP]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// ─────────────────────────────────────────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email wajib diisi.' });

    const rateLimit = canRequestOTP(email);
    if (!rateLimit.allowed) {
      return res.status(429).json({ message: rateLimit.reason });
    }

    const [rows] = await pool.query('SELECT id, is_verified FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0) return res.status(404).json({ message: 'Email tidak ditemukan.' });
    if (rows[0].is_verified) return res.status(400).json({ message: 'Akun sudah terverifikasi.' });

    const otp = generateOTP();
    storeOTP(email, otp);
    await sendOTPEmail(email, otp);

    return res.json({ message: 'OTP baru telah dikirim ke email Anda.' });
  } catch (err) {
    console.error('[resendOTP]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    // ── Super Admin path ──────────────────────────────────────────────────
    if (email.toLowerCase() === process.env.Super_Admin_Email_?.toLowerCase()) {
      const [configRows] = await pool.query('SELECT name, password_hash FROM super_admin_config WHERE id = 1');
      if (configRows.length === 0) {
        return res.status(500).json({ message: 'Konfigurasi Super Admin tidak ditemukan.' });
      }
      const isMatch = await bcrypt.compare(password, configRows[0].password_hash);
      if (!isMatch) return res.status(401).json({ message: 'Email atau password salah.' });

      const adminName = configRows[0].name || 'Super Admin';
      const token = signToken({ id: 0, email: email.toLowerCase(), role: 'super_admin', username: adminName });
      return res.json({
        message: 'Login berhasil.',
        token,
        user: { id: 0, username: adminName, email: email.toLowerCase(), role: 'super_admin', photo: null },
      });
    }

    // ── Regular user path ─────────────────────────────────────────────────
    const [rows] = await pool.query(
      'SELECT id, username, email, password, role, photo, is_verified FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    if (rows.length === 0) return res.status(401).json({ message: 'Email tidak terdaftar, silakan register terlebih dahulu.', notRegistered: true });

    const user = rows[0];
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Akun belum diverifikasi. Cek email Anda untuk kode OTP.', needsVerification: true, email: user.email });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Email atau password salah.' });

    const token = signToken({ id: user.id, email: user.email, role: user.role, username: user.username });
    return res.json({
      message: 'Login berhasil.',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, photo: user.photo },
    });
  } catch (err) {
    console.error('[login]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email wajib diisi.' });

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    // Always respond success to prevent email enumeration
    if (rows.length === 0) return res.json({ message: 'Jika email terdaftar, link reset telah dikirim.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expires, email.toLowerCase()]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetEmail(email, resetUrl);

    return res.json({ message: 'Jika email terdaftar, link reset telah dikirim.' });
  } catch (err) {
    console.error('[forgotPassword]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token dan password baru wajib diisi.' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Password tidak cocok.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter.' });

    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    if (rows.length === 0) return res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?',
      [hash, token]
    );

    return res.json({ message: 'Password berhasil direset. Silakan login.' });
  } catch (err) {
    console.error('[resetPassword]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/change-super-admin-password  (Super Admin only)
// ─────────────────────────────────────────────────────────────────────────────
const changeSuperAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Password baru tidak cocok.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter.' });

    const [configRows] = await pool.query('SELECT password_hash FROM super_admin_config WHERE id = 1');
    const isMatch = await bcrypt.compare(currentPassword, configRows[0].password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Password saat ini salah.' });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query('UPDATE super_admin_config SET password_hash = ? WHERE id = 1', [newHash]);

    return res.json({ message: 'Password Super Admin berhasil diubah.' });
  } catch (err) {
    console.error('[changeSuperAdminPassword]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { register, verifyOTPHandler, resendOTP, login, forgotPassword, resetPassword, changeSuperAdminPassword };
