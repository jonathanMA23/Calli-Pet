import Link from "next/link";
import type { ReactNode } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function apiIsOnline(): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });

    return response.ok;
  } catch {
    return false;
  }
}

function PawIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.4 10.2c1.3 0 2.3-1.4 2.3-3.1S9.7 4 8.4 4 6.1 5.4 6.1 7.1s1 3.1 2.3 3.1Zm7.2 0c1.3 0 2.3-1.4 2.3-3.1S16.9 4 15.6 4s-2.3 1.4-2.3 3.1 1 3.1 2.3 3.1ZM4.7 14.6c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5Zm14.6 0c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5ZM12 11.5c-3.6 0-6.5 2.6-6.5 5.8 0 1.8 1.3 2.7 2.8 2.7 1.3 0 2.4-.8 3.7-.8s2.4.8 3.7.8c1.5 0 2.8-.9 2.8-2.7 0-3.2-2.9-5.8-6.5-5.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ServiceCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="group rounded-3xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0dfd3] text-[#a64b2a]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 leading-7 text-[#666666]">{description}</p>
      <a
        className="mt-5 inline-flex items-center gap-2 font-semibold text-[#a64b2a]"
        href="#buscar"
      >
        Explorar
        <ArrowIcon />
      </a>
    </article>
  );
}

export default async function Home() {
  const apiOnline = await apiIsOnline();

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f3ea]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171717] text-white">
              <PawIcon className="h-6 w-6" />
            </span>
            <span className="text-xl font-bold tracking-tight">Calli Pet</span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-8 text-sm font-medium md:flex"
          >
            <a className="transition hover:text-[#a64b2a]" href="#servicios">
              Servicios
            </a>
            <a className="transition hover:text-[#a64b2a]" href="#como-funciona">
              Cómo funciona
            </a>
            <a className="transition hover:text-[#a64b2a]" href="#confianza">
              Confianza
            </a>
            <a className="transition hover:text-[#a64b2a]" href="#proveedores">
              Para proveedores
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              className="hidden rounded-full px-5 py-2.5 text-sm font-semibold transition hover:bg-black/5 sm:inline-flex"
              href="/login"
            >
              Iniciar sesión
            </Link>
            <Link
              className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a64b2a]"
              href="/registro"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <section className="overflow-hidden">
        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#5e6b4f]"
              />
              Bienestar, salud y servicios en un solo lugar
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              El cuidado que tu mascota merece,{" "}
              <span className="text-[#a64b2a]">cerca de ti.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5e5e5e]">
              Encuentra profesionales verificados, agenda servicios, administra
              el expediente de tu mascota y da seguimiento desde una sola
              plataforma.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-7 py-4 font-semibold text-white transition hover:bg-[#a64b2a]"
                href="#buscar"
              >
                Buscar un servicio
                <ArrowIcon />
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-7 py-4 font-semibold transition hover:border-black/30"
                href="#como-funciona"
              >
                Conocer Calli Pet
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#5e5e5e]">
              <span className="inline-flex items-center gap-2">
                <ShieldIcon />
                Proveedores verificados
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-[#a64b2a]">4.8/5</span>
                Evaluación de ejemplo
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-16 top-12 h-40 w-40 rounded-full bg-[#a64b2a]/15 blur-3xl" />
            <div className="absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-[#5e6b4f]/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-black/10 bg-white p-5 shadow-2xl shadow-black/10 sm:p-7">
              <div className="rounded-[1.5rem] bg-[#171717] p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/60">Mi mascota</p>
                    <h2 className="mt-1 text-3xl font-bold">Luna</h2>
                    <p className="mt-1 text-white/60">Mestiza · 4 años</p>
                  </div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a64b2a]">
                    <PawIcon className="h-8 w-8" />
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-white/50">
                      Próxima cita
                    </p>
                    <p className="mt-2 font-semibold">Consulta general</p>
                    <p className="mt-1 text-sm text-white/60">15 de junio</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-white/50">
                      Expediente
                    </p>
                    <p className="mt-2 font-semibold">Actualizado</p>
                    <p className="mt-1 text-sm text-white/60">Vacunas vigentes</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef1e9] text-[#5e6b4f]">
                      <ShieldIcon />
                    </span>
                    <div>
                      <p className="text-sm text-[#666666]">Proveedor</p>
                      <p className="font-semibold">Verificado</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 p-4">
                  <p className="text-sm text-[#666666]">Estado de la API</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${
                        apiOnline ? "bg-[#5e6b4f]" : "bg-[#b42318]"
                      }`}
                    />
                    {apiOnline ? "Conectada" : "Sin conexión"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-black/10 bg-white py-8"
        id="buscar"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
                Servicio
              </span>
              <select
                className="mt-1 w-full bg-transparent font-semibold outline-none"
                defaultValue=""
              >
                <option disabled value="">
                  ¿Qué necesitas?
                </option>
                <option>Consulta veterinaria</option>
                <option>Grooming</option>
                <option>Paseo</option>
                <option>Cuidado a domicilio</option>
              </select>
            </label>

            <label className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777777]">
                <MapPinIcon />
                Ubicación
              </span>
              <input
                className="mt-1 w-full bg-transparent font-semibold outline-none"
                placeholder="Alcaldía o código postal"
                type="text"
              />
            </label>

            <label className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777777]">
                <CalendarIcon />
                Fecha
              </span>
              <input
                className="mt-1 w-full bg-transparent font-semibold outline-none"
                type="date"
              />
            </label>

            <button
              className="rounded-2xl bg-[#a64b2a] px-7 py-4 font-semibold text-white transition hover:bg-[#873b22]"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" id="servicios">
        <div className="max-w-2xl">
          <p className="font-semibold uppercase tracking-[0.18em] text-[#a64b2a]">
            Servicios
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Todo lo que necesitas para su bienestar
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#666666]">
            Comienza con las categorías esenciales del producto mínimo viable.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <ServiceCard
            description="Atención preventiva, seguimiento y profesionales cercanos."
            icon={<span className="text-xl font-bold">V</span>}
            title="Veterinaria"
          />
          <ServiceCard
            description="Higiene, baño, cepillado y cuidado de su apariencia."
            icon={<span className="text-xl font-bold">G</span>}
            title="Grooming"
          />
          <ServiceCard
            description="Paseos programados con seguimiento y evidencia."
            icon={<span className="text-xl font-bold">P</span>}
            title="Paseos"
          />
          <ServiceCard
            description="Visitas y acompañamiento confiable dentro de su hogar."
            icon={<PawIcon />}
            title="Cuidado"
          />
        </div>
      </section>

      <section className="bg-[#171717] py-24 text-white" id="confianza">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="font-semibold uppercase tracking-[0.18em] text-[#d88a67]">
              Confianza
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Información clara antes, durante y después del servicio
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["01", "Perfiles verificados", "Documentos y datos revisados antes de publicar."],
              ["02", "Precios transparentes", "Resumen del servicio antes de confirmar."],
              ["03", "Seguimiento", "Estados, recordatorios y evidencia en un mismo lugar."],
              ["04", "Soporte", "Registro y atención de incidentes con trazabilidad."],
            ].map(([number, title, text]) => (
              <article
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
                key={number}
              >
                <p className="text-sm font-bold text-[#d88a67]">{number}</p>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-white/60">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
        id="como-funciona"
      >
        <div className="text-center">
          <p className="font-semibold uppercase tracking-[0.18em] text-[#a64b2a]">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Tres pasos para cuidar mejor
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            ["1", "Busca", "Selecciona el servicio, ubicación y fecha que necesitas."],
            ["2", "Reserva", "Compara perfiles, revisa disponibilidad y confirma."],
            ["3", "Da seguimiento", "Consulta estados, historial y evaluaciones."],
          ].map(([number, title, text]) => (
            <article className="text-center" key={number}>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a64b2a] text-xl font-bold text-white">
                {number}
              </span>
              <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
              <p className="mx-auto mt-3 max-w-sm leading-7 text-[#666666]">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 lg:px-8" id="proveedores">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#a64b2a] px-6 py-14 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl">
            <p className="font-semibold uppercase tracking-[0.18em] text-white/70">
              Para proveedores
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
              Haz crecer tu servicio dentro de Calli Pet
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/75">
              Administra agenda, disponibilidad, reputación y reservaciones desde
              un solo panel.
            </p>
          </div>
          <Link
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-[#171717] transition hover:bg-[#f7f3ea] lg:mt-0"
            href="/registro?tipo=proveedor"
          >
            Registrar mi servicio
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
          <div>
            <Link className="flex items-center gap-3" href="/">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171717] text-white">
                <PawIcon className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold">Calli Pet</span>
            </Link>
            <p className="mt-4 max-w-sm leading-7 text-[#666666]">
              Ecosistema digital de bienestar, salud y servicios para mascotas.
            </p>
          </div>

          <div>
            <h2 className="font-semibold">Plataforma</h2>
            <div className="mt-4 grid gap-3 text-[#666666]">
              <a href="#servicios">Servicios</a>
              <a href="#como-funciona">Cómo funciona</a>
              <a href="#proveedores">Para proveedores</a>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Legal y ayuda</h2>
            <div className="mt-4 grid gap-3 text-[#666666]">
              <Link href="/legal/privacidad">Aviso de privacidad</Link>
              <Link href="/legal/terminos">Términos y condiciones</Link>
              <Link href="/ayuda">Centro de ayuda</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 px-5 py-5 text-center text-sm text-[#777777]">
          © 2026 Calli Pet. Proyecto académico.
        </div>
      </footer>
    </main>
  );
}
