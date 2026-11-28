import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@frithly/core', '@frithly/db', '@frithly/engine'],
  serverExternalPackages: ['imapflow', 'nodemailer', 'mailparser', 'postgres'],
  poweredByHeader: false,
};
export default config;
