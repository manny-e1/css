import type { Metadata } from 'next';
import '@/styles/index.css';

export const metadata: Metadata = {
  title: 'Carbon Smart Spaces - Sustainable Construction Materials',
  description: 'Carbon Smart Spaces by KINE MODU helps construction professionals discover verified local materials with price and carbon clarity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

