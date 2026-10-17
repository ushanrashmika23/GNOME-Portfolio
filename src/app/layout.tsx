import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Ushan Rashmika | @Ushanrashmika23 - Fullstack Developer',
  description: 'Portfolio of Ushan Rashmika (ushanrashmika23) — Full Stack Developer and Open Source Enthusiast. Explore projects, blogs, and contributions to the tech community.',
  keywords: ['ushanrashmika23', 'Ushan Rashmika', 'Software Engineer', 'Portfolio', 'ushanrashmika', 'ushan rashmika'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#0a0e1a', colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="dark text-white" style={{ backgroundColor: '#0a0e1a', color: '#ffffff' }}>{children}</body>
    </html>
  );
}

