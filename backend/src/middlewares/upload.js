const multer = require('multer');
const path = require('path');

// Gunakan memoryStorage agar file disimpan di RAM (buffer),
// bukan di disk — penting untuk Vercel serverless yang tidak punya persistent disk.
// Buffer ini yang kemudian disimpan ke database sebagai BLOB.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Hanya file gambar (jpg, png, webp, gif) yang diizinkan.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
