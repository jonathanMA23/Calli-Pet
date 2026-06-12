import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calli Pet | Servicios y bienestar para tu mascota',
  description:
    'Reserva servicios, administra a tus mascotas, consulta expedientes y encuentra opciones de adopción.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
