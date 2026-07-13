require('dotenv').config({ path: '../.env' });
const pool = require('./src/config/db');

async function migrate() {
  try {
    const sql = `ALTER TABLE registrations 
      MODIFY user_id int NULL,
      ADD COLUMN guest_name varchar(255) NULL,
      ADD COLUMN guest_nim varchar(50) NULL,
      ADD COLUMN guest_email varchar(255) NULL,
      ADD COLUMN qr_token varchar(100) NULL`;
    await pool.query(sql);
    console.log('Altered table successfully');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

migrate();
