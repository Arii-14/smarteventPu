const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    // Exclude BLOB dari select
    const [rows] = await pool.query('SELECT id, name, photo, position, institution, biography, created_at FROM speakers ORDER BY name ASC');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const create = async (req, res) => {
  try {
    const { name, position, institution, biography } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi.' });
    
    const photoData = req.file ? req.file.buffer : null;
    const photoType = req.file ? req.file.mimetype : null;

    const [result] = await pool.query(
      'INSERT INTO speakers (name, photo_data, photo_type, position, institution, biography) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), photoData, photoType, position || null, institution || null, biography || null]
    );

    const newId = result.insertId;
    const photoUrl = photoData ? `/api/images/speakers/${newId}` : null;
    
    if (photoUrl) {
      await pool.query('UPDATE speakers SET photo = ? WHERE id = ?', [photoUrl, newId]);
    }

    return res.status(201).json({ id: newId, name, photo: photoUrl });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const update = async (req, res) => {
  try {
    const { name, position, institution, biography } = req.body;
    const { id } = req.params;
    
    const fields = [];
    const values = [];
    
    if (req.file) {
      fields.push('photo_data = ?'); values.push(req.file.buffer);
      fields.push('photo_type = ?'); values.push(req.file.mimetype);
      fields.push('photo = ?');      values.push(`/api/images/speakers/${id}`);
    }

    if (name)        { fields.push('name = ?');        values.push(name.trim()); }
    if (position !== undefined)    { fields.push('position = ?');    values.push(position); }
    if (institution !== undefined) { fields.push('institution = ?'); values.push(institution); }
    if (biography !== undefined)   { fields.push('biography = ?');   values.push(biography); }

    if (!fields.length) return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    values.push(id);
    
    await pool.query(`UPDATE speakers SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ message: 'Pembicara berhasil diperbarui.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM speakers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Pembicara tidak ditemukan.' });

    await pool.query('DELETE FROM speakers WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Pembicara berhasil dihapus.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

module.exports = { getAll, create, update, remove };
