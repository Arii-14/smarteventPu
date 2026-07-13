const pool = require('../config/db');

const addFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    await pool.query('INSERT IGNORE INTO favorites (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
    return res.status(201).json({ message: 'Acara ditambahkan ke favorit.' });
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND event_id = ?', [userId, eventId]);
    return res.json({ message: 'Acara dihapus dari favorit.' });
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT e.*, c.name as category_name, c.slug as category_slug, o.name as organizer_name
      FROM favorites f
      JOIN events e ON f.event_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizers o ON e.organizer_id = o.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites };
