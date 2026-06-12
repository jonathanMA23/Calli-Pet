import Link from 'next/link';
import { PetsManager } from './pets-manager';

export const metadata = {
  title: 'Mascotas | Calli Pet',
  description: 'Administración visual de mascotas registradas en Calli Pet.',
};

export default function PetsPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#171717]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
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

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="font-semibold uppercase tracking-[0.18em] text-[#a64b2a]">
          Demostración funcional
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          CRUD visual de mascotas
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#666666]">
          Esta pantalla crea, consulta, actualiza y desactiva registros reales
          almacenados en PostgreSQL mediante la API NestJS.
        </p>

        <PetsManager />
      </section>
    </main>
  );
}
