const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    // Exclude BLOB
    const [rows] = await pool.query('SELECT id, name, logo, description, email, phone, created_at FROM organizers ORDER BY name ASC');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, logo, description, email, phone, created_at FROM organizers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Penyelenggara tidak ditemukan.' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const create = async (req, res) => {
  try {
    const { name, description, email, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi.' });
    
    const logoData = req.file ? req.file.buffer : null;
    const logoType = req.file ? req.file.mimetype : null;

    const [result] = await pool.query(
      'INSERT INTO organizers (name, logo_data, logo_type, description, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), logoData, logoType, description || null, email || null, phone || null]
    );

    const newId = result.insertId;
    const logoUrl = logoData ? `/api/images/organizers/${newId}` : null;
    
    if (logoUrl) {
      await pool.query('UPDATE organizers SET logo = ? WHERE id = ?', [logoUrl, newId]);
    }

    return res.status(201).json({ id: newId, name, logo: logoUrl });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const update = async (req, res) => {
  try {
    const { name, description, email, phone } = req.body;
    const { id } = req.params;

    const fields = [];
    const values = [];

    if (req.file) {
      fields.push('logo_data = ?'); values.push(req.file.buffer);
      fields.push('logo_type = ?'); values.push(req.file.mimetype);
      fields.push('logo = ?');      values.push(`/api/images/organizers/${id}`);
    }

    if (name)        { fields.push('name = ?');        values.push(name.trim()); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (email !== undefined)       { fields.push('email = ?');       values.push(email); }
    if (phone !== undefined)       { fields.push('phone = ?');       values.push(phone); }

    if (!fields.length) return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    values.push(id);
    await pool.query(`UPDATE organizers SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ message: 'Penyelenggara berhasil diperbarui.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM organizers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Penyelenggara tidak ditemukan.' });

    await pool.query('DELETE FROM organizers WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Penyelenggara berhasil dihapus.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

module.exports = { getAll, getOne, create, update, remove };
