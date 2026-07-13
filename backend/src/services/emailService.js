const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMPTP_API_KEY,
  },
});

/**
 * Send OTP verification email
 */
const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"SmartEventPU" <${process.env.SMTP_SENDER}>`,
    to,
    subject: 'Kode Verifikasi SmartEventPU',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #6366f1; margin: 0;">SmartEvent<span style="color: #0ea5e9;">PU</span></h1>
          <p style="color: #64748b; margin-top: 4px;">Platform Acara Kampus</p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 8px;">Verifikasi Akun Anda</h2>
          <p style="color: #64748b; margin-bottom: 24px;">Masukkan kode OTP berikut untuk mengaktifkan akun Anda. Kode berlaku selama <strong>5 menit</strong>.</p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #0ea5e9); color: white; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 16px 32px; border-radius: 12px;">
              ${otp}
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: center;">Jika Anda tidak mendaftar, abaikan email ini.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">© ${new Date().getFullYear()} SmartEventPU — Universitas Potensi Utama</p>
      </div>
    `,
  });
};

/**
 * Send password reset link email
 */
const sendResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: `"SmartEventPU" <${process.env.SMTP_SENDER}>`,
    to,
    subject: 'Reset Password SmartEventPU',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #6366f1; margin: 0;">SmartEvent<span style="color: #0ea5e9;">PU</span></h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 8px;">Reset Password</h2>
          <p style="color: #64748b; margin-bottom: 24px;">Klik tombol di bawah untuk membuat password baru. Link berlaku selama <strong>1 jam</strong>.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #0ea5e9); color: white; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 32px; border-radius: 50px;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: center;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">© ${new Date().getFullYear()} SmartEventPU</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendResetEmail };
