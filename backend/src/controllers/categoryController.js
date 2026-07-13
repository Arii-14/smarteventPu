const pool = require('../config/db');

// GET /api/categories
const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/categories
const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const [result] = await pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name.trim(), slug]);
    return res.status(201).json({ id: result.insertId, name, slug });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Kategori sudah ada.' });
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// PUT /api/categories/:id
const update = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi.' });
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await pool.query('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name.trim(), slug, req.params.id]);
    return res.json({ message: 'Kategori berhasil diperbarui.' });
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// DELETE /api/categories/:id
const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getAll, create, update, remove };
