const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

/** Generate URL-friendly slug from title */
const makeSlug = (title) => {
  return title.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 200);
};

/** Ensure slug is unique */
const uniqueSlug = async (slug, excludeId = null) => {
  let candidate = slug;
  let i = 1;
  while (true) {
    const query = excludeId
      ? 'SELECT id FROM events WHERE slug = ? AND id != ?'
      : 'SELECT id FROM events WHERE slug = ?';
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const [rows] = await pool.query(query, params);
    if (rows.length === 0) return candidate;
    candidate = `${slug}-${i++}`;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events
// ─────────────────────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { search, category, status, visibility, limit, page } = req.query;
    const role = req.user?.role;

    const conditions = [];
    const values = [];

    // Visibility: non-authenticated can only see public events
    if (!role) {
      conditions.push("e.visibility = 'public'");
    }
    // Non-admin can only see published events
    if (!role || role === 'user') {
      conditions.push("e.status = 'published'");
    }
    if (status && (role === 'admin' || role === 'super_admin')) {
      conditions.push('e.status = ?'); values.push(status);
    }
    if (visibility && (role === 'admin' || role === 'super_admin')) {
      conditions.push('e.visibility = ?'); values.push(visibility);
    }
    if (search) {
      conditions.push('(e.title LIKE ? OR e.location LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('c.slug = ?'); values.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const offset = (pageNum - 1) * limitNum;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM events e LEFT JOIN categories c ON e.category_id = c.id ${where}`,
      values
    );

    const [rows] = await pool.query(
      `SELECT e.*, c.name as category_name, c.slug as category_slug,
              o.name as organizer_name, o.logo as organizer_logo,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered') as participants
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN organizers o ON e.organizer_id = o.id
       ${where}
       ORDER BY e.start_date ASC
       LIMIT ? OFFSET ?`,
      [...values, limitNum, offset]
    );

    return res.json({ data: rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('[events getAll]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/:id
// ─────────────────────────────────────────────────────────────────────────────
const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user?.role;

    const [rows] = await pool.query(
      `SELECT e.*, c.name as category_name, c.slug as category_slug,
              o.name as organizer_name, o.logo as organizer_logo, o.email as organizer_email, o.phone as organizer_phone,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered') as participants
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN organizers o ON e.organizer_id = o.id
       WHERE e.id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Acara tidak ditemukan.' });
    const event = rows[0];

    // Access control: private events only for internal users (admin/user in db)
    if (event.visibility === 'private' && (!role || role === 'user')) {
      // For 'user' role from DB it's fine; block only unauthenticated
      if (!req.user) return res.status(403).json({ message: 'Acara ini hanya untuk pengguna internal.' });
    }

    // Speakers
    const [speakers] = await pool.query(
      `SELECT s.* FROM speakers s
       JOIN event_speakers es ON es.speaker_id = s.id
       WHERE es.event_id = ?`,
      [id]
    );

    // Gallery
    const [gallery] = await pool.query('SELECT * FROM galleries WHERE event_id = ?', [id]);

    return res.json({ ...event, speakers, gallery });
  } catch (err) {
    console.error('[events getOne]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events
// ─────────────────────────────────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { title, description, category_id, organizer_id, location, maps_link,
            start_date, end_date, registration_deadline, max_quota, visibility, status, speaker_ids } = req.body;

    if (!title) return res.status(400).json({ message: 'Judul acara wajib diisi.' });

    const slug = await uniqueSlug(makeSlug(title));
    const banner = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO events (title, slug, banner, description, category_id, organizer_id, location, maps_link,
        start_date, end_date, registration_deadline, max_quota, visibility, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), slug, banner, description || null,
       category_id || null, organizer_id || null, location || null, maps_link || null,
       start_date || null, end_date || null, registration_deadline || null,
       max_quota || 0, visibility || 'public', status || 'draft']
    );

    const eventId = result.insertId;

    // Attach speakers
    if (speaker_ids) {
      const ids = Array.isArray(speaker_ids) ? speaker_ids : JSON.parse(speaker_ids);
      for (const sid of ids) {
        await pool.query('INSERT IGNORE INTO event_speakers (event_id, speaker_id) VALUES (?, ?)', [eventId, sid]);
      }
    }

    return res.status(201).json({ id: eventId, slug, message: 'Acara berhasil dibuat.' });
  } catch (err) {
    console.error('[events create]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/:id
// ─────────────────────────────────────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, organizer_id, location, maps_link,
            start_date, end_date, registration_deadline, max_quota, visibility, status, speaker_ids } = req.body;

    let banner;
    if (req.file) {
      const [rows] = await pool.query('SELECT banner FROM events WHERE id = ?', [id]);
      if (rows[0]?.banner) {
        const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].banner));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      banner = `/uploads/${req.file.filename}`;
    }

    const fields = [];
    const values = [];
    if (title)       { fields.push('title = ?'); values.push(title.trim());
                       const slug = await uniqueSlug(makeSlug(title), id);
                       fields.push('slug = ?'); values.push(slug); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id || null); }
    if (organizer_id !== undefined){ fields.push('organizer_id = ?');values.push(organizer_id || null); }
    if (location !== undefined)    { fields.push('location = ?');    values.push(location); }
    if (maps_link !== undefined)   { fields.push('maps_link = ?');   values.push(maps_link); }
    if (start_date)                { fields.push('start_date = ?');  values.push(start_date); }
    if (end_date)                  { fields.push('end_date = ?');    values.push(end_date); }
    if (registration_deadline)     { fields.push('registration_deadline = ?'); values.push(registration_deadline); }
    if (max_quota !== undefined)   { fields.push('max_quota = ?');   values.push(max_quota); }
    if (visibility)                { fields.push('visibility = ?');  values.push(visibility); }
    if (status)                    { fields.push('status = ?');      values.push(status); }
    if (banner)                    { fields.push('banner = ?');      values.push(banner); }

    if (fields.length) {
      values.push(id);
      await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    // Update speakers
    if (speaker_ids !== undefined) {
      await pool.query('DELETE FROM event_speakers WHERE event_id = ?', [id]);
      const ids = Array.isArray(speaker_ids) ? speaker_ids : JSON.parse(speaker_ids);
      for (const sid of ids) {
        await pool.query('INSERT IGNORE INTO event_speakers (event_id, speaker_id) VALUES (?, ?)', [id, sid]);
      }
    }

    return res.json({ message: 'Acara berhasil diperbarui.' });
  } catch (err) {
    console.error('[events update]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/events/:id
// ─────────────────────────────────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT banner FROM events WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Acara tidak ditemukan.' });
    if (rows[0].banner) {
      const p = path.join(UPLOAD_DIR, path.basename(rows[0].banner));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    // Gallery images
    const [gallery] = await pool.query('SELECT image_path FROM galleries WHERE event_id = ?', [req.params.id]);
    for (const g of gallery) {
      const p = path.join(UPLOAD_DIR, path.basename(g.image_path));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Acara berhasil dihapus.' });
  } catch (err) {
    console.error('[events remove]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/:id/participants
// ─────────────────────────────────────────────────────────────────────────────
const getParticipants = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id as user_id, u.username, u.email, u.photo, u.avatar,
              u.university, u.kampus, u.nim, u.prodi, u.role,
              r.id as registration_id, r.status, r.registered_at,
              r.attendance_status, r.qr_token,
              r.guest_name, r.guest_nim, r.guest_email
       FROM registrations r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.event_id = ?
       ORDER BY r.registered_at DESC`,
      [req.params.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/:id/start  — Super Admin / Admin mulai acara lebih awal
// ─────────────────────────────────────────────────────────────────────────────
const startEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, title, is_started FROM events WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Acara tidak ditemukan.' });
    if (rows[0].is_started) return res.status(400).json({ message: 'Acara sudah dimulai sebelumnya.' });

    await pool.query('UPDATE events SET is_started = TRUE WHERE id = ?', [id]);
    return res.json({ message: `Acara "${rows[0].title}" berhasil dimulai.` });
  } catch (err) {
    console.error('[startEvent]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/:id/finish  — Akhiri acara
// ─────────────────────────────────────────────────────────────────────────────
const finishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE events SET end_date = NOW() WHERE id = ?', [id]);
    return res.json({ message: 'Acara berhasil diselesaikan.' });
  } catch (err) {
    console.error('[finishEvent]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/:id/clear  — Clear acara
// ─────────────────────────────────────────────────────────────────────────────
const clearEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE events SET end_date = NOW(), is_started = FALSE WHERE id = ?', [id]);
    return res.json({ message: 'Acara berhasil di-clear.' });
  } catch (err) {
    console.error('[clearEvent]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/:id/attendance/:registrationId  — Manual mark H / A
// ─────────────────────────────────────────────────────────────────────────────
const updateAttendance = async (req, res) => {
  try {
    const { id, registrationId } = req.params;
    const { attendance_status } = req.body; // 'Hadir' | 'Alpha' | null

    if (attendance_status && !['Hadir', 'Alpha'].includes(attendance_status)) {
      return res.status(400).json({ message: 'Status kehadiran tidak valid. Gunakan "Hadir" atau "Alpha".' });
    }

    const [rows] = await pool.query(
      'SELECT r.id FROM registrations r WHERE r.id = ? AND r.event_id = ?',
      [registrationId, id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan.' });

    await pool.query(
      'UPDATE registrations SET attendance_status = ? WHERE id = ?',
      [attendance_status || null, registrationId]
    );

    const label = attendance_status === 'Hadir' ? 'Hadir' : attendance_status === 'Alpha' ? 'Alpha' : 'Direset';
    return res.json({ message: `Status kehadiran berhasil diubah menjadi: ${label}.`, attendance_status });
  } catch (err) {
    console.error('[updateAttendance]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events/:id/scan  — Super Admin scan QR, otomatis Hadir
// ─────────────────────────────────────────────────────────────────────────────
const scanQRAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { qr_token } = req.body;

    if (!qr_token) return res.status(400).json({ message: 'QR token tidak ditemukan.' });

    // Cek token ada di event ini
    const [rows] = await pool.query(
      `SELECT r.id, r.status, r.attendance_status,
              u.username, u.email, u.photo, u.avatar, u.nim, u.prodi,
              r.guest_name, r.guest_nim
       FROM registrations r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.qr_token = ? AND r.event_id = ?`,
      [qr_token, id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'QR Code tidak valid atau bukan bagian dari acara ini.' });
    }

    const reg = rows[0];

    if (reg.status === 'cancelled') {
      return res.status(400).json({ message: 'Pendaftaran peserta ini sudah dibatalkan.' });
    }

    if (reg.attendance_status === 'Hadir') {
      return res.status(409).json({
        message: 'Peserta ini sudah tercatat hadir.',
        already_present: true,
        participant: {
          name: reg.username || reg.guest_name,
          nim: reg.nim || reg.guest_nim
        }
      });
    }

    await pool.query(
      'UPDATE registrations SET attendance_status = "Hadir" WHERE id = ?',
      [reg.id]
    );

    return res.json({
      message: 'Kehadiran berhasil dicatat!',
      participant: {
        name: reg.username || reg.guest_name,
        nim: reg.nim || reg.guest_nim,
        email: reg.email,
        photo: reg.photo || reg.avatar
      }
    });
  } catch (err) {
    console.error('[scanQRAttendance]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getAll, getOne, create, update, remove, getParticipants, startEvent, updateAttendance,
  scanQRAttendance,
  finishEvent,
  clearEvent
};
