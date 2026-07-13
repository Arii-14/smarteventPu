const pool = require('./src/config/db');

async function test() {
  const [rows] = await pool.query('SELECT id, title, status, visibility FROM events');
  console.log('Events in DB:', rows);
  process.exit(0);
}

test();

