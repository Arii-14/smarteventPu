const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });
const pool = require('./src/config/db');

async function test() {
  try {
    const title = 'Test Event 500 Error';
    const slug = 'test-event-500-error';
    const banner = null;
    const description = null;
    const category_id = null;
    const organizer_id = null;
    const location = null;
    const maps_link = null;
    const start_date = null;
    const end_date = null;
    const registration_deadline = null;
    const max_quota = 0;
    const visibility = 'public';
    const status = 'draft';

    const [result] = await pool.query(
      `INSERT INTO events (title, slug, banner, description, category_id, organizer_id, location, maps_link,
        start_date, end_date, registration_deadline, max_quota, visibility, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, banner, description,
       category_id, organizer_id, location, maps_link,
       start_date, end_date, registration_deadline,
       max_quota, visibility, status]
    );
    console.log('Success:', result);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}
test();
