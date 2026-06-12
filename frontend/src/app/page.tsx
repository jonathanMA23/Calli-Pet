import Link from 'next/link';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface SystemStatus {
  status: string;
  frontend: string;
  api: string;
  database: string;
  databaseName?: string;
  postgresVersion?: string;
  checkedAt?: string;
  counts?: {
    users: number;
    pets: number;
    providers: number;
    bookings: number;
  };
  error?: string;
}

async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const response = await fetch(`${API_URL}/status`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    return (await response.json()) as SystemStatus;
  } catch (error) {
    return {
      status: 'offline',
      frontend: 'available',
      api: 'disconnected',
      database: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown API error',
    };
  }
}

function StatusDot({ online }: { online: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 rounded-full ${
        online ? 'bg-[#5e6b4f]' : 'bg-[#b42318]'
      }`}
    />
  );
}

function PawIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24">
      <path
        d="M8.4 10.2c1.3 0 2.3-1.4 2.3-3.1S9.7 4 8.4 4 6.1 5.4 6.1 7.1s1 3.1 2.3 3.1Zm7.2 0c1.3 0 2.3-1.4 2.3-3.1S16.9 4 15.6 4s-2.3 1.4-2.3 3.1 1 3.1 2.3 3.1ZM4.7 14.6c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5Zm14.6 0c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5ZM12 11.5c-3.6 0-6.5 2.6-6.5 5.8 0 1.8 1.3 2.7 2.8 2.7 1.3 0 2.4-.8 3.7-.8s2.4.8 3.7.8c1.5 0 2.8-.9 2.8-2.7 0-3.2-2.9-5.8-6.5-5.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function Home() {
  const system = await getSystemStatus();
  const apiOnline = system.api === 'connected';
  const databaseOnline = system.database === 'connected';
  const counts = system.counts ?? {
    users: 0,
    pets: 0,
    providers: 0,
    bookings: 0,
  };

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#171717]">
      <header className="border-b border-black/10 bg-[#f7f3ea]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171717] text-white">
              <PawIcon />
            </span>
            <span className="text-xl font-bold">Calli Pet</span>
          </Link>

          <nav className="hidden gap-8 text-sm font-semibold md:flex">
            <a href="#servicios">Servicios</a>
            <a href="#arquitectura">Arquitectura</a>
            <a href="#estado">Estado del sistema</a>
            <Link href="/app/mascotas">CRUD mascotas</Link>
          </nav>

          <Link
            className="rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white"
            href="/app/mascotas"
          >
            Gestionar mascotas
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
            Ecosistema digital para mascotas
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl">
            Salud, cuidado y servicios
            <span className="block text-[#a64b2a]">en un solo lugar.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#666666]">
            Calli Pet conecta tutores con proveedores verificados y mantiene
            reservas, pagos, expedientes y seguimiento dentro de una plataforma.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="rounded-full bg-[#a64b2a] px-7 py-4 font-semibold text-white"
              href="#servicios"
            >
              Explorar servicios
            </a>
            <a
              className="rounded-full border border-black/15 bg-white px-7 py-4 font-semibold"
              href="#estado"
            >
              Ver conexiones
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#171717] p-7 text-white shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/55">Perfil de ejemplo</p>
              <h2 className="mt-2 text-3xl font-bold">Luna</h2>
              <p className="mt-1 text-white/60">Mestiza · 4 años</p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a64b2a]">
              <PawIcon />
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Próxima cita
              </p>
              <p className="mt-2 font-semibold">Consulta general</p>
              <p className="mt-1 text-sm text-white/60">15 de junio · 11:00</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Expediente
              </p>
              <p className="mt-2 font-semibold">Actualizado</p>
              <p className="mt-1 text-sm text-white/60">Vacunas vigentes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20" id="servicios">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-bold uppercase tracking-[0.18em] text-[#a64b2a]">
            Servicios del MVP
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
            Categorías principales
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Veterinaria', 'Consulta y seguimiento preventivo.'],
              ['Grooming', 'Baño, higiene y cuidado de apariencia.'],
              ['Paseos', 'Agenda y evidencia de recorridos.'],
              ['Cuidado', 'Visitas y acompañamiento a domicilio.'],
            ].map(([title, description]) => (
              <article
                className="rounded-3xl border border-black/10 bg-[#faf8f3] p-6"
                key={title}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0dfd3] font-bold text-[#a64b2a]">
                  {title.charAt(0)}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-[#666666]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" id="arquitectura">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-bold uppercase tracking-[0.18em] text-[#a64b2a]">
            Arquitectura
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
            Flujo técnico local
          </h2>

          <div className="mt-10 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {[
              ['Frontend', 'Next.js', 'localhost:3000'],
              ['Backend', 'NestJS', 'localhost:3001'],
              ['Base de datos', 'PostgreSQL 17', 'localhost:5432'],
            ].map(([title, technology, address], index) => (
              <div className="contents" key={title}>
                <article className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
                  <p className="text-sm font-semibold text-[#a64b2a]">
                    Capa {index + 1}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{title}</h3>
                  <p className="mt-2 text-[#666666]">{technology}</p>
                  <code className="mt-5 block rounded-xl bg-[#171717] p-3 text-sm text-white">
                    {address}
                  </code>
                </article>
                {index < 2 && (
                  <span className="hidden text-3xl text-[#a64b2a] lg:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#171717] py-20 text-white" id="estado">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-[#d88a67]">
                Diagnóstico
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
                Estado de las conexiones
              </h2>
            </div>
            <p className="text-sm text-white/50">
              Actualiza la página para volver a consultar
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/50">Frontend</p>
              <p className="mt-3 flex items-center gap-3 text-xl font-semibold">
                <StatusDot online />
                Conectado
              </p>
              <p className="mt-3 text-sm text-white/50">Next.js · puerto 3000</p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/50">API</p>
              <p className="mt-3 flex items-center gap-3 text-xl font-semibold">
                <StatusDot online={apiOnline} />
                {apiOnline ? 'Conectada' : 'Desconectada'}
              </p>
              <p className="mt-3 text-sm text-white/50">
                NestJS · puerto 3001
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/50">PostgreSQL</p>
              <p className="mt-3 flex items-center gap-3 text-xl font-semibold">
                <StatusDot online={databaseOnline} />
                {databaseOnline ? 'Conectada' : 'Desconectada'}
              </p>
              <p className="mt-3 text-sm text-white/50">
                {system.databaseName ?? 'Base no disponible'}
              </p>
            </article>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Usuarios', counts.users],
              ['Mascotas', counts.pets],
              ['Proveedores', counts.providers],
              ['Reservas', counts.bookings],
            ].map(([label, value]) => (
              <article
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
                key={label}
              >
                <p className="text-sm text-white/50">{label}</p>
                <p className="mt-2 text-4xl font-bold">{value}</p>
              </article>
            ))}
          </div>

          {system.error && (
            <div className="mt-5 rounded-2xl border border-[#b42318]/50 bg-[#b42318]/10 p-5 text-sm text-red-100">
              {system.error}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-white px-6 py-8 text-center text-sm text-[#666666]">
        © 2026 Calli Pet · Proyecto académico
      </footer>
    </main>
  );
}
