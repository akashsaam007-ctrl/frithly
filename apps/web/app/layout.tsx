import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frithly · See which companies need you this week',
  description: 'Frithly watches for buying signals, finds the right person and their verified email, and writes a first email you approve before anything is sent.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
