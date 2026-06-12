import Link from 'next/link';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface Booking {
  id: string;
  scheduledAt: string;
  status: string;
  totalAmount: number;
  userName: string;
  petName: string;
  providerName: string;
  serviceName: string;
}

interface Dashboard {
  users: number;
  pets: number;
  providers: number;
  services: number;
  bookings: number;
  incidents: number;
  notifications: number;
  revenue: number;
  recentBookings: Booking[];
}

async function getDashboard(): Promise<Dashboard | null> {
  try {
    const response = await fetch(`${API_URL}/dashboard`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Dashboard;
  } catch {
    return null;
  }
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
  const dashboard = await getDashboard();
  const recentBooking = dashboard?.recentBookings?.[0];

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f3ea]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171717] text-white">
              <PawIcon />
            </span>
            <span className="text-xl font-bold">Calli Pet</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#servicios">Servicios</a>
            <a href="#plataforma">Plataforma</a>
            <a href="#operacion">Operación</a>
          </nav>

          <Link
            className="rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white hover:bg-[#a64b2a]"
            href="/app"
          >
            Abrir plataforma
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div>
          <p className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
            Ecosistema digital para mascotas
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Salud, cuidado y servicios
            <span className="block text-[#a64b2a]">en un solo lugar.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5f5f5f]">
            Administra tutores, mascotas, proveedores, servicios, reservas,
            pagos, evaluaciones, incidentes, expedientes y notificaciones desde
            una misma plataforma.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-[#a64b2a] px-7 py-4 font-semibold text-white hover:bg-[#843a21]"
              href="/app"
            >
              Gestionar operación
            </Link>
            <a
              className="rounded-full border border-black/15 bg-white px-7 py-4 font-semibold"
              href="#plataforma"
            >
              Conocer módulos
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#171717] p-7 text-white shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/55">Actividad reciente</p>
              <h2 className="mt-2 text-3xl font-bold">
                {recentBooking ? recentBooking.petName : 'Operación disponible'}
              </h2>
              <p className="mt-1 text-white/60">
                {recentBooking
                  ? `${recentBooking.serviceName} · ${recentBooking.providerName}`
                  : 'La plataforma está lista para registrar operaciones'}
              </p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a64b2a]">
              <PawIcon />
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Reservas
              </p>
              <p className="mt-2 text-3xl font-bold">
                {dashboard?.bookings ?? 0}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Operaciones registradas
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Ingresos registrados
              </p>
              <p className="mt-2 text-3xl font-bold">
                ${(dashboard?.revenue ?? 0).toLocaleString('es-MX')}
              </p>
              <p className="mt-1 text-sm text-white/60">Pagos confirmados</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span
              className={`h-3 w-3 rounded-full ${
                dashboard ? 'bg-[#7f936d]' : 'bg-[#b42318]'
              }`}
            />
            <span className="font-semibold">
              {dashboard
                ? 'Frontend, API y base de datos conectados'
                : 'La API no está disponible'}
            </span>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            ['Tutores', dashboard?.users ?? 0],
            ['Mascotas', dashboard?.pets ?? 0],
            ['Proveedores', dashboard?.providers ?? 0],
            ['Servicios', dashboard?.services ?? 0],
          ].map(([label, value]) => (
            <article className="rounded-3xl bg-[#faf8f3] p-6" key={label}>
              <p className="text-sm text-[#6b6b6b]">{label}</p>
              <p className="mt-2 text-4xl font-bold">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
        id="servicios"
      >
        <p className="font-bold uppercase tracking-[0.18em] text-[#a64b2a]">
          Servicios
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          Una red para atender las necesidades de cada mascota
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Veterinaria', 'Consultas, seguimiento y expediente digital.'],
            ['Grooming', 'Higiene, estética y cuidado especializado.'],
            ['Paseos', 'Agenda, disponibilidad y seguimiento.'],
            ['Cuidado', 'Atención a domicilio y servicios programados.'],
          ].map(([title, description]) => (
            <article
              className="rounded-3xl border border-black/10 bg-white p-6"
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
      </section>

      <section className="bg-[#171717] py-24 text-white" id="plataforma">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="font-bold uppercase tracking-[0.18em] text-[#d88a67]">
            Plataforma integral
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Módulos conectados con información persistente
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Usuarios y roles',
              'Mascotas y expedientes',
              'Proveedores y servicios',
              'Agenda y reservas',
              'Pagos y comisiones',
              'Evaluaciones',
              'Incidentes',
              'Notificaciones',
            ].map((item, index) => (
              <article
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
                key={item}
              >
                <p className="text-sm font-bold text-[#d88a67]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-4 text-xl font-semibold">{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" id="operacion">
        <div className="rounded-[2rem] bg-[#a64b2a] px-7 py-14 text-white sm:px-12 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-bold uppercase tracking-[0.18em] text-white/70">
              Operación
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
              Administra el ecosistema desde un solo panel
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/75">
              Los formularios y acciones del panel trabajan directamente con
              NestJS y PostgreSQL.
            </p>
          </div>
          <Link
            className="mt-8 inline-flex rounded-full bg-white px-7 py-4 font-semibold text-[#171717] lg:mt-0"
            href="/app"
          >
            Entrar al panel
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white px-5 py-8 text-center text-sm text-[#666666]">
        © 2026 Calli Pet
      </footer>
    </main>
  );
}
