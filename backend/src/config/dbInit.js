const pool = require('./db');
const bcrypt = require('bcrypt');

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    // ── users ─────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','user') DEFAULT 'user',
        photo VARCHAR(255),
        university VARCHAR(200),
        semester INT,
        student_id VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE,
        reset_token VARCHAR(255),
        reset_token_expires DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── super_admin_config ─────────────────────────────────────────────
    // Stores the hashed password for the Super Admin (never a users row)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS super_admin_config (
        id INT PRIMARY KEY DEFAULT 1,
        name VARCHAR(255) DEFAULT 'Super Admin',
        password_hash VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed default Super Admin password hash if not yet set
    const [rows] = await conn.query('SELECT id FROM super_admin_config WHERE id = 1');
    if (rows.length === 0) {
      const defaultPw = process.env.password_default_super_admin || 'Admin123';
      const hash = await bcrypt.hash(defaultPw, 12);
      await conn.query('INSERT INTO super_admin_config (id, password_hash) VALUES (1, ?)', [hash]);
      console.log('[DB] Super Admin default password seeded (hashed).');
    }

    // ── categories ────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed categories
    const [catRows] = await conn.query('SELECT id FROM categories LIMIT 1');
    if (catRows.length === 0) {
      await conn.query(`
        INSERT INTO categories (name, slug) VALUES 
        ('Seminar', 'seminar'),
        ('Lokakarya', 'lokakarya'),
        ('Kompetisi', 'kompetisi'),
        ('Pelatihan', 'pelatihan'),
        ('Webinar', 'webinar')
      `);
      console.log('[DB] Default categories seeded.');
    }


    // ── organizers ────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS organizers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        logo VARCHAR(255),
        description TEXT,
        email VARCHAR(150),
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── events ────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        banner VARCHAR(255),
        description TEXT,
        category_id INT,
        organizer_id INT,
        location VARCHAR(255),
        maps_link VARCHAR(500),
        start_date DATETIME,
        end_date DATETIME,
        registration_deadline DATETIME,
        max_quota INT DEFAULT 0,
        visibility ENUM('public','private') DEFAULT 'public',
        status ENUM('draft','published','archived') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (organizer_id) REFERENCES organizers(id) ON DELETE SET NULL
      )
    `);

    // ── speakers ──────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS speakers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        photo VARCHAR(255),
        position VARCHAR(200),
        institution VARCHAR(200),
        biography TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── event_speakers (pivot) ────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS event_speakers (
        event_id INT NOT NULL,
        speaker_id INT NOT NULL,
        PRIMARY KEY (event_id, speaker_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE CASCADE
      )
    `);

    // ── registrations ─────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        status ENUM('registered','cancelled','attended') DEFAULT 'registered',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_registration (user_id, event_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    // ── tickets ───────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        registration_id INT UNIQUE NOT NULL,
        qr_code TEXT NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
      )
    `);

    // ── galleries ─────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS galleries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    // ── favorites ─────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, event_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    // ── about_developers ──────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS about_developers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        role_title VARCHAR(200),
        description TEXT,
        photo VARCHAR(255),
        github_url VARCHAR(500),
        instagram_url VARCHAR(500),
        whatsapp_number VARCHAR(100),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('[DB] All tables initialized successfully.');
  } catch (err) {
    console.error('[DB] Initialization error:', err.message);
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = initDB;
