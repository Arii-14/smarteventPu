const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { sendRejectionEmail } = require('../utils/mailer');

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/me
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // Super Admin has no DB row in users, but has config in super_admin_config
    if (req.user.role === 'super_admin') {
      const [configRows] = await pool.query('SELECT name FROM super_admin_config WHERE id = 1');
      const adminName = (configRows.length > 0 && configRows[0].name) ? configRows[0].name : 'Super Admin';
      return res.json({
        id: 0,
        username: adminName,
        email: req.user.email,
        role: 'super_admin',
        photo: null,
        university: null,
        semester: null,
        student_id: null,
      });
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, role, photo, avatar, university, kampus, semester, student_id, nim, prodi, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[getMe]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/me
// ─────────────────────────────────────────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    const { username, email, university, semester, student_id, nim, prodi, kampus, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (req.user.role === 'super_admin') {
      if (newPassword) {
        return res.status(400).json({ message: 'Gunakan endpoint khusus untuk mengubah password Super Admin.' });
      }
      if (username) {
        await pool.query('UPDATE super_admin_config SET name = ? WHERE id = 1', [username.trim()]);
        return res.json({ message: 'Profil Super Admin berhasil diperbarui.', user: { id: 0, username: username.trim(), email: req.user.email, role: 'super_admin' } });
      }
      return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    }

    // Check email not taken by another user
    if (email) {
      const [dup] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase(), userId]);
      if (dup.length > 0) return res.status(409).json({ message: 'Email sudah digunakan.' });
    }

    // Password change
    let passwordHash;
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Password saat ini wajib diisi.' });
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) return res.status(401).json({ message: 'Password saat ini salah.' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const fields = [];
    const values = [];
    if (username) { fields.push('username = ?'); values.push(username.trim()); }
    if (email)    { fields.push('email = ?');    values.push(email.toLowerCase()); }
    if (university !== undefined) { fields.push('university = ?'); values.push(university); }
    if (kampus !== undefined)     { fields.push('kampus = ?');     values.push(kampus); }
    if (semester !== undefined)   { fields.push('semester = ?');   values.push(semester || null); }
    if (student_id !== undefined) { fields.push('student_id = ?'); values.push(student_id || null); }
    if (nim !== undefined)        { fields.push('nim = ?');        values.push(nim || null); }
    if (prodi !== undefined)      { fields.push('prodi = ?');      values.push(prodi || null); }
    if (passwordHash)             { fields.push('password = ?');   values.push(passwordHash); }

    if (fields.length === 0) return res.status(400).json({ message: 'Tidak ada data yang diubah.' });

    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      'SELECT id, username, email, role, photo, avatar, university, kampus, semester, student_id, nim, prodi FROM users WHERE id = ?',
      [userId]
    );
    return res.json({ message: 'Profil berhasil diperbarui.', user: updated[0] });
  } catch (err) {
    console.error('[updateMe]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/me/photo
// ─────────────────────────────────────────────────────────────────────────────
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    if (req.user.role === 'super_admin') {
      return res.status(400).json({ message: 'Super Admin tidak memiliki foto profil di database.' });
    }

    // Delete old photo if exists
    const [rows] = await pool.query('SELECT photo FROM users WHERE id = ?', [req.user.id]);
    if (rows[0]?.photo) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].photo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET photo = ?, avatar = ? WHERE id = ?', [photoUrl, photoUrl, req.user.id]);

    return res.json({ message: 'Foto profil berhasil diperbarui.', photo: photoUrl });
  } catch (err) {
    console.error('[uploadPhoto]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users  (Super Admin: list all users)
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, photo, university, kampus, nim, prodi, is_verified, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('[getAllUsers]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/admins  (Super Admin: list only users with role=admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, role, photo, kampus, university, nim, prodi, is_verified, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error('[getAdminUsers]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id/role  (Super Admin: promote/demote)
// ─────────────────────────────────────────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) return res.status(400).json({ message: 'Role tidak valid.' });

    const [rows] = await pool.query('SELECT email FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    // Prevent modifying super admin email account (shouldn't be in DB but as guard)
    if (rows[0].email.toLowerCase() === process.env.Super_Admin_Email_.toLowerCase()) {
      return res.status(403).json({ message: 'Tidak dapat mengubah role Super Admin.' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return res.json({ message: `Role pengguna berhasil diubah menjadi ${role}.` });
  } catch (err) {
    console.error('[updateUserRole]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/:id  (Super Admin only — hapus biasa tanpa email)
// ─────────────────────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT email, photo FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    if (rows[0].email.toLowerCase() === process.env.Super_Admin_Email_.toLowerCase()) {
      return res.status(403).json({ message: 'Super Admin tidak dapat dihapus.' });
    }

    if (rows[0].photo) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].photo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: 'Pengguna berhasil dihapus.' });
  } catch (err) {
    console.error('[deleteUser]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/:id/reject  (Admin & Super Admin: tolak akun user + kirim email alasan)
// ─────────────────────────────────────────────────────────────────────────────
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Alasan penolakan wajib diisi.' });
    }

    const [rows] = await pool.query('SELECT id, username, email, photo, role FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    const target = rows[0];
    // Jangan bisa reject sesama admin atau super_admin
    if (target.role === 'admin' || target.role === 'super_admin') {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Admin tidak dapat menolak sesama admin.' });
      }
    }
    if (target.email.toLowerCase() === process.env.Super_Admin_Email_?.toLowerCase()) {
      return res.status(403).json({ message: 'Super Admin tidak dapat ditolak.' });
    }

    // Hapus foto fisik jika ada
    if (target.photo) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(target.photo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Kirim email penolakan sebelum hapus
    const adminName = req.user.username || req.user.email;
    sendRejectionEmail(target.email, target.username, adminName, req.user.role, reason.trim()).catch(err => {
      console.error('[rejectUser] Gagal kirim email:', err.message);
    });

    // Hapus akun user dari database
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: `Akun ${target.username} berhasil ditolak dan email pemberitahuan telah dikirim.` });
  } catch (err) {
    console.error('[rejectUser]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/me  (user deletes own account)
// ─────────────────────────────────────────────────────────────────────────────
const deleteMe = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId || req.user.role === 'super_admin') {
      return res.status(403).json({ message: 'Super Admin tidak dapat menghapus akun melalui endpoint ini.' });
    }

    const [rows] = await pool.query('SELECT photo FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    if (rows[0].photo) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].photo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    return res.json({ message: 'Akun berhasil dihapus.' });
  } catch (err) {
    console.error('[deleteMe]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getMe, updateMe, uploadPhoto, getAllUsers, getAdminUsers, updateUserRole, deleteUser, rejectUser, deleteMe };
