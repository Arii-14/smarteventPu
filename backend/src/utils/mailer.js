const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMPTP_API_KEY
  }
});

// ─── Email: Tiket untuk TAMU (guest) ─────────────────────────────────────────
const sendGuestTicketEmail = async (toEmail, guestName, eventTitle, qrToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${frontendUrl}/scan/${qrToken}`;

  const mailOptions = {
    from: process.env.SMTP_SENDER,
    to: toEmail,
    subject: `Tiket Acara Anda: ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Halo ${guestName},</h2>
        <p>Terima kasih telah mendaftar untuk acara <strong>${eventTitle}</strong>.</p>
        <p>Berikut adalah kode QR tiket Anda. Silakan tunjukkan kode QR ini saat menghadiri acara.</p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrUrl}" alt="QR Code Tiket" style="border: 2px solid #ddd; padding: 10px; border-radius: 10px;" />
        </div>
        <p>Anda juga dapat melihat status pendaftaran Anda dengan mengakses tautan ini:</p>
        <p><a href="${frontendUrl}/scan/${qrToken}">${frontendUrl}/scan/${qrToken}</a></p>
        <p>Sampai jumpa di acara!</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

// ─── Email: Tiket untuk USER TERDAFTAR (akun website) ────────────────────────
const sendUserTicketEmail = async (toEmail, userProfile, eventData, qrToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${frontendUrl}/scan/${qrToken}`;

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
    }) + ' WIB';
  };

  const displayName = userProfile.username || 'Peserta';
  const startFormatted = formatDate(eventData.start_date);
  const endFormatted = formatDate(eventData.end_date);

  const mailOptions = {
    from: process.env.SMTP_SENDER,
    to: toEmail,
    subject: `🎟️ Tiket Anda untuk: ${eventData.title}`,
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Tiket Acara – ${eventData.title}</title>
      </head>
      <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:620px;margin:30px auto;background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:20px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);box-shadow:0 25px 50px rgba(0,0,0,0.5);">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#7c3aed,#6366f1,#0ea5e9);padding:36px 32px;text-align:center;position:relative;">
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2220%22 cy=%2220%22 r=%2215%22 fill=%22rgba(255,255,255,0.05)%22/><circle cx=%2280%22 cy=%2280%22 r=%2220%22 fill=%22rgba(255,255,255,0.03)%22/></svg>');background-size:cover;"></div>
            <p style="color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;font-weight:600;">SmartEvent Platform</p>
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🎟️ Tiket Resmi</h1>
            <p style="color:rgba(255,255,255,0.8);margin:10px 0 0;font-size:15px;">Pendaftaran Anda berhasil dikonfirmasi</p>
          </div>

          <!-- Ticket Body -->
          <div style="padding:32px;">

            <!-- Greeting -->
            <p style="color:#e2e8f0;font-size:16px;margin:0 0 24px;">Halo, <strong style="color:#a78bfa;">${displayName}</strong> 👋</p>
            <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Selamat! Anda telah berhasil mendaftar untuk acara berikut. Simpan email ini baik-baik dan tunjukkan QR Code saat memasuki lokasi acara.
            </p>

            <!-- Event Info Card -->
            <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.25);border-radius:16px;padding:24px;margin-bottom:28px;">
              <h2 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 20px;line-height:1.3;">${eventData.title}</h2>

              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:140px;">
                    <span style="color:#6366f1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📅 Mulai</span>
                  </td>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="color:#e2e8f0;font-size:14px;font-weight:600;">${startFormatted}</span>
                  </td>
                </tr>
                ${eventData.end_date ? `
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:140px;">
                    <span style="color:#6366f1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🏁 Selesai</span>
                  </td>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="color:#e2e8f0;font-size:14px;font-weight:600;">${endFormatted}</span>
                  </td>
                </tr>` : ''}
                ${eventData.location ? `
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:140px;">
                    <span style="color:#6366f1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📍 Lokasi</span>
                  </td>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="color:#e2e8f0;font-size:14px;font-weight:600;">${eventData.location}</span>
                  </td>
                </tr>` : ''}
              </table>
            </div>

            <!-- Divider dotted -->
            <div style="border-top:2px dashed rgba(139,92,246,0.25);margin:0 -32px 28px;position:relative;">
              <div style="position:absolute;left:-12px;top:-12px;width:24px;height:24px;background:#0f172a;border-radius:50%;border:2px solid rgba(139,92,246,0.3);"></div>
              <div style="position:absolute;right:-12px;top:-12px;width:24px;height:24px;background:#0f172a;border-radius:50%;border:2px solid rgba(139,92,246,0.3);"></div>
            </div>

            <!-- QR Section -->
            <div style="text-align:center;margin-bottom:28px;">
              <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">QR CODE KEHADIRAN</p>
              <div style="display:inline-block;background:white;padding:16px;border-radius:16px;box-shadow:0 0 40px rgba(139,92,246,0.4);">
                <img src="${qrUrl}" alt="QR Code Tiket" width="200" height="200" style="display:block;border-radius:8px;" />
              </div>
              <p style="color:#64748b;font-size:11px;margin:12px 0 0;">Tunjukkan QR ini kepada panitia untuk konfirmasi kehadiran</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${frontendUrl}/scan/${qrToken}" 
                style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 20px rgba(99,102,241,0.4);">
                Lihat Status Tiket Online →
              </a>
            </div>

            <!-- Profile Summary -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;margin-bottom:24px;">
              <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;font-weight:700;">Data Peserta</p>
              <table style="width:100%;border-collapse:collapse;">
                ${userProfile.username ? `<tr><td style="padding:4px 0;color:#64748b;font-size:12px;width:120px;">Username</td><td style="padding:4px 0;color:#cbd5e1;font-size:13px;font-weight:600;">@${userProfile.username}</td></tr>` : ''}
                ${userProfile.nim ? `<tr><td style="padding:4px 0;color:#64748b;font-size:12px;">NIM</td><td style="padding:4px 0;color:#cbd5e1;font-size:13px;font-weight:600;">${userProfile.nim}</td></tr>` : ''}
                ${userProfile.prodi ? `<tr><td style="padding:4px 0;color:#64748b;font-size:12px;">Program Studi</td><td style="padding:4px 0;color:#cbd5e1;font-size:13px;font-weight:600;">${userProfile.prodi}</td></tr>` : ''}
                ${userProfile.university || userProfile.kampus ? `<tr><td style="padding:4px 0;color:#64748b;font-size:12px;">Universitas</td><td style="padding:4px 0;color:#cbd5e1;font-size:13px;font-weight:600;">${userProfile.university || userProfile.kampus}</td></tr>` : ''}
              </table>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:rgba(0,0,0,0.3);padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:#475569;font-size:12px;margin:0 0 6px;">© SmartEvent Platform – Email ini dikirim otomatis.</p>
            <p style="color:#334155;font-size:11px;margin:0;">Mohon tidak membalas email ini.</p>
          </div>

        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// ─── Email: Penolakan Akun ────────────────────────────────────────────────────
const sendRejectionEmail = async (toEmail, userName, adminName, adminRole, reason) => {
  const roleLabel = adminRole === 'super_admin' ? 'Super Admin' : 'Admin';
  const mailOptions = {
    from: process.env.SMTP_SENDER,
    to: toEmail,
    subject: `Pemberitahuan: Akun Anda Ditolak`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">SmartEvent</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Pemberitahuan Akun</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Halo ${userName},</h2>
          <p style="color: #475569; line-height: 1.7;">
            Kami ingin memberitahukan bahwa akun Anda pada platform <strong>SmartEvent</strong> telah <strong style="color: #dc2626;">ditolak</strong> oleh <strong>${adminName}</strong> selaku <strong>${roleLabel}</strong>.
          </p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <p style="color: #991b1b; font-weight: 600; margin: 0 0 8px;">Alasan Penolakan:</p>
            <p style="color: #7f1d1d; margin: 0; line-height: 1.6;">${reason}</p>
          </div>
          <p style="color: #475569; line-height: 1.7;">
            Jika Anda merasa ada kekeliruan, silakan hubungi tim kami untuk informasi lebih lanjut.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
          </p>
        </div>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendGuestTicketEmail,
  sendUserTicketEmail,
  sendRejectionEmail
};
