import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Encryption key (production'da env'den al)
const ENCRYPTION_KEY = process.env.TWO_FACTOR_SECRET || 'monelixa-2fa-secret-key';

// ─────────────────────────────────────────────────────────────────
// Generate Secret
// ─────────────────────────────────────────────────────────────────
export function generateTwoFactorSecret(): string {
  return authenticator.generateSecret();
}

// ─────────────────────────────────────────────────────────────────
// Encrypt Secret (DB'de saklamak icin)
// ─────────────────────────────────────────────────────────────────
export function encryptSecret(secret: string): string {
  return CryptoJS.AES.encrypt(secret, ENCRYPTION_KEY).toString();
}

// ─────────────────────────────────────────────────────────────────
// Decrypt Secret
// ─────────────────────────────────────────────────────────────────
export function decryptSecret(encryptedSecret: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedSecret, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// ─────────────────────────────────────────────────────────────────
// Generate QR Code
// ─────────────────────────────────────────────────────────────────
export async function generateQRCode(
  email: string,
  secret: string
): Promise<string> {
  const otpauth = authenticator.keyuri(email, 'Monelixa', secret);
  const qrCode = await QRCode.toDataURL(otpauth);
  return qrCode;
}

// ─────────────────────────────────────────────────────────────────
// Verify Token
// ─────────────────────────────────────────────────────────────────
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
// Enable 2FA for Admin
// ─────────────────────────────────────────────────────────────────
export async function enableTwoFactor(
  adminId: string,
  secret: string
): Promise<boolean> {
  const encryptedSecret = encryptSecret(secret);

  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({
      two_factor_enabled: true,
      two_factor_secret: encryptedSecret,
    })
    .eq('id', adminId);

  return !error;
}

// ─────────────────────────────────────────────────────────────────
// Disable 2FA
// ─────────────────────────────────────────────────────────────────
export async function disableTwoFactor(adminId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
    })
    .eq('id', adminId);

  return !error;
}

// ─────────────────────────────────────────────────────────────────
// Verify Admin 2FA
// ─────────────────────────────────────────────────────────────────
export async function verifyAdminTwoFactor(
  adminId: string,
  token: string
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('two_factor_secret')
    .eq('id', adminId)
    .single();

  if (!data?.two_factor_secret) return false;

  const secret = decryptSecret(data.two_factor_secret);
  return verifyTwoFactorToken(token, secret);
}