import 'server-only';
import nodemailer from 'nodemailer';

/**
 * System email (sign-in codes, notices). Any SMTP provider works: Resend, Postmark, SES, Zoho.
 * Without SYSTEM_SMTP_HOST the message is printed to the server log, for local development.
 */
export async function sendSystemMail(to: string, subject: string, text: string) {
  const host = process.env.SYSTEM_SMTP_HOST;
  if (!host) {
    // In production a missing mail server would silently swallow sign-in codes; fail loudly instead.
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOG_MAIL !== '1') throw new Error('SYSTEM_SMTP_HOST is not set, so sign-in codes cannot be emailed.');
    console.log(`[dev mail] to=${to} subject=${subject}\n${text}`);
    return;
  }
  const t = nodemailer.createTransport({
    host,
    port: Number(process.env.SYSTEM_SMTP_PORT ?? 587),
    secure: process.env.SYSTEM_SMTP_SECURE === '1',
    auth: { user: process.env.SYSTEM_SMTP_USER, pass: process.env.SYSTEM_SMTP_PASS },
  });
  await t.sendMail({ from: process.env.SYSTEM_FROM ?? 'Frithly <hello@frithly.com>', to, subject, text });
}
