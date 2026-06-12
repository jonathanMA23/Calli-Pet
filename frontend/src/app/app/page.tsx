import Link from 'next/link';
import { UserPortal } from './user-portal';

export const metadata = {
  title: 'Mi cuenta | Calli Pet',
  description:
    'Administra tus mascotas, reserva servicios y consulta opciones de adopción.',
};

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#171717]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 lg:px-8">
          <Link className="text-xl font-bold" href="/">
            Calli Pet
          </Link>
          <Link
            className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold"
            href="/"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <UserPortal />
    </main>
  );
}
