import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calli Pet | Bienestar y servicios para mascotas',
  description:
    'Encuentra profesionales, agenda servicios y administra el bienestar de tu mascota.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
