const pool = require('../config/db');

/**
 * POST /api/gallery/:eventId
 * Upload gambar gallery — disimpan sebagai BLOB di TiDB Cloud.
 */
const uploadImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.file) return res.status(400).json({ message: 'Tidak ada gambar yang diunggah.' });

    const imageData   = req.file.buffer;
    const imageType   = req.file.mimetype;
    const imagePath   = `/api/images/galleries/`; // placeholder, diupdate setelah insert

    const [result] = await pool.query(
      'INSERT INTO galleries (event_id, image_data, image_type, image_path) VALUES (?, ?, ?, ?)',
      [eventId, imageData, imageType, imagePath]
    );

    const newId = result.insertId;
    const finalPath = `/api/images/galleries/${newId}`;
    await pool.query('UPDATE galleries SET image_path = ? WHERE id = ?', [finalPath, newId]);

    return res.status(201).json({ id: newId, image_path: finalPath });
  } catch (err) {
    console.error('[gallery uploadImage]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * DELETE /api/gallery/:id
 */
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id FROM galleries WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Gambar tidak ditemukan.' });

    await pool.query('DELETE FROM galleries WHERE id = ?', [id]);
    return res.json({ message: 'Gambar berhasil dihapus.' });
  } catch (err) {
    console.error('[gallery deleteImage]', err.message);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { uploadImage, deleteImage };
