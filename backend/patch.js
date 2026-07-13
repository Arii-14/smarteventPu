const pool = require('./src/config/db');

async function patch() {
    const conn = await pool.getConnection();
    try {
        await conn.query('ALTER TABLE super_admin_config ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT "Super Admin"');
        console.log('Added name to super_admin_config');
    } catch (e) {
        console.error(e);
    }
    
    try {
        await conn.query('ALTER TABLE about_developers CHANGE COLUMN facebook_url whatsapp_number VARCHAR(100)');
        console.log('Changed facebook_url to whatsapp_number in about_developers');
    } catch (e) {
        console.error(e);
    }
    
    try {
        await conn.query('ALTER TABLE about_developers ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(100)');
    } catch (e) {
        console.error(e);
    }
    
    conn.release();
    process.exit(0);
}

patch();
