import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const ADMIN_EMAIL = (process.env.MANAGE_ADMIN_EMAIL || 'ushanrashmika23@gmail.com').trim().toLowerCase();
const AUTH_SECRET = process.env.AUTH_SECRET || 'gnome-portfolio-super-secret-key-2024';

interface AuthCodeEntry {
  code: string;
  email: string;
  expiresAt: number;
}

// Persistent file path to guarantee sharing between Next.js webpack route bundles
const OTP_FILE_PATH = path.join(process.cwd(), '.auth-codes.json');

// Global memory cache on globalThis
declare global {
  var __GNOME_OTP_STORE: Map<string, AuthCodeEntry> | undefined;
}
if (!globalThis.__GNOME_OTP_STORE) {
  globalThis.__GNOME_OTP_STORE = new Map<string, AuthCodeEntry>();
}
const otpStore = globalThis.__GNOME_OTP_STORE;

function saveCodesToFile() {
  try {
    const obj: Record<string, AuthCodeEntry> = {};
    for (const [k, v] of otpStore.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(OTP_FILE_PATH, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error('Error saving OTP to file:', err);
  }
}

function loadCodesFromFile() {
  try {
    if (fs.existsSync(OTP_FILE_PATH)) {
      const data = fs.readFileSync(OTP_FILE_PATH, 'utf-8');
      const obj = JSON.parse(data);
      for (const [k, v] of Object.entries(obj)) {
        otpStore.set(k, v as AuthCodeEntry);
      }
    }
  } catch (err) {
    console.error('Error loading OTP from file:', err);
  }
}

// Initialize on module load
loadCodesFromFile();

/**
 * Generate a 6-digit numeric OTP code for the given email
 */
export function generateOtpCode(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  const entry: AuthCodeEntry = {
    code,
    email: normalizedEmail,
    expiresAt,
  };

  otpStore.set(normalizedEmail, entry);
  saveCodesToFile();

  console.log(`[GNOME AUTH] Generated verification code for ${normalizedEmail} (valid until ${new Date(expiresAt).toLocaleTimeString()})`);

  return code;
}

/**
 * Verify a 6-digit OTP code
 */
export function verifyOtpCode(email: string, code: string): boolean {
  loadCodesFromFile();
  const normalizedEmail = email.trim().toLowerCase();
  const entry = otpStore.get(normalizedEmail);
  const cleanCode = (code || '').trim();

  console.log(`[GNOME AUTH] Verifying code attempt for ${normalizedEmail}...`);

  if (!entry) {
    console.warn(`[GNOME AUTH] No active code found for email: ${normalizedEmail}`);
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    console.warn(`[GNOME AUTH] Code for ${normalizedEmail} has expired.`);
    otpStore.delete(normalizedEmail);
    saveCodesToFile();
    return false;
  }

  if (entry.code.trim() === cleanCode) {
    console.log(`[GNOME AUTH] Code successfully verified for ${normalizedEmail}`);
    otpStore.delete(normalizedEmail);
    saveCodesToFile();
    return true;
  }

  console.warn(`[GNOME AUTH] Code mismatch for ${normalizedEmail}.`);
  return false;
}

/**
 * Create a signed session token
 */
export function createSessionToken(email: string): string {
  const payload = {
    email: email.toLowerCase(),
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Verify a signed session token
 */
export function verifySessionToken(token: string): { email: string; valid: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { email: '', valid: false };

    const [payloadStr, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadStr)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { email: '', valid: false };
    }

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) {
      return { email: '', valid: false };
    }

    return { email: payload.email, valid: true };
  } catch {
    return { email: '', valid: false };
  }
}
