/**
 * In-memory OTP store and rate limiter.
 */
const otpMap = new Map();
const rateLimitMap = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/** Generate a 5-digit numeric OTP */
const generateOTP = () => {
  return String(Math.floor(10000 + Math.random() * 90000));
};

/** Store OTP for the given email (overwrites any existing OTP) */
const storeOTP = (email, otp) => {
  otpMap.set(email.toLowerCase(), {
    otp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });
};

/** Verify and consume OTP — returns true if valid, false otherwise */
const verifyOTP = (email, inputOtp) => {
  const key = email.toLowerCase();
  const record = otpMap.get(key);
  if (!record) return false;
  if (new Date() > record.expiresAt) {
    otpMap.delete(key);
    return false;
  }
  if (record.otp !== inputOtp) return false;
  otpMap.delete(key); // consume after successful verify
  return true;
};

/** Rate limiting check */
const canRequestOTP = (email) => {
  const key = email.toLowerCase();
  const now = new Date();
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetAt: new Date(now.getTime() + 60 * 1000), blockUntil: null });
    return { allowed: true };
  }
  
  const record = rateLimitMap.get(key);
  
  if (record.blockUntil && now < record.blockUntil) {
    return { allowed: false, reason: `Harap tunggu ${Math.ceil((record.blockUntil - now) / 1000)} detik sebelum mencoba lagi.` };
  }
  
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = new Date(now.getTime() + 60 * 1000);
    record.blockUntil = null;
    return { allowed: true };
  }
  
  if (record.count >= 3) {
    record.blockUntil = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes block
    record.resetAt = new Date(now.getTime() + 3 * 60 * 1000); 
    return { allowed: false, reason: 'Terlalu banyak percobaan. Harap tunggu 2 menit.' };
  }
  
  record.count += 1;
  return { allowed: true };
};

module.exports = { generateOTP, storeOTP, verifyOTP, canRequestOTP };
