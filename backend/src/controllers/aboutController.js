const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    // Exclude BLOB
    const [rows] = await pool.query('SELECT id, name, role_title, description, photo, github_url, instagram_url, facebook_url, whatsapp_number, display_order, created_at FROM about_developers ORDER BY display_order ASC, id ASC');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const create = async (req, res) => {
  try {
    const { name, role_title, description, github_url, instagram_url, facebook_url, display_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi.' });
    
    const photoData = req.file ? req.file.buffer : null;
    const photoType = req.file ? req.file.mimetype : null;
    
    const [result] = await pool.query(
      `INSERT INTO about_developers (name, role_title, description, photo_data, photo_type, github_url, instagram_url, facebook_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), role_title || null, description || null, photoData, photoType, github_url || null, instagram_url || null, facebook_url || null, display_order || 0]
    );

    const newId = result.insertId;
    const photoUrl = photoData ? `/api/images/about_developers/${newId}` : null;
    
    if (photoUrl) {
      await pool.query('UPDATE about_developers SET photo = ? WHERE id = ?', [photoUrl, newId]);
    }

    return res.status(201).json({ id: newId, name, photo: photoUrl });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role_title, description, github_url, instagram_url, facebook_url, display_order } = req.body;
    
    const fields = [];
    const values = [];
    
    if (req.file) {
      fields.push('photo_data = ?'); values.push(req.file.buffer);
      fields.push('photo_type = ?'); values.push(req.file.mimetype);
      fields.push('photo = ?');      values.push(`/api/images/about_developers/${id}`);
    }

    if (name)                  { fields.push('name = ?');          values.push(name.trim()); }
    if (role_title !== undefined){ fields.push('role_title = ?');  values.push(role_title); }
    if (description !== undefined){ fields.push('description = ?'); values.push(description); }
    if (github_url !== undefined){ fields.push('github_url = ?');  values.push(github_url); }
    if (instagram_url !== undefined){ fields.push('instagram_url = ?'); values.push(instagram_url); }
    if (facebook_url !== undefined){ fields.push('facebook_url = ?'); values.push(facebook_url); }
    if (display_order !== undefined){ fields.push('display_order = ?'); values.push(display_order); }

    if (!fields.length) return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    values.push(id);
    await pool.query(`UPDATE about_developers SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ message: 'Data pengembang berhasil diperbarui.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM about_developers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Pengembang tidak ditemukan.' });

    await pool.query('DELETE FROM about_developers WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Pengembang berhasil dihapus.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

module.exports = { getAll, create, update, remove };
