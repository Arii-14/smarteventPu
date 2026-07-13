require('dotenv').config({ path: '../.env' });
const pool = require('./src/config/db');

async function migrate() {
  const conn = await pool.getConnection();
  try {
    // Add attendance_status to registrations
    try {
      await conn.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS attendance_status ENUM('Hadir', 'Alpha') DEFAULT NULL`);
      console.log('[OK] Added attendance_status to registrations');
    } catch (e) {
      console.log('[SKIP] attendance_status:', e.message);
    }

    // Make sure qr_token exists in registrations (for registered users, not just guests)
    try {
      await conn.query(`ALTER TABLE registrations MODIFY COLUMN qr_token VARCHAR(100) NULL`);
      console.log('[OK] qr_token column ensured in registrations');
    } catch (e) {
      console.log('[SKIP] qr_token modify:', e.message);
    }

    // Add is_started to events
    try {
      await conn.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_started BOOLEAN DEFAULT FALSE`);
      console.log('[OK] Added is_started to events');
    } catch (e) {
      console.log('[SKIP] is_started:', e.message);
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
