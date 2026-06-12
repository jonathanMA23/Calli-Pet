import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calli Pet | Plataforma integral para mascotas',
  description:
    'Gestión de tutores, mascotas, proveedores, servicios, reservas, pagos y expedientes.',
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
