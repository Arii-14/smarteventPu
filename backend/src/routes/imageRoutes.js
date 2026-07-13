const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * GET /api/images/:table/:id
 * Serve gambar yang tersimpan sebagai BLOB di database.
 * 
 * :table bisa berupa: events, users, speakers, organizers, galleries, about_developers
 * :id   = ID record di tabel tersebut
 */

// Map table name ke kolom data & type yang benar
const TABLE_CONFIG = {
  events:            { dataCol: 'banner_data',  typeCol: 'banner_type'  },
  users:             { dataCol: 'photo_data',   typeCol: 'photo_type'   },
  speakers:          { dataCol: 'photo_data',   typeCol: 'photo_type'   },
  organizers:        { dataCol: 'logo_data',    typeCol: 'logo_type'    },
  galleries:         { dataCol: 'image_data',   typeCol: 'image_type'   },
  about_developers:  { dataCol: 'photo_data',   typeCol: 'photo_type'   },
};

router.get('/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;

    const config = TABLE_CONFIG[table];
    if (!config) {
      return res.status(400).json({ message: `Tabel "${table}" tidak dikenali.` });
    }

    const { dataCol, typeCol } = config;

    const [rows] = await pool.query(
      `SELECT ${dataCol}, ${typeCol} FROM ${table} WHERE id = ?`,
      [id]
    );

    if (!rows.length || !rows[0][dataCol]) {
      return res.status(404).json({ message: 'Gambar tidak ditemukan.' });
    }

    const imageData = rows[0][dataCol];
    const imageType = rows[0][typeCol] || 'image/jpeg';

    // Cache selama 1 hari
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', imageType);
    res.setHeader('Content-Length', imageData.length);
    return res.send(imageData);
  } catch (err) {
    console.error('[imageRoutes]', err.message);
    return res.status(500).json({ message: 'Gagal mengambil gambar.' });
  }
});

module.exports = router;
