const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM speakers ORDER BY name ASC');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const create = async (req, res) => {
  try {
    const { name, position, institution, biography } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi.' });
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO speakers (name, photo, position, institution, biography) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), photo, position || null, institution || null, biography || null]
    );
    return res.status(201).json({ id: result.insertId, name, photo });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const update = async (req, res) => {
  try {
    const { name, position, institution, biography } = req.body;
    const { id } = req.params;
    let photo;
    if (req.file) {
      const [rows] = await pool.query('SELECT photo FROM speakers WHERE id = ?', [id]);
      if (rows[0]?.photo) {
        const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].photo));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      photo = `/uploads/${req.file.filename}`;
    }
    const fields = [];
    const values = [];
    if (name)        { fields.push('name = ?');        values.push(name.trim()); }
    if (position !== undefined)    { fields.push('position = ?');    values.push(position); }
    if (institution !== undefined) { fields.push('institution = ?'); values.push(institution); }
    if (biography !== undefined)   { fields.push('biography = ?');   values.push(biography); }
    if (photo)       { fields.push('photo = ?');       values.push(photo); }
    if (!fields.length) return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    values.push(id);
    await pool.query(`UPDATE speakers SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ message: 'Pembicara berhasil diperbarui.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT photo FROM speakers WHERE id = ?', [req.params.id]);
    if (rows[0]?.photo) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].photo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await pool.query('DELETE FROM speakers WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Pembicara berhasil dihapus.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

module.exports = { getAll, create, update, remove };
