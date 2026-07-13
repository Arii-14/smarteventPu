require('dotenv').config({ path: '../.env' });
const pool = require('./src/config/db');
pool.query("INSERT INTO events (title, slug, banner, description, category_id, organizer_id, location, maps_link, start_date, end_date, registration_deadline, max_quota, visibility, status) VALUES ('test2', 'test-2', null, 'test desc', null, null, 'loc', null, '2026-07-11T12:00', null, null, 0, 'public', 'draft')")
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0));
