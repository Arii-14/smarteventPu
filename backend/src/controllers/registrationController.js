const pool = require('../config/db');
const crypto = require('crypto');
const { sendGuestTicketEmail, sendUserTicketEmail } = require('../utils/mailer');

// ─── POST /api/registrations/:eventId ────────────────────────────────────────
// Mendaftar acara (user yang sudah punya akun)
const registerEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    if (req.user.role === 'super_admin') {
      return res.status(403).json({ message: 'Super Admin tidak perlu mendaftar acara.' });
    }

    // Check if event exists and is not archived
    const [events] = await pool.query(
      'SELECT id, title, status, max_quota, visibility, start_date, end_date, location FROM events WHERE id = ?',
      [eventId]
    );
    if (!events.length) return res.status(404).json({ message: 'Acara tidak ditemukan.' });

    const event = events[0];
    if (event.status === 'archived') return res.status(400).json({ message: 'Acara sudah diarsipkan.' });

    // Check quota
    if (event.max_quota > 0) {
      const [count] = await pool.query(
        'SELECT COUNT(*) as current FROM registrations WHERE event_id = ? AND status = "registered"',
        [eventId]
      );
      if (count[0].current >= event.max_quota) {
        return res.status(400).json({ message: 'Kuota acara sudah penuh.' });
      }
    }

    // Generate qr_token untuk user
    const qrToken = crypto.randomBytes(16).toString('hex');

    // Insert registration dengan qr_token
    const [result] = await pool.query(
      'INSERT INTO registrations (user_id, event_id, qr_token) VALUES (?, ?, ?)',
      [userId, eventId, qrToken]
    );

    // Juga simpan ke tabel tickets (backward compat)
    const legacyQrCode = `SEC-TKT-${result.insertId}-${Date.now()}`;
    await pool.query('INSERT INTO tickets (registration_id, qr_code) VALUES (?, ?)', [result.insertId, legacyQrCode]);

    // Ambil data profile user untuk email
    const [users] = await pool.query(
      'SELECT username, email, nim, prodi, university, kampus FROM users WHERE id = ?',
      [userId]
    );

    if (users.length && users[0].email) {
      const userProfile = users[0];
      // Kirim email tiket di background
      sendUserTicketEmail(userProfile.email, userProfile, event, qrToken).catch(err => {
        console.error('[Email Tiket User Error]:', err.message);
      });
    }

    return res.status(201).json({
      message: 'Berhasil mendaftar acara. Email konfirmasi dan tiket QR telah dikirim.',
      registrationId: result.insertId,
      qr_token: qrToken
    });
  } catch (err) {
    console.error('[registerEvent Error]:', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Anda sudah mendaftar acara ini.' });
    return res.status(500).json({ message: 'Terjadi kesalahan server: ' + err.message });
  }
};

// ─── POST /api/registrations/guest/:eventId ───────────────────────────────────
const registerGuest = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { guest_name, guest_nim, guest_email } = req.body;

    if (!guest_name || !guest_nim) {
      return res.status(400).json({ message: 'Nama dan NIM wajib diisi.' });
    }

    const [events] = await pool.query('SELECT title, status, max_quota, visibility FROM events WHERE id = ?', [eventId]);
    if (!events.length) return res.status(404).json({ message: 'Acara tidak ditemukan.' });

    const event = events[0];
    if (event.status === 'archived') return res.status(400).json({ message: 'Acara sudah diarsipkan.' });
    if (event.visibility === 'private') return res.status(403).json({ message: 'Acara ini khusus untuk pengguna terdaftar.' });

    // Check quota
    if (event.max_quota > 0) {
      const [count] = await pool.query(
        'SELECT COUNT(*) as current FROM registrations WHERE event_id = ? AND status = "registered"',
        [eventId]
      );
      if (count[0].current >= event.max_quota) return res.status(400).json({ message: 'Kuota acara sudah penuh.' });
    }

    const qrToken = crypto.randomBytes(16).toString('hex');

    const [result] = await pool.query(
      'INSERT INTO registrations (event_id, guest_name, guest_nim, guest_email, qr_token) VALUES (?, ?, ?, ?, ?)',
      [eventId, guest_name, guest_nim, guest_email || null, qrToken]
    );

    if (guest_email) {
      sendGuestTicketEmail(guest_email, guest_name, event.title, qrToken).catch(err => {
        console.error('Failed to send guest email', err);
      });
    }

    return res.status(201).json({ message: 'Berhasil mendaftar sebagai tamu.', qr_token: qrToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── DELETE /api/registrations/:eventId ──────────────────────────────────────
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT r.id, e.start_date FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.user_id = ? AND r.event_id = ? AND r.status = "registered"',
      [userId, eventId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan atau sudah dibatalkan.' });

    const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const eventStart = new Date(rows[0].start_date);

    if (nowWIB >= eventStart) {
      return res.status(400).json({
        message: 'Pendaftaran tidak dapat dibatalkan. Acara sudah dimulai atau sudah berlangsung.'
      });
    }

    await pool.query('UPDATE registrations SET status = "cancelled" WHERE id = ?', [rows[0].id]);
    return res.json({ message: 'Pendaftaran berhasil dibatalkan.' });
  } catch (err) {
    console.error('[cancelRegistration]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── DELETE /api/registrations/admin/:registrationId ─────────────────────────
const adminCancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const [rows] = await pool.query(
      `SELECT r.id, r.status, r.user_id, u.username, e.title as event_title
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [registrationId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan.' });
    if (rows[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Pendaftaran sudah dibatalkan sebelumnya.' });
    }

    await pool.query('UPDATE registrations SET status = "cancelled" WHERE id = ?', [registrationId]);
    return res.json({
      message: `Pendaftaran ${rows[0].username || 'tamu'} untuk acara "${rows[0].event_title}" berhasil dibatalkan oleh admin.`
    });
  } catch (err) {
    console.error('[adminCancelRegistration]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── GET /api/registrations/history ──────────────────────────────────────────
const getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT r.id, r.status, r.registered_at, r.attendance_status, r.qr_token,
             e.id as event_id, e.title, e.banner, e.start_date, e.end_date, e.location,
             c.name as category_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.registered_at DESC
    `, [userId]);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── GET /api/registrations/:id/ticket ───────────────────────────────────────
const getTicket = async (req, res) => {
  try {
    const regId = req.params.id;
    const userId = req.user.id;

    const [rows] = await pool.query(`
      SELECT t.qr_code, r.qr_token, e.title, e.start_date, e.location, u.username
      FROM tickets t
      JOIN registrations r ON t.registration_id = r.id
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ? AND r.user_id = ? AND r.status = "registered"
    `, [regId, userId]);

    if (!rows.length) return res.status(404).json({ message: 'Tiket tidak ditemukan atau pendaftaran tidak valid.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─── GET /api/registrations/scan/:token ──────────────────────────────────────
// Resolve QR Token → data peserta (user atau tamu)
const scanGuestTicket = async (req, res) => {
  try {
    const { token } = req.params;
    const [rows] = await pool.query(`
      SELECT r.id, r.status, r.attendance_status, r.guest_name, r.guest_nim, r.guest_email,
             e.id as event_id, e.title, e.start_date, e.end_date, e.location, e.is_started,
             u.id as user_id, u.username, u.email as user_email, u.nim, u.prodi,
             u.university, u.kampus, u.photo, u.avatar, u.role
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.qr_token = ?
    `, [token]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Tiket tidak ditemukan atau tidak valid.' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  registerEvent,
  registerGuest,
  cancelRegistration,
  adminCancelRegistration,
  getMyHistory,
  getTicket,
  scanGuestTicket
};
