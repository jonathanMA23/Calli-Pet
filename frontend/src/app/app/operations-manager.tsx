'use client';

import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type Section =
  | 'resumen'
  | 'usuarios'
  | 'mascotas'
  | 'proveedores'
  | 'servicios'
  | 'reservas'
  | 'operacion';

interface Dashboard {
  users: number;
  pets: number;
  providers: number;
  services: number;
  bookings: number;
  incidents: number;
  notifications: number;
  revenue: number;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'tutor' | 'provider' | 'admin';
  isActive: boolean;
}

interface Pet {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birthDate: string | null;
  weightKg: number | null;
  notes: string | null;
}

interface Provider {
  id: string;
  ownerUserId: string;
  ownerName: string;
  commercialName: string;
  providerType: string;
  description: string | null;
  verified: boolean;
  ratingAvg: number;
  alcaldia: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  baseDurationMinutes: number;
}

interface ProviderService {
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  homeService: boolean;
}

interface Booking {
  id: string;
  userId: string;
  userName: string;
  petId: string;
  petName: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: string;
  status: string;
  totalAmount: number;
  platformCommission: number;
}

interface Payment {
  id: string;
  bookingId: string;
  paymentProvider: string;
  amount: number;
  commissionAmount: number;
  status: string;
  petName: string;
}

interface Review {
  id: string;
  bookingId: string;
  userName: string;
  providerName: string;
  rating: number;
  comment: string | null;
}

interface Incident {
  id: string;
  bookingId: string;
  reportedByName: string;
  providerName: string;
  severity: string;
  status: string;
  description: string;
}

interface HealthRecord {
  id: string;
  petId: string;
  petName: string;
  providerId: string | null;
  providerName: string | null;
  recordType: string;
  title: string;
  description: string | null;
  occurredOn: string;
  nextDueOn: string | null;
}

interface Notification {
  id: string;
  userId: string;
  userName: string;
  notificationType: string;
  title: string;
  body: string;
  readAt: string | null;
}

async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const body = await response.json();

  if (!response.ok) {
    const detail = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
    throw new Error(detail || `Error ${response.status}`);
  }

  return body as T;
}

function FormShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Input({
  name,
  label,
  type = 'text',
  required = false,
  step,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
        name={name}
        required={required}
        step={step}
        type={type}
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  required = false,
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select
        className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
        name={name}
        required={required}
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      className="rounded-2xl bg-[#171717] px-6 py-3.5 font-semibold text-white hover:bg-[#a64b2a]"
      type="submit"
    >
      {label}
    </button>
  );
}

export function OperationsManager() {
  const [section, setSection] = useState<Section>('resumen');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const [
        dashboardData,
        usersData,
        petsData,
        providersData,
        servicesData,
        providerServicesData,
        bookingsData,
        paymentsData,
        reviewsData,
        incidentsData,
        recordsData,
        notificationsData,
      ] = await Promise.all([
        api<Dashboard>('/dashboard'),
        api<User[]>('/users'),
        api<Pet[]>('/pets'),
        api<Provider[]>('/providers'),
        api<Service[]>('/services'),
        api<ProviderService[]>('/provider-services'),
        api<Booking[]>('/bookings'),
        api<Payment[]>('/payments'),
        api<Review[]>('/reviews'),
        api<Incident[]>('/incidents'),
        api<HealthRecord[]>('/health-records'),
        api<Notification[]>('/notifications'),
      ]);

      setDashboard(dashboardData);
      setUsers(usersData);
      setPets(petsData);
      setProviders(providersData);
      setServices(servicesData);
      setProviderServices(providerServicesData);
      setBookings(bookingsData);
      setPayments(paymentsData);
      setReviews(reviewsData);
      setIncidents(incidentsData);
      setRecords(recordsData);
      setNotifications(notificationsData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible cargar la plataforma',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const tutors = useMemo(
    () => users.filter((user) => user.role === 'tutor' && user.isActive),
    [users],
  );
  const providerUsers = useMemo(
    () => users.filter((user) => user.role === 'provider' && user.isActive),
    [users],
  );

  async function submit(
    event: FormEvent<HTMLFormElement>,
    path: string,
    transform: (form: FormData) => Record<string, unknown>,
    successMessage: string,
  ): Promise<void> {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      await api(path, {
        method: 'POST',
        body: JSON.stringify(transform(form)),
      });
      formElement.reset();
      setMessage(successMessage);
      await loadAll();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible completar la operación',
      );
    }
  }

  async function patch(
    path: string,
    body: Record<string, unknown>,
    successMessage: string,
  ): Promise<void> {
    setMessage('');
    setError('');

    try {
      await api(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setMessage(successMessage);
      await loadAll();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible actualizar',
      );
    }
  }

  async function remove(
    path: string,
    successMessage: string,
  ): Promise<void> {
    if (!window.confirm('¿Confirmas esta acción?')) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await api(path, { method: 'DELETE' });
      setMessage(successMessage);
      await loadAll();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible completar la acción',
      );
    }
  }

  const nav: Array<{ key: Section; label: string }> = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'mascotas', label: 'Mascotas' },
    { key: 'proveedores', label: 'Proveedores' },
    { key: 'servicios', label: 'Servicios' },
    { key: 'reservas', label: 'Reservas' },
    { key: 'operacion', label: 'Operación' },
  ];

  return (
    <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 lg:grid-cols-[240px_1fr] lg:px-8">
      <aside className="h-fit rounded-3xl bg-[#171717] p-4 text-white lg:sticky lg:top-6">
        <p className="px-3 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white/45">
          Panel operativo
        </p>
        <nav className="grid gap-1">
          {nav.map((item) => (
            <button
              className={`rounded-2xl px-4 py-3 text-left font-semibold ${
                section === item.key
                  ? 'bg-[#a64b2a]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              key={item.key}
              onClick={() => setSection(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          className="mt-5 w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold"
          onClick={() => void loadAll()}
          type="button"
        >
          Actualizar información
        </button>
      </aside>

      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-[#a64b2a]">
              Calli Pet
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.03em]">
              Gestión integral
            </h1>
          </div>
          <div className="text-sm text-[#666666]">
            {loading ? 'Actualizando...' : 'Información sincronizada'}
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl bg-[#e8efe2] p-4 font-semibold text-[#44513a]">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl bg-[#fce8e6] p-4 font-semibold text-[#b42318]">
            {error}
          </div>
        )}

        {section === 'resumen' && (
          <div className="mt-8">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Usuarios', dashboard?.users ?? 0],
                ['Mascotas', dashboard?.pets ?? 0],
                ['Proveedores', dashboard?.providers ?? 0],
                ['Servicios', dashboard?.services ?? 0],
                ['Reservas', dashboard?.bookings ?? 0],
                ['Incidentes abiertos', dashboard?.incidents ?? 0],
                ['Notificaciones pendientes', dashboard?.notifications ?? 0],
                [
                  'Ingresos registrados',
                  `$${(dashboard?.revenue ?? 0).toLocaleString('es-MX')}`,
                ],
              ].map(([label, value]) => (
                <article
                  className="rounded-3xl border border-black/10 bg-white p-6"
                  key={label}
                >
                  <p className="text-sm text-[#686868]">{label}</p>
                  <p className="mt-2 text-3xl font-bold">{value}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-black/10 bg-white p-6">
                <h2 className="text-xl font-bold">Flujo operativo</h2>
                <div className="mt-6 grid gap-3">
                  {[
                    '1. Registrar usuarios y roles',
                    '2. Registrar mascotas y proveedores',
                    '3. Publicar servicios y precios',
                    '4. Crear y confirmar reservas',
                    '5. Registrar pagos, evaluaciones e incidentes',
                    '6. Mantener expedientes y notificaciones',
                  ].map((step) => (
                    <div
                      className="rounded-2xl bg-[#faf8f3] px-4 py-3"
                      key={step}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl bg-[#171717] p-6 text-white">
                <h2 className="text-xl font-bold">Estado de módulos</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Usuarios', users.length],
                    ['Mascotas', pets.length],
                    ['Proveedores', providers.length],
                    ['Servicios publicados', providerServices.length],
                    ['Pagos', payments.length],
                    ['Evaluaciones', reviews.length],
                    ['Expedientes', records.length],
                    ['Notificaciones', notifications.length],
                  ].map(([label, value]) => (
                    <div className="rounded-2xl bg-white/10 p-4" key={label}>
                      <p className="text-sm text-white/55">{label}</p>
                      <p className="mt-1 text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        )}

        {section === 'usuarios' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
            <FormShell title="Registrar usuario">
              <form
                className="grid gap-4"
                onSubmit={(event) =>
                  void submit(
                    event,
                    '/users',
                    (form) => ({
                      fullName: String(form.get('fullName')),
                      email: String(form.get('email')),
                      phone: String(form.get('phone') || ''),
                      password: String(form.get('password')),
                      role: String(form.get('role')),
                    }),
                    'Usuario registrado correctamente.',
                  )
                }
              >
                <Input label="Nombre completo" name="fullName" required />
                <Input label="Correo" name="email" required type="email" />
                <Input label="Teléfono" name="phone" />
                <Input
                  label="Contraseña temporal"
                  name="password"
                  required
                  type="password"
                />
                <Select
                  label="Rol"
                  name="role"
                  options={[
                    { value: 'tutor', label: 'Tutor' },
                    { value: 'provider', label: 'Proveedor' },
                    { value: 'admin', label: 'Administrador' },
                  ]}
                  required
                />
                <SubmitButton label="Registrar usuario" />
              </form>
            </FormShell>

            <div className="grid gap-4">
              {users.map((user) => (
                <article
                  className="rounded-3xl border border-black/10 bg-white p-5"
                  key={user.id}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        {user.role}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">{user.fullName}</h3>
                      <p className="mt-1 text-[#666666]">{user.email}</p>
                    </div>
                    <button
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                        user.isActive
                          ? 'bg-[#fce8e6] text-[#b42318]'
                          : 'bg-[#e8efe2] text-[#44513a]'
                      }`}
                      onClick={() =>
                        void patch(
                          `/users/${user.id}/active`,
                          { active: !user.isActive },
                          'Estado del usuario actualizado.',
                        )
                      }
                      type="button"
                    >
                      {user.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {section === 'mascotas' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
            <FormShell title="Registrar mascota">
              <form
                className="grid gap-4"
                onSubmit={(event) =>
                  void submit(
                    event,
                    '/pets',
                    (form) => ({
                      ownerId: String(form.get('ownerId')),
                      name: String(form.get('name')),
                      species: String(form.get('species')),
                      breed: String(form.get('breed') || ''),
                      sex: String(form.get('sex') || '') || undefined,
                      birthDate:
                        String(form.get('birthDate') || '') || undefined,
                      weightKg: form.get('weightKg')
                        ? Number(form.get('weightKg'))
                        : undefined,
                      notes: String(form.get('notes') || ''),
                    }),
                    'Mascota registrada correctamente.',
                  )
                }
              >
                <Select
                  label="Tutor"
                  name="ownerId"
                  options={tutors.map((user) => ({
                    value: user.id,
                    label: user.fullName,
                  }))}
                  required
                />
                <Input label="Nombre" name="name" required />
                <Select
                  label="Especie"
                  name="species"
                  options={[
                    { value: 'perro', label: 'Perro' },
                    { value: 'gato', label: 'Gato' },
                    { value: 'otro', label: 'Otro' },
                  ]}
                  required
                />
                <Input label="Raza" name="breed" />
                <Select
                  label="Sexo"
                  name="sex"
                  options={[
                    { value: 'F', label: 'Hembra' },
                    { value: 'M', label: 'Macho' },
                  ]}
                />
                <Input
                  label="Fecha de nacimiento"
                  name="birthDate"
                  type="date"
                />
                <Input
                  label="Peso en kg"
                  name="weightKg"
                  step="0.1"
                  type="number"
                />
                <Input label="Notas" name="notes" />
                <SubmitButton label="Registrar mascota" />
              </form>
            </FormShell>

            <div className="grid gap-4 md:grid-cols-2">
              {pets.map((pet) => (
                <article
                  className="rounded-3xl border border-black/10 bg-white p-6"
                  key={pet.id}
                >
                  <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                    {pet.species}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{pet.name}</h3>
                  <p className="mt-1 text-[#666666]">
                    {pet.breed || 'Raza sin especificar'}
                  </p>
                  <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#faf8f3] p-4 text-sm">
                    <div>
                      <dt className="text-[#777777]">Tutor</dt>
                      <dd className="mt-1 font-semibold">{pet.ownerName}</dd>
                    </div>
                    <div>
                      <dt className="text-[#777777]">Peso</dt>
                      <dd className="mt-1 font-semibold">
                        {pet.weightKg ? `${pet.weightKg} kg` : 'Sin dato'}
                      </dd>
                    </div>
                  </dl>
                  <button
                    className="mt-5 w-full rounded-2xl bg-[#b42318] px-4 py-3 text-sm font-semibold text-white"
                    onClick={() =>
                      void remove(
                        `/pets/${pet.id}`,
                        'Mascota desactivada.',
                      )
                    }
                    type="button"
                  >
                    Desactivar registro
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {section === 'proveedores' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
            <FormShell title="Registrar proveedor">
              <form
                className="grid gap-4"
                onSubmit={(event) =>
                  void submit(
                    event,
                    '/providers',
                    (form) => ({
                      ownerUserId: String(form.get('ownerUserId')),
                      commercialName: String(form.get('commercialName')),
                      providerType: String(form.get('providerType')),
                      description: String(form.get('description') || ''),
                      alcaldia: String(form.get('alcaldia')),
                    }),
                    'Proveedor registrado correctamente.',
                  )
                }
              >
                <Select
                  label="Cuenta responsable"
                  name="ownerUserId"
                  options={providerUsers.map((user) => ({
                    value: user.id,
                    label: user.fullName,
                  }))}
                  required
                />
                <Input
                  label="Nombre comercial"
                  name="commercialName"
                  required
                />
                <Select
                  label="Tipo"
                  name="providerType"
                  options={[
                    { value: 'veterinaria', label: 'Veterinaria' },
                    { value: 'grooming', label: 'Grooming' },
                    { value: 'paseador', label: 'Paseador' },
                    { value: 'cuidador', label: 'Cuidador' },
                    { value: 'entrenador', label: 'Entrenador' },
                    { value: 'comercio', label: 'Comercio' },
                    { value: 'refugio', label: 'Refugio' },
                    { value: 'transporte', label: 'Transporte' },
                  ]}
                  required
                />
                <Input label="Alcaldía" name="alcaldia" required />
                <Input label="Descripción" name="description" />
                <SubmitButton label="Registrar proveedor" />
              </form>
            </FormShell>

            <div className="grid gap-4 md:grid-cols-2">
              {providers.map((provider) => (
                <article
                  className="rounded-3xl border border-black/10 bg-white p-6"
                  key={provider.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        {provider.providerType}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold">
                        {provider.commercialName}
                      </h3>
                      <p className="mt-1 text-[#666666]">
                        {provider.alcaldia}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        provider.verified
                          ? 'bg-[#e8efe2] text-[#44513a]'
                          : 'bg-[#fff1d6] text-[#8a5b08]'
                      }`}
                    >
                      {provider.verified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="mt-4 leading-7 text-[#666666]">
                    {provider.description || 'Sin descripción'}
                  </p>
                  <div className="mt-5 flex gap-3">
                    {!provider.verified && (
                      <button
                        className="flex-1 rounded-2xl bg-[#5e6b4f] px-4 py-3 text-sm font-semibold text-white"
                        onClick={() =>
                          void patch(
                            `/providers/${provider.id}`,
                            { verified: true },
                            'Proveedor verificado.',
                          )
                        }
                        type="button"
                      >
                        Verificar
                      </button>
                    )}
                    <button
                      className="flex-1 rounded-2xl bg-[#b42318] px-4 py-3 text-sm font-semibold text-white"
                      onClick={() =>
                        void remove(
                          `/providers/${provider.id}`,
                          'Proveedor desactivado.',
                        )
                      }
                      type="button"
                    >
                      Desactivar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {section === 'servicios' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <FormShell title="Crear servicio">
              <form
                className="grid gap-4"
                onSubmit={(event) =>
                  void submit(
                    event,
                    '/services',
                    (form) => ({
                      name: String(form.get('name')),
                      category: String(form.get('category')),
                      description: String(form.get('description') || ''),
                      baseDurationMinutes: Number(
                        form.get('baseDurationMinutes'),
                      ),
                    }),
                    'Servicio creado correctamente.',
                  )
                }
              >
                <Input label="Nombre" name="name" required />
                <Input label="Categoría" name="category" required />
                <Input label="Descripción" name="description" />
                <Input
                  label="Duración base en minutos"
                  name="baseDurationMinutes"
                  required
                  type="number"
                />
                <SubmitButton label="Crear servicio" />
              </form>
            </FormShell>

            <FormShell title="Publicar servicio de un proveedor">
              <form
                className="grid gap-4"
                onSubmit={(event) =>
                  void submit(
                    event,
                    '/provider-services',
                    (form) => ({
                      providerId: String(form.get('providerId')),
                      serviceId: String(form.get('serviceId')),
                      price: Number(form.get('price')),
                      durationMinutes: Number(form.get('durationMinutes')),
                      homeService: form.get('homeService') === 'on',
                    }),
                    'Servicio publicado para el proveedor.',
                  )
                }
              >
                <Select
                  label="Proveedor"
                  name="providerId"
                  options={providers.map((provider) => ({
                    value: provider.id,
                    label: provider.commercialName,
                  }))}
                  required
                />
                <Select
                  label="Servicio"
                  name="serviceId"
                  options={services.map((service) => ({
                    value: service.id,
                    label: service.name,
                  }))}
                  required
                />
                <Input
                  label="Precio"
                  name="price"
                  required
                  step="0.01"
                  type="number"
                />
                <Input
                  label="Duración"
                  name="durationMinutes"
                  required
                  type="number"
                />
                <label className="flex items-center gap-3 rounded-2xl bg-[#faf8f3] p-4 text-sm font-semibold">
                  <input name="homeService" type="checkbox" />
                  Servicio a domicilio
                </label>
                <SubmitButton label="Publicar servicio" />
              </form>
            </FormShell>

            <section className="xl:col-span-2">
              <h2 className="text-2xl font-bold">Catálogo activo</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {providerServices.map((item) => (
                  <article
                    className="rounded-3xl border border-black/10 bg-white p-5"
                    key={`${item.providerId}-${item.serviceId}`}
                  >
                    <p className="text-sm text-[#666666]">
                      {item.providerName}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">
                      {item.serviceName}
                    </h3>
                    <p className="mt-4 text-3xl font-bold text-[#a64b2a]">
                      ${item.price.toLocaleString('es-MX')}
                    </p>
                    <p className="mt-1 text-sm text-[#666666]">
                      {item.durationMinutes} minutos
                      {item.homeService ? ' · A domicilio' : ''}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {section === 'reservas' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
            <FormShell title="Crear reserva">
              <form
                className="grid gap-4"
                onSubmit={(event) =>
                  void submit(
                    event,
                    '/bookings',
                    (form) => ({
                      userId: String(form.get('userId')),
                      petId: String(form.get('petId')),
                      providerId: String(form.get('providerId')),
                      serviceId: String(form.get('serviceId')),
                      scheduledAt: new Date(
                        String(form.get('scheduledAt')),
                      ).toISOString(),
                      totalAmount: Number(form.get('totalAmount')),
                      notes: String(form.get('notes') || ''),
                    }),
                    'Reserva creada correctamente.',
                  )
                }
              >
                <Select
                  label="Tutor"
                  name="userId"
                  options={tutors.map((user) => ({
                    value: user.id,
                    label: user.fullName,
                  }))}
                  required
                />
                <Select
                  label="Mascota"
                  name="petId"
                  options={pets.map((pet) => ({
                    value: pet.id,
                    label: `${pet.name} · ${pet.ownerName}`,
                  }))}
                  required
                />
                <Select
                  label="Proveedor"
                  name="providerId"
                  options={providers.map((provider) => ({
                    value: provider.id,
                    label: provider.commercialName,
                  }))}
                  required
                />
                <Select
                  label="Servicio"
                  name="serviceId"
                  options={services.map((service) => ({
                    value: service.id,
                    label: service.name,
                  }))}
                  required
                />
                <Input
                  label="Fecha y hora"
                  name="scheduledAt"
                  required
                  type="datetime-local"
                />
                <Input
                  label="Importe"
                  name="totalAmount"
                  required
                  step="0.01"
                  type="number"
                />
                <Input label="Notas" name="notes" />
                <SubmitButton label="Crear reserva" />
              </form>
            </FormShell>

            <div className="grid gap-4">
              {bookings.map((booking) => (
                <article
                  className="rounded-3xl border border-black/10 bg-white p-6"
                  key={booking.id}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        {booking.status}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">
                        {booking.petName} · {booking.serviceName}
                      </h3>
                      <p className="mt-1 text-[#666666]">
                        {booking.providerName} · {booking.userName}
                      </p>
                      <p className="mt-3 text-sm text-[#666666]">
                        {new Date(booking.scheduledAt).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${booking.totalAmount.toLocaleString('es-MX')}
                      </p>
                      <p className="text-sm text-[#666666]">
                        Comisión: $
                        {booking.platformCommission.toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['pendiente', 'confirmada', 'completada', 'cancelada'].map(
                      (status) => (
                        <button
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            booking.status === status
                              ? 'bg-[#171717] text-white'
                              : 'border border-black/15'
                          }`}
                          key={status}
                          onClick={() =>
                            void patch(
                              `/bookings/${booking.id}/status`,
                              { status },
                              'Estado de la reserva actualizado.',
                            )
                          }
                          type="button"
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {section === 'operacion' && (
          <div className="mt-8 grid gap-8">
            <div className="grid gap-6 xl:grid-cols-2">
              <FormShell title="Registrar pago">
                <form
                  className="grid gap-4"
                  onSubmit={(event) =>
                    void submit(
                      event,
                      '/payments',
                      (form) => ({
                        bookingId: String(form.get('bookingId')),
                        paymentProvider: String(
                          form.get('paymentProvider'),
                        ),
                        externalReference: String(
                          form.get('externalReference') || '',
                        ),
                        amount: Number(form.get('amount')),
                        commissionAmount: Number(
                          form.get('commissionAmount'),
                        ),
                        status: String(form.get('status')),
                      }),
                      'Pago registrado correctamente.',
                    )
                  }
                >
                  <Select
                    label="Reserva"
                    name="bookingId"
                    options={bookings.map((booking) => ({
                      value: booking.id,
                      label: `${booking.petName} · ${booking.serviceName}`,
                    }))}
                    required
                  />
                  <Input
                    label="Proveedor de pago"
                    name="paymentProvider"
                    required
                  />
                  <Input
                    label="Referencia externa"
                    name="externalReference"
                  />
                  <Input
                    label="Importe"
                    name="amount"
                    required
                    step="0.01"
                    type="number"
                  />
                  <Input
                    label="Comisión"
                    name="commissionAmount"
                    required
                    step="0.01"
                    type="number"
                  />
                  <Select
                    label="Estado"
                    name="status"
                    options={[
                      { value: 'pendiente', label: 'Pendiente' },
                      { value: 'pagado', label: 'Pagado' },
                      { value: 'reembolsado', label: 'Reembolsado' },
                      { value: 'fallido', label: 'Fallido' },
                    ]}
                    required
                  />
                  <SubmitButton label="Registrar pago" />
                </form>
              </FormShell>

              <FormShell title="Registrar evaluación">
                <form
                  className="grid gap-4"
                  onSubmit={(event) =>
                    void submit(
                      event,
                      '/reviews',
                      (form) => ({
                        bookingId: String(form.get('bookingId')),
                        userId: String(form.get('userId')),
                        providerId: String(form.get('providerId')),
                        rating: Number(form.get('rating')),
                        comment: String(form.get('comment') || ''),
                      }),
                      'Evaluación registrada correctamente.',
                    )
                  }
                >
                  <Select
                    label="Reserva completada"
                    name="bookingId"
                    options={bookings
                      .filter((booking) => booking.status === 'completada')
                      .map((booking) => ({
                        value: booking.id,
                        label: `${booking.petName} · ${booking.serviceName}`,
                      }))}
                    required
                  />
                  <Select
                    label="Tutor"
                    name="userId"
                    options={tutors.map((user) => ({
                      value: user.id,
                      label: user.fullName,
                    }))}
                    required
                  />
                  <Select
                    label="Proveedor"
                    name="providerId"
                    options={providers.map((provider) => ({
                      value: provider.id,
                      label: provider.commercialName,
                    }))}
                    required
                  />
                  <Select
                    label="Calificación"
                    name="rating"
                    options={[1, 2, 3, 4, 5].map((rating) => ({
                      value: String(rating),
                      label: `${rating} de 5`,
                    }))}
                    required
                  />
                  <Input label="Comentario" name="comment" />
                  <SubmitButton label="Registrar evaluación" />
                </form>
              </FormShell>

              <FormShell title="Reportar incidente">
                <form
                  className="grid gap-4"
                  onSubmit={(event) =>
                    void submit(
                      event,
                      '/incidents',
                      (form) => ({
                        bookingId: String(form.get('bookingId')),
                        reportedByUserId: String(
                          form.get('reportedByUserId'),
                        ),
                        providerId: String(form.get('providerId')),
                        severity: String(form.get('severity')),
                        description: String(form.get('description')),
                      }),
                      'Incidente registrado correctamente.',
                    )
                  }
                >
                  <Select
                    label="Reserva"
                    name="bookingId"
                    options={bookings.map((booking) => ({
                      value: booking.id,
                      label: `${booking.petName} · ${booking.serviceName}`,
                    }))}
                    required
                  />
                  <Select
                    label="Reportado por"
                    name="reportedByUserId"
                    options={users.map((user) => ({
                      value: user.id,
                      label: user.fullName,
                    }))}
                    required
                  />
                  <Select
                    label="Proveedor"
                    name="providerId"
                    options={providers.map((provider) => ({
                      value: provider.id,
                      label: provider.commercialName,
                    }))}
                    required
                  />
                  <Select
                    label="Severidad"
                    name="severity"
                    options={[
                      { value: 'baja', label: 'Baja' },
                      { value: 'media', label: 'Media' },
                      { value: 'alta', label: 'Alta' },
                      { value: 'critica', label: 'Crítica' },
                    ]}
                    required
                  />
                  <Input
                    label="Descripción"
                    name="description"
                    required
                  />
                  <SubmitButton label="Registrar incidente" />
                </form>
              </FormShell>

              <FormShell title="Agregar expediente">
                <form
                  className="grid gap-4"
                  onSubmit={(event) =>
                    void submit(
                      event,
                      '/health-records',
                      (form) => ({
                        petId: String(form.get('petId')),
                        providerId:
                          String(form.get('providerId') || '') || undefined,
                        recordType: String(form.get('recordType')),
                        title: String(form.get('title')),
                        description: String(form.get('description') || ''),
                        occurredOn: String(form.get('occurredOn')),
                        nextDueOn:
                          String(form.get('nextDueOn') || '') || undefined,
                      }),
                      'Registro agregado al expediente.',
                    )
                  }
                >
                  <Select
                    label="Mascota"
                    name="petId"
                    options={pets.map((pet) => ({
                      value: pet.id,
                      label: pet.name,
                    }))}
                    required
                  />
                  <Select
                    label="Proveedor"
                    name="providerId"
                    options={providers.map((provider) => ({
                      value: provider.id,
                      label: provider.commercialName,
                    }))}
                  />
                  <Input
                    label="Tipo de registro"
                    name="recordType"
                    required
                  />
                  <Input label="Título" name="title" required />
                  <Input label="Descripción" name="description" />
                  <Input
                    label="Fecha del evento"
                    name="occurredOn"
                    required
                    type="date"
                  />
                  <Input
                    label="Próximo seguimiento"
                    name="nextDueOn"
                    type="date"
                  />
                  <SubmitButton label="Guardar en expediente" />
                </form>
              </FormShell>

              <FormShell title="Crear notificación">
                <form
                  className="grid gap-4"
                  onSubmit={(event) =>
                    void submit(
                      event,
                      '/notifications',
                      (form) => ({
                        userId: String(form.get('userId')),
                        notificationType: String(
                          form.get('notificationType'),
                        ),
                        title: String(form.get('title')),
                        body: String(form.get('body')),
                      }),
                      'Notificación creada correctamente.',
                    )
                  }
                >
                  <Select
                    label="Destinatario"
                    name="userId"
                    options={users.map((user) => ({
                      value: user.id,
                      label: user.fullName,
                    }))}
                    required
                  />
                  <Input
                    label="Tipo"
                    name="notificationType"
                    required
                  />
                  <Input label="Título" name="title" required />
                  <Input label="Mensaje" name="body" required />
                  <SubmitButton label="Crear notificación" />
                </form>
              </FormShell>
            </div>

            <section>
              <h2 className="text-2xl font-bold">Seguimiento operativo</h2>
              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <article className="rounded-3xl border border-black/10 bg-white p-6">
                  <h3 className="text-xl font-bold">Pagos</h3>
                  <div className="mt-4 grid gap-3">
                    {payments.map((payment) => (
                      <div
                        className="rounded-2xl bg-[#faf8f3] p-4"
                        key={payment.id}
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <p className="font-semibold">{payment.petName}</p>
                            <p className="text-sm text-[#666666]">
                              {payment.paymentProvider}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              ${payment.amount.toLocaleString('es-MX')}
                            </p>
                            <p className="text-sm text-[#666666]">
                              {payment.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-3xl border border-black/10 bg-white p-6">
                  <h3 className="text-xl font-bold">Evaluaciones</h3>
                  <div className="mt-4 grid gap-3">
                    {reviews.map((review) => (
                      <div
                        className="rounded-2xl bg-[#faf8f3] p-4"
                        key={review.id}
                      >
                        <p className="font-semibold">
                          {review.providerName} · {review.rating}/5
                        </p>
                        <p className="mt-1 text-sm text-[#666666]">
                          {review.comment || 'Sin comentario'}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-3xl border border-black/10 bg-white p-6">
                  <h3 className="text-xl font-bold">Incidentes</h3>
                  <div className="mt-4 grid gap-3">
                    {incidents.map((incident) => (
                      <div
                        className="rounded-2xl bg-[#faf8f3] p-4"
                        key={incident.id}
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {incident.providerName}
                            </p>
                            <p className="mt-1 text-sm text-[#666666]">
                              {incident.description}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#b42318]">
                            {incident.severity}
                          </span>
                        </div>
                        {incident.status !== 'cerrado' && (
                          <button
                            className="mt-3 rounded-full bg-[#171717] px-4 py-2 text-sm font-semibold text-white"
                            onClick={() =>
                              void patch(
                                `/incidents/${incident.id}/status`,
                                { status: 'cerrado' },
                                'Incidente cerrado.',
                              )
                            }
                            type="button"
                          >
                            Cerrar incidente
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-3xl border border-black/10 bg-white p-6">
                  <h3 className="text-xl font-bold">Expedientes</h3>
                  <div className="mt-4 grid gap-3">
                    {records.map((record) => (
                      <div
                        className="rounded-2xl bg-[#faf8f3] p-4"
                        key={record.id}
                      >
                        <p className="font-semibold">
                          {record.petName} · {record.title}
                        </p>
                        <p className="mt-1 text-sm text-[#666666]">
                          {record.recordType} · {record.occurredOn}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-3xl border border-black/10 bg-white p-6 xl:col-span-2">
                  <h3 className="text-xl font-bold">Notificaciones</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {notifications.map((notification) => (
                      <div
                        className="rounded-2xl bg-[#faf8f3] p-4"
                        key={notification.id}
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-[#666666]">
                              {notification.userName} · {notification.body}
                            </p>
                          </div>
                          {!notification.readAt && (
                            <button
                              className="h-fit rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold"
                              onClick={() =>
                                void patch(
                                  `/notifications/${notification.id}/read`,
                                  {},
                                  'Notificación marcada como leída.',
                                )
                              }
                              type="button"
                            >
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
