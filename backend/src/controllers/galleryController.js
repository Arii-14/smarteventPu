const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

const uploadImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.file) return res.status(400).json({ message: 'Tidak ada gambar yang diunggah.' });

    const imagePath = `/uploads/${req.file.filename}`;
    const [result] = await pool.query('INSERT INTO galleries (event_id, image_path) VALUES (?, ?)', [eventId, imagePath]);
    
    return res.status(201).json({ id: result.insertId, image_path: imagePath });
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT image_path FROM galleries WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Gambar tidak ditemukan.' });

    const p = path.join(UPLOAD_DIR, path.basename(rows[0].image_path));
    if (fs.existsSync(p)) fs.unlinkSync(p);

    await pool.query('DELETE FROM galleries WHERE id = ?', [id]);
    return res.json({ message: 'Gambar berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { uploadImage, deleteImage };
