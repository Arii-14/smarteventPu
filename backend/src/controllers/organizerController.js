const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM organizers ORDER BY name ASC');
    return res.json(rows);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM organizers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Penyelenggara tidak ditemukan.' });
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const create = async (req, res) => {
  try {
    const { name, description, email, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi.' });
    const logo = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO organizers (name, logo, description, email, phone) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), logo, description || null, email || null, phone || null]
    );
    return res.status(201).json({ id: result.insertId, name, logo });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const update = async (req, res) => {
  try {
    const { name, description, email, phone } = req.body;
    const { id } = req.params;

    let logo;
    if (req.file) {
      // Delete old logo
      const [rows] = await pool.query('SELECT logo FROM organizers WHERE id = ?', [id]);
      if (rows[0]?.logo) {
        const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].logo));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      logo = `/uploads/${req.file.filename}`;
    }

    const fields = [];
    const values = [];
    if (name)        { fields.push('name = ?');        values.push(name.trim()); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (email !== undefined)       { fields.push('email = ?');       values.push(email); }
    if (phone !== undefined)       { fields.push('phone = ?');       values.push(phone); }
    if (logo)        { fields.push('logo = ?');        values.push(logo); }

    if (!fields.length) return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    values.push(id);
    await pool.query(`UPDATE organizers SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ message: 'Penyelenggara berhasil diperbarui.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT logo FROM organizers WHERE id = ?', [req.params.id]);
    if (rows[0]?.logo) {
      const oldPath = path.join(UPLOAD_DIR, path.basename(rows[0].logo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await pool.query('DELETE FROM organizers WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Penyelenggara berhasil dihapus.' });
  } catch (err) { return res.status(500).json({ message: 'Terjadi kesalahan server.' }); }
};

module.exports = { getAll, getOne, create, update, remove };
