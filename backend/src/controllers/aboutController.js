const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM about_developers ORDER BY display_order ASC, id ASC');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const create = async (req, res) => {
  try {
    const { name, role_title, description, github_url, instagram_url, facebook_url, display_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi.' });
    
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      `INSERT INTO about_developers (name, role_title, description, photo, github_url, instagram_url, facebook_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), role_title || null, description || null, photo, github_url || null, instagram_url || null, facebook_url || null, display_order || 0]
    );
    return res.status(201).json({ id: result.insertId, name, photo });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role_title, description, github_url, instagram_url, facebook_url, display_order } = req.body;
    
    let photo;
    if (req.file) {
      const [rows] = await pool.query('SELECT photo FROM about_developers WHERE id = ?', [id]);
      if (rows[0]?.photo) {
        const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].photo));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      photo = `/uploads/${req.file.filename}`;
    }

    const fields = [];
    const values = [];
    
    if (name)                  { fields.push('name = ?');          values.push(name.trim()); }
    if (role_title !== undefined){ fields.push('role_title = ?');  values.push(role_title); }
    if (description !== undefined){ fields.push('description = ?'); values.push(description); }
    if (github_url !== undefined){ fields.push('github_url = ?');  values.push(github_url); }
    if (instagram_url !== undefined){ fields.push('instagram_url = ?'); values.push(instagram_url); }
    if (facebook_url !== undefined){ fields.push('facebook_url = ?'); values.push(facebook_url); }
    if (display_order !== undefined){ fields.push('display_order = ?'); values.push(display_order); }
    if (photo)                 { fields.push('photo = ?');         values.push(photo); }

    if (!fields.length) return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    values.push(id);
    await pool.query(`UPDATE about_developers SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ message: 'Data pengembang berhasil diperbarui.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT photo FROM about_developers WHERE id = ?', [req.params.id]);
    if (rows[0]?.photo) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].photo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await pool.query('DELETE FROM about_developers WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Pengembang berhasil dihapus.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

module.exports = { getAll, create, update, remove };
