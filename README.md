# 🎓 SmartEvent Campus

> **Platform manajemen acara kampus berbasis web** — memungkinkan mahasiswa untuk menemukan, mendaftar, dan menghadiri acara kampus secara digital, serta memberikan kontrol penuh bagi Admin dan Super Admin dalam mengelola seluruh ekosistem acara.

---

## 📋 Daftar Isi

- [Deskripsi Proyek](#-deskripsi-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Skema Database](#-skema-database)
- [Alur Logika / Flowchart](#-alur-logika--flowchart)
- [Struktur Folder](#-struktur-folder)
- [Cara Menggunakan Proyek](#-cara-menggunakan-proyek)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [API Endpoints](#-api-endpoints)

---

## 📌 Deskripsi Proyek

**SmartEvent Campus** adalah aplikasi web full-stack yang dirancang untuk ekosistem kampus. Mahasiswa dapat melihat daftar acara (seminar, workshop, kompetisi, webinar, dll.), mendaftar secara online, dan mendapatkan **tiket digital ber-QR Code** yang dikirim via email. Admin dapat mengelola acara, memindai kehadiran peserta lewat QR Code, dan melihat statistik real-time di dashboard.

### Siapa yang menggunakan?

| Role | Kemampuan |
|------|-----------|
| **Guest (Tamu)** | Melihat acara publik, mendaftar sebagai tamu tanpa akun |
| **User (Mahasiswa)** | Daftar akun, mendaftar acara, simpan favorit, kelola profil, lihat tiket |
| **Admin** | Kelola acara, speaker, organizer, kategori, scan QR presensi, lihat peserta |
| **Super Admin** | Semua akses Admin + kelola user, kelola halaman About, ubah password Super Admin |

---

## ✨ Fitur Utama

- 🔐 **Autentikasi lengkap** — Register + verifikasi OTP via email, Login JWT, Forgot Password + Reset via token
- 📅 **Manajemen Acara** — CRUD acara dengan banner image upload, status (draft/published/archived), visibilitas (public/private), kuota
- 🎟️ **Tiket Digital QR Code** — Setiap peserta yang terdaftar mendapat tiket QR unik via email
- 📷 **Scan Presensi QR** — Admin scan QR peserta untuk menandai kehadiran (attended)
- 👤 **Profil Mahasiswa** — Upload foto profil, ubah data diri, riwayat pendaftaran
- ❤️ **Favorit Acara** — Tandai acara yang diminati
- 📊 **Dashboard Admin** — Statistik jumlah acara, peserta, pengguna aktif
- 📸 **Galeri Acara** — Upload & kelola foto galeri tiap acara
- 🌓 **Dark Mode** — Toggle tema terang/gelap, tersimpan di localStorage
- 📧 **Email Notifications** — OTP, tiket, password reset via Nodemailer (Brevo SMTP)
- 🔑 **Multi-Role Access Control** — Middleware autentikasi & otorisasi berbasis role

---

## 🛠️ Tech Stack

### Frontend

| Teknologi | Kegunaan |
|-----------|----------|
| **React 19** | Library UI komponen |
| **Vite 8** | Build tool & dev server ultra cepat |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Animasi & transisi halaman |
| **Axios** | HTTP client ke backend API |
| **html5-qrcode** | Scanner QR Code via kamera browser |
| **Lucide React & React Icons** | Ikon UI |

### Backend

| Teknologi | Kegunaan |
|-----------|----------|
| **Node.js + Express 5** | REST API server |
| **MySQL2 / TiDB Cloud** | Database relasional (cloud) |
| **bcrypt** | Hashing password |
| **jsonwebtoken (JWT)** | Token autentikasi |
| **Multer** | Upload file (banner, foto) |
| **Nodemailer** | Kirim email OTP & tiket |
| **dotenv** | Manajemen environment variables |
| **CORS** | Cross-Origin Resource Sharing |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   Browser (React + Vite)  ←→  React Router  ←→  Context API   │
│   (AuthContext, ThemeContext, ToastContext, ConfirmContext)      │
└─────────────────────────┬───────────────────────────────────────┘
                          │  HTTP / Axios (REST API calls)
                          │  Authorization: Bearer <JWT>
┌─────────────────────────▼───────────────────────────────────────┐
│                       SERVER LAYER                              │
│                                                                 │
│   Express.js App (port 5000)                                   │
│   │                                                             │
│   ├── CORS Middleware (whitelist frontend origin)               │
│   ├── express.json() / express.urlencoded()                     │
│   ├── /uploads → Static file serving                           │
│   │                                                             │
│   └── API Routes                                                │
│       ├── /api/auth          → authController                   │
│       ├── /api/users         → userController                   │
│       ├── /api/events        → eventController                  │
│       ├── /api/categories    → categoryController               │
│       ├── /api/organizers    → organizerController              │
│       ├── /api/speakers      → speakerController                │
│       ├── /api/registrations → registrationController           │
│       ├── /api/favorites     → favoriteController               │
│       ├── /api/gallery       → galleryController                │
│       ├── /api/dashboard     → dashboardController              │
│       └── /api/about         → aboutController                  │
│                                                                 │
│   Middlewares:                                                  │
│   ├── authenticate.js   (verifikasi JWT token)                  │
│   ├── requireAdmin.js   (role: admin | super_admin)             │
│   ├── requireSuperAdmin.js (role: super_admin saja)             │
│   └── upload.js         (Multer file handler)                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │  mysql2 connection pool (SSL)
┌─────────────────────────▼───────────────────────────────────────┐
│                      DATABASE LAYER                             │
│                                                                 │
│   TiDB Cloud (MySQL-compatible) — host: AWS ap-southeast-1     │
│                                                                 │
│   Tables: users, super_admin_config, categories, organizers,   │
│           speakers, events, event_speakers, registrations,     │
│           tickets, galleries, favorites, about_developers      │
└─────────────────────────────────────────────────────────────────┘
                          │  Nodemailer (Brevo SMTP)
┌─────────────────────────▼───────────────────────────────────────┐
│                      EMAIL SERVICE                              │
│   smtp-relay.brevo.com:587                                      │
│   → Kirim OTP, Tiket QR, Reset Password                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Skema Database

```
users
  id, username, email, password, role,
  photo, university, semester, student_id,
  is_verified, reset_token, reset_token_expires

super_admin_config
  id, name, password_hash, updated_at

categories                    organizers
  id, name, slug                id, name, logo, description, email, phone

                 ┌─────────────────────────────────┐
                 │             events               │
                 │  id, title, slug, banner,        │
                 │  description, category_id,       │
                 │  organizer_id, location,         │
                 │  maps_link, start_date,          │
                 │  end_date, registration_deadline,│
                 │  max_quota, visibility, status   │
                 └───────────────┬─────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                       │
   event_speakers           registrations            galleries
   event_id, speaker_id       id, user_id,           id, event_id,
         │                    event_id, status,       image_path
      speakers                qr_token
   id, name, photo,               │
   position, institution       tickets
   biography                  id, registration_id, qr_code

favorites
  user_id, event_id

about_developers
  id, name, role_title, description, photo,
  github_url, instagram_url, whatsapp_number
```

---

## 🔄 Alur Logika / Flowchart

### 1. Alur Registrasi & Login User

```
[Pengguna] → Akses /register
     │
     ▼
Input: username, email, password, NIM, universitas
     │
     ├─ Validasi form (semua field wajib, password min 6 char)
     ├─ Cek email domain valid (DNS MX lookup)
     ├─ Cek email belum terdaftar di DB
     │
     ▼
Generate OTP (6 digit) → Kirim via Email (Brevo SMTP)
     │
     ▼
[Halaman Verify OTP] → Input OTP
     │
     ├─ OTP valid & belum expired → Akun aktif (is_verified = true)
     └─ OTP salah / expired → Tampilkan error, bisa resend OTP
           │
           ▼
     [Redirect ke /login]
           │
     Input email + password
           │
     Backend verifikasi:
     ├─ Cek email di tabel users (role: user/admin)
     │    └─ bcrypt.compare(password, hash)
     └─ Cek Super Admin email di super_admin_config
          └─ bcrypt.compare(password, hash)
           │
     ▼ (berhasil)
     Generate JWT (expires: 7 hari)
     Response: { token, user: { id, role, username, ... } }
           │
     Frontend simpan token di localStorage
     Set AuthContext → user terautentikasi
           │
     ▼
     Redirect berdasarkan role:
     ├─ super_admin / admin → /admin (dashboard)
     └─ user → / (halaman utama)
```

### 2. Alur Pendaftaran Acara (User)

```
[User Login] → Browse /events
     │
     ▼
Pilih acara → /events/:id (EventDetail)
     │
     ▼
Klik "Daftar Sekarang"
     │
     ├─ Cek: user sudah login? → Tidak → Redirect /login
     ├─ Cek: acara masih published & quota tersedia?
     ├─ Cek: user belum terdaftar di acara ini?
     │
     ▼ (semua lolos)
POST /api/registrations/:eventId
     │
     ▼
Backend:
├─ Generate qr_token (crypto.randomBytes 16 bytes → hex)
├─ INSERT INTO registrations (user_id, event_id, qr_token)
├─ INSERT INTO tickets (registration_id, qr_code)
└─ Kirim email tiket dengan QR Code ke user
     │
     ▼
[User] Terima email tiket + QR Code
     │
     ▼
Di hari acara: Admin scan QR → status "attended"
```

### 3. Alur Scan QR Presensi (Admin)

```
[Admin] → /admin/events → Pilih acara → Klik "Mulai Event"
     │
PUT /api/events/:id/start → event status = 'started'
     │
     ▼
Admin buka fitur Scan QR (html5-qrcode via kamera)
     │
     ▼
Scan QR Code peserta
     │
POST /api/events/:id/scan { qr_token }
     │
Backend:
├─ Cari registrations WHERE qr_token = ? AND event_id = ?
├─ Cek status = 'registered' (belum diabsen)
└─ UPDATE registrations SET status = 'attended'
     │
     ▼
Response: nama peserta + status berhasil
Tampilkan konfirmasi di halaman ScanResult
```

### 4. Alur Manajemen Acara (Admin)

```
[Admin] → /admin/events
     │
     ├── Buat Acara → /admin/events/create
     │     POST /api/events (multipart/form-data + banner image)
     │     Backend: upload via Multer → simpan ke /uploads/
     │
     ├── Edit Acara → PUT /api/events/:id
     │     (ubah data + ganti banner opsional)
     │
     ├── Publish Acara → ubah status: draft → published
     │
     ├── Lihat Peserta → GET /api/events/:id/participants
     │
     ├── Kelola Presensi → PUT /api/events/:id/attendance/:regId
     │
     └── Selesaikan Event → PUT /api/events/:id/finish
           status event = 'finished'
```

### 5. Alur Forgot Password

```
[User] → /forgot-password → Input email
     │
POST /api/auth/forgot-password
     │
Backend:
├─ Generate reset token (crypto) + expires (1 jam)
├─ Simpan ke users.reset_token, reset_token_expires
└─ Kirim email link reset: /reset-password/:token
     │
     ▼
[User] Klik link di email → /reset-password/:token
     │
POST /api/auth/reset-password { token, newPassword }
     │
Backend:
├─ Verifikasi token & belum expired
├─ bcrypt.hash(newPassword, 12)
└─ UPDATE users SET password = hash, reset_token = NULL
     │
     ▼
Password berhasil direset → Redirect /login
```

---

## 📁 Struktur Folder

```
UAS/
├── .env                          # Environment variables (DB, SMTP, JWT, dll.)
├── ca.pem                        # SSL Certificate untuk TiDB Cloud
├── uploads/                      # File upload (banner acara, foto profil)
│
├── backend/
│   ├── index.js                  # Entry point Express server
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── db.js             # MySQL connection pool (dengan SSL)
│       │   └── dbInit.js         # Auto-create semua tabel saat startup
│       ├── controllers/          # Business logic tiap domain
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── eventController.js
│       │   ├── registrationController.js
│       │   ├── categoryController.js
│       │   ├── organizerController.js
│       │   ├── speakerController.js
│       │   ├── favoriteController.js
│       │   ├── galleryController.js
│       │   ├── dashboardController.js
│       │   └── aboutController.js
│       ├── middlewares/
│       │   ├── authenticate.js   # Verifikasi JWT
│       │   ├── requireAdmin.js   # Cek role admin/super_admin
│       │   ├── requireSuperAdmin.js # Cek role super_admin
│       │   └── upload.js         # Multer config (file upload)
│       ├── routes/               # Definisi endpoint per domain
│       ├── services/
│       │   ├── emailService.js   # Kirim OTP & reset password
│       │   └── otpStore.js       # In-memory OTP store + rate limiting
│       └── utils/
│           └── mailer.js         # Kirim tiket via email
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx              # Mount React app
        ├── App.jsx               # Router + Provider setup + ThemeContext
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state (user, login, logout)
        │   ├── ToastContext.jsx  # Notifikasi toast global
        │   └── ConfirmContext.jsx # Dialog konfirmasi global
        ├── components/
        │   ├── Navbar.jsx        # Navigasi utama (responsif, dark mode)
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx # Guard route berdasarkan role
        │   ├── AdminLayout.jsx   # Layout wrapper halaman admin
        │   └── admin/
        │       └── AdminSidebar.jsx
        ├── pages/
        │   ├── Home.jsx          # Landing page
        │   ├── EventList.jsx     # Daftar semua acara (filter, search)
        │   ├── EventDetail.jsx   # Detail acara + tombol daftar
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── VerifyOTP.jsx
        │   ├── ForgotPassword.jsx
        │   ├── ResetPassword.jsx
        │   ├── Profile.jsx       # Profil user + riwayat pendaftaran
        │   ├── Favorites.jsx     # Acara favorit user
        │   ├── ScanResult.jsx    # Hasil scan QR tiket tamu
        │   ├── About.jsx         # Halaman tentang pengembang
        │   ├── AdminDashboard.jsx
        │   ├── EventManagement.jsx
        │   ├── CreateEvent.jsx
        │   ├── AdminUsers.jsx    # (Super Admin only)
        │   ├── AdminAboutSettings.jsx
        │   └── admin/
        │       ├── AdminCategories.jsx
        │       ├── AdminSpeakers.jsx
        │       ├── AdminOrganizers.jsx
        │       ├── AdminParticipants.jsx
        │       ├── AdminRegistrations.jsx
        │       └── AdminSettings.jsx
        └── services/             # Axios API call functions
```

---

## 🚀 Cara Menggunakan Proyek

### Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) v18+ (cek: `node -v`)
- npm v9+ (cek: `npm -v`)
- Akses ke database TiDB Cloud (atau MySQL lokal)

---

### Langkah 1 — Clone & Persiapan

```bash
# Buka direktori proyek
cd "d:/file semester 4/pengembangan web/UAS"
```

---

### Langkah 2 — Konfigurasi Environment

Buat atau edit file `.env` di root direktori (`UAS/.env`):

```env
# Database (TiDB Cloud / MySQL)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=<db_username>
DB_PASSWORD=<db_password>
DB_NAME=<db_name>
DB_SSL_CA=./ca.pem

# SMTP Email (contoh: Brevo)
SMTP_SERVER=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_LOGIN=<smtp_login>
SMTP_PASSWORD=<smtp_password>
SMTP_SENDER=<email_pengirim>

# Super Admin
Super_Admin_Email_=<email_super_admin>
password_default_super_admin=<password_default>

# Server
PORT=5000
JWT_SECRET=<rahasia_jwt_panjang>
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Jangan commit file `.env` ke repository publik!**

---

### Langkah 3 — Jalankan Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Jalankan server (akan auto-create semua tabel DB saat pertama kali)
npm start
```

Server berjalan di: `http://localhost:5000`

Jika berhasil, console menampilkan:
```
[DB] All tables initialized successfully.
[SERVER] Running on http://localhost:5000
[DB]     Connected to gateway01.ap-southeast-1.prod.aws.tidbcloud.com
```

---

### Langkah 4 — Jalankan Frontend

Buka terminal baru:

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

### Langkah 5 — Akses Aplikasi

| URL | Halaman |
|-----|---------|
| `http://localhost:5173/` | Home (landing page) |
| `http://localhost:5173/events` | Daftar acara |
| `http://localhost:5173/register` | Daftar akun baru |
| `http://localhost:5173/login` | Login |
| `http://localhost:5173/admin` | Dashboard Admin *(login dulu)* |

### Login Super Admin
- **Email**: sesuai `Super_Admin_Email_` di `.env`
- **Password**: sesuai `password_default_super_admin` di `.env`

---

## ⚙️ Konfigurasi Environment

| Variable | Keterangan |
|----------|------------|
| `DB_HOST` | Host database MySQL/TiDB |
| `DB_PORT` | Port database (default: 4000 untuk TiDB) |
| `DB_USER` | Username database |
| `DB_PASSWORD` | Password database |
| `DB_NAME` | Nama database |
| `DB_SSL_CA` | Path ke file SSL certificate (`ca.pem`) |
| `SMTP_SERVER` | Host SMTP server (email) |
| `SMTP_PORT` | Port SMTP (587 untuk TLS) |
| `SMTP_LOGIN` | Login SMTP |
| `SMTP_PASSWORD` | Password SMTP |
| `SMTP_SENDER` | Alamat email pengirim |
| `Super_Admin_Email_` | Email login Super Admin |
| `password_default_super_admin` | Password default Super Admin (akan di-hash saat init) |
| `PORT` | Port server Express (default: 5000) |
| `JWT_SECRET` | Secret key untuk sign JWT token |
| `FRONTEND_URL` | URL frontend (untuk CORS whitelist) |

---

## 📡 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| POST | `/register` | Public | Daftar akun baru + kirim OTP |
| POST | `/verify-otp` | Public | Verifikasi OTP email |
| POST | `/resend-otp` | Public | Kirim ulang OTP |
| POST | `/login` | Public | Login, return JWT |
| POST | `/forgot-password` | Public | Kirim email reset password |
| POST | `/reset-password` | Public | Reset password dengan token |
| POST | `/change-super-admin-password` | Super Admin | Ganti password Super Admin |

### Events (`/api/events`)

| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/` | Public | Semua acara (filter by role) |
| GET | `/:id` | Public | Detail acara |
| POST | `/` | Admin | Buat acara baru |
| PUT | `/:id` | Admin | Edit acara |
| DELETE | `/:id` | Admin | Hapus acara |
| GET | `/:id/participants` | Admin | Daftar peserta |
| PUT | `/:id/start` | Admin | Mulai event |
| PUT | `/:id/finish` | Admin | Selesaikan event |
| POST | `/:id/scan` | Admin | Scan QR presensi |
| PUT | `/:id/attendance/:regId` | Admin | Update status presensi |

### Registrations (`/api/registrations`)

| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| POST | `/:eventId` | User Login | Daftar acara |
| DELETE | `/:eventId` | User Login | Batalkan pendaftaran |
| GET | `/me` | User Login | Riwayat pendaftaran |
| GET | `/:id/ticket` | User Login | Lihat tiket |
| POST | `/guest/:eventId` | Public | Daftar sebagai tamu |
| GET | `/scan/:token` | Public | Verifikasi tiket tamu |
| DELETE | `/admin/:regId` | Admin | Batalkan pendaftaran user |

### Users (`/api/users`)

| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/me` | User Login | Profil sendiri |
| PUT | `/me` | User Login | Update profil |
| POST | `/me/photo` | User Login | Upload foto profil |
| DELETE | `/me` | User Login | Hapus akun sendiri |
| GET | `/` | Super Admin | Semua user |
| PUT | `/:id/role` | Super Admin | Ubah role user |
| DELETE | `/:id` | Super Admin | Hapus user |
| POST | `/:id/reject` | Admin | Tolak & hapus user |

---

## 👨‍💻 Tim Pengembang

Lihat halaman **About** di aplikasi (`/about`) untuk informasi lengkap tim pengembang.

---

## 📄 Lisensi

Proyek ini dibuat sebagai tugas akhir semester (UAS) mata kuliah **Pengembangan Web** — Semester 4.
