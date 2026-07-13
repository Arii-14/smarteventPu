const pool = require('../config/db');

const getStats = async (req, res) => {
  try {
    const [[{ totalEvents }]] = await pool.query('SELECT COUNT(*) as totalEvents FROM events');
    const [[{ upcomingEvents }]] = await pool.query('SELECT COUNT(*) as upcomingEvents FROM events WHERE start_date > NOW()');
    const [[{ completedEvents }]] = await pool.query('SELECT COUNT(*) as completedEvents FROM events WHERE end_date < NOW()');
    const [[{ activeUsers }]] = await pool.query('SELECT COUNT(*) as activeUsers FROM users WHERE is_verified = TRUE');
    const [[{ ongoingEvents }]] = await pool.query(
      'SELECT COUNT(*) as ongoingEvents FROM events WHERE start_date <= NOW() AND end_date >= NOW() AND status = \'published\''
    );

    return res.json({
      totalEvents,
      upcomingEvents,
      completedEvents,
      activeUsers,
      ongoingEvents
    });
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const getRecentRegistrations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.registered_at, r.status, r.user_id, r.event_id,
             u.username as user, e.title as target, 'Pendaftaran' as action
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 50
    `);
    
    return res.json(rows.map(r => ({
      id: r.id,
      action: 'Pengguna Mendaftar',
      target: r.target,
      user: r.user,
      user_id: r.user_id,
      event_id: r.event_id,
      status: r.status,
      time: r.registered_at // Frontend will format with Asia/Jakarta timezone
    })));
  } catch (err) {
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getStats, getRecentRegistrations };
