import Link from 'next/link';
import { OperationsManager } from './operations-manager';

export const metadata = {
  title: 'Panel operativo | Calli Pet',
  description: 'Administración integral de la plataforma Calli Pet.',
};

export default function PlatformPage() {
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
            Sitio principal
          </Link>
        </div>
      </header>

      <OperationsManager />
    </main>
  );
}
