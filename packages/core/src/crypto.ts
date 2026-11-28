import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** AES-256-GCM for mailbox passwords and OAuth tokens at rest. Key: 32 bytes, base64, in ENCRYPTION_KEY. */
function key() {
  const k = Buffer.from(process.env.ENCRYPTION_KEY ?? '', 'base64');
  if (k.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes, base64-encoded (openssl rand -base64 32)');
  return k;
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64'), c.getAuthTag().toString('base64'), enc.toString('base64')].join(':');
}

export function decrypt(blob: string): string {
  const [v, iv, tag, data] = blob.split(':');
  if (v !== 'v1') throw new Error('Unknown ciphertext version');
  const d = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(data, 'base64')), d.final()]).toString('utf8');
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const token = (bytes = 24) => randomBytes(bytes).toString('base64url');

/** 6-digit numeric code. */
export const otpCode = () => (randomBytes(4).readUInt32BE() % 1_000_000).toString().padStart(6, '0');
