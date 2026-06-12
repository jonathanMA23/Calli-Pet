'use client';

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const CURRENT_USER_ID = process.env.NEXT_PUBLIC_CURRENT_USER_ID ?? '';

type Section =
  | 'inicio'
  | 'mascotas'
  | 'servicios'
  | 'reservas'
  | 'adopcion'
  | 'cuenta';

interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
}

interface Pet {
  id: string;
  name: string;
  species: 'perro' | 'gato' | 'otro';
  breed: string | null;
  sex: 'M' | 'F' | null;
  birthDate: string | null;
  weightKg: number | null;
  notes: string | null;
}

interface Offering {
  providerId: string;
  providerName: string;
  providerType: string;
  alcaldia: string;
  ratingAvg: number;
  serviceId: string;
  serviceName: string;
  category: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  homeService: boolean;
}

interface Booking {
  id: string;
  petId: string;
  petName: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: string;
  status: string;
  totalAmount: number;
  notes: string | null;
}

interface AdoptionListing {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: 'M' | 'F' | null;
  ageMonths: number | null;
  size: string | null;
  description: string | null;
  shelterName: string;
  alcaldia: string;
  imageUrl: string | null;
  status: string;
}

interface AdoptionApplication {
  id: string;
  listingId: string;
  petName: string;
  species: string;
  shelterName: string;
  message: string | null;
  housingType: string | null;
  hasOtherPets: boolean;
  phone: string | null;
  status: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  notificationType: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
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
  fileUrl: string | null;
}

interface HomeData {
  pets: number;
  bookings: number;
  unreadNotifications: number;
  adoptionListings: number;
  services: number;
  nextBooking: Booking | null;
}

interface PetDraft {
  id: string | null;
  name: string;
  species: 'perro' | 'gato' | 'otro';
  breed: string;
  sex: '' | 'M' | 'F';
  birthDate: string;
  weightKg: string;
  notes: string;
}

const emptyPetDraft: PetDraft = {
  id: null,
  name: '',
  species: 'perro',
  breed: '',
  sex: '',
  birthDate: '',
  weightKg: '',
  notes: '',
};

async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };

  if (CURRENT_USER_ID) {
    (headers as Record<string, string>)['x-calli-user-id'] =
      CURRENT_USER_ID;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
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
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold">{title}</h3>
      {description && (
        <p className="mt-2 leading-7 text-[#666666]">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  'rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada',
    enviada: 'Enviada',
    en_revision: 'En revisión',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
  };
  return labels[status] ?? status;
}

function monthAge(ageMonths: number | null): string {
  if (ageMonths === null) {
    return 'Edad no especificada';
  }

  if (ageMonths < 12) {
    return `${ageMonths} meses`;
  }

  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  return months ? `${years} años y ${months} meses` : `${years} años`;
}

export function UserPortal() {
  const [section, setSection] = useState<Section>('inicio');
  const [home, setHome] = useState<HomeData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Offering[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adoptions, setAdoptions] = useState<AdoptionListing[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [petDraft, setPetDraft] = useState<PetDraft>(emptyPetDraft);
  const [selectedOffering, setSelectedOffering] =
    useState<Offering | null>(null);
  const [selectedAdoption, setSelectedAdoption] =
    useState<AdoptionListing | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState('todas');

  const loadAll = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const [
        homeData,
        profileData,
        petsData,
        servicesData,
        bookingsData,
        adoptionsData,
        applicationsData,
        notificationsData,
        recordsData,
      ] = await Promise.all([
        api<HomeData>('/portal/home'),
        api<Profile>('/portal/profile'),
        api<Pet[]>('/portal/pets'),
        api<Offering[]>('/portal/services'),
        api<Booking[]>('/portal/bookings'),
        api<AdoptionListing[]>('/portal/adoptions'),
        api<AdoptionApplication[]>('/portal/adoption-applications'),
        api<NotificationItem[]>('/portal/notifications'),
        api<HealthRecord[]>('/portal/health-records'),
      ]);

      setHome(homeData);
      setProfile(profileData);
      setPets(petsData);
      setServices(servicesData);
      setBookings(bookingsData);
      setAdoptions(adoptionsData);
      setApplications(applicationsData);
      setNotifications(notificationsData);
      setRecords(recordsData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible cargar tu cuenta',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(services.map((service) => service.category)),
      ).sort(),
    [services],
  );

  const filteredServices = useMemo(() => {
    const search = serviceSearch.trim().toLowerCase();

    return services.filter((service) => {
      const categoryMatches =
        serviceCategory === 'todas' ||
        service.category === serviceCategory;

      const searchMatches =
        !search ||
        service.serviceName.toLowerCase().includes(search) ||
        service.providerName.toLowerCase().includes(search) ||
        service.alcaldia.toLowerCase().includes(search);

      return categoryMatches && searchMatches;
    });
  }, [services, serviceSearch, serviceCategory]);

  const upcomingBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === 'pendiente' ||
          booking.status === 'confirmada',
      ),
    [bookings],
  );

  async function runAction(
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> {
    setMessage('');
    setError('');

    try {
      await action();
      setMessage(successMessage);
      await loadAll();
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible completar la operación',
      );
      return false;
    }
  }

  function editPet(pet: Pet): void {
    setPetDraft({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? '',
      sex: pet.sex ?? '',
      birthDate: pet.birthDate ?? '',
      weightKg: pet.weightKg?.toString() ?? '',
      notes: pet.notes ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitPet(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const body = {
      name: petDraft.name.trim(),
      species: petDraft.species,
      breed: petDraft.breed.trim() || undefined,
      sex: petDraft.sex || undefined,
      birthDate: petDraft.birthDate || undefined,
      weightKg: petDraft.weightKg
        ? Number(petDraft.weightKg)
        : undefined,
      notes: petDraft.notes.trim() || undefined,
    };

    const editing = Boolean(petDraft.id);

    const success = await runAction(
      () =>
        api(
          editing
            ? `/portal/pets/${petDraft.id}`
            : '/portal/pets',
          {
            method: editing ? 'PATCH' : 'POST',
            body: JSON.stringify(body),
          },
        ),
      editing
        ? 'Los datos de tu mascota fueron actualizados.'
        : 'Tu mascota fue agregada a la cuenta.',
    );

    if (success) {
      setPetDraft(emptyPetDraft);
    }
  }

  async function submitBooking(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!selectedOffering) {
      setError('Selecciona un servicio para continuar');
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const petId = String(form.get('petId') || '');
    const scheduledAt = String(form.get('scheduledAt') || '');

    if (!petId || !scheduledAt) {
      setError('Selecciona una mascota y una fecha');
      return;
    }

    const success = await runAction(
      () =>
        api('/portal/bookings', {
          method: 'POST',
          body: JSON.stringify({
            petId,
            providerId: selectedOffering.providerId,
            serviceId: selectedOffering.serviceId,
            scheduledAt: new Date(scheduledAt).toISOString(),
            notes: String(form.get('notes') || '') || undefined,
          }),
        }),
      'Tu reserva fue enviada al proveedor.',
    );

    if (success) {
      formElement.reset();
      setSelectedOffering(null);
      setSection('reservas');
    }
  }

  async function submitAdoption(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!selectedAdoption) {
      setError('Selecciona una mascota en adopción');
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const success = await runAction(
      () =>
        api(`/portal/adoptions/${selectedAdoption.id}/apply`, {
          method: 'POST',
          body: JSON.stringify({
            message: String(form.get('message') || '') || undefined,
            housingType:
              String(form.get('housingType') || '') || undefined,
            hasOtherPets: form.get('hasOtherPets') === 'on',
            phone: String(form.get('phone') || '') || undefined,
          }),
        }),
      'Tu solicitud de adopción fue enviada.',
    );

    if (success) {
      formElement.reset();
      setSelectedAdoption(null);
    }
  }

  async function submitProfile(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await runAction(
      () =>
        api('/portal/profile', {
          method: 'PATCH',
          body: JSON.stringify({
            fullName: String(form.get('fullName') || ''),
            phone: String(form.get('phone') || ''),
          }),
        }),
      'Tu información fue actualizada.',
    );
  }

  const navigation: Array<{ key: Section; label: string }> = [
    { key: 'inicio', label: 'Inicio' },
    { key: 'mascotas', label: 'Mis mascotas' },
    { key: 'servicios', label: 'Servicios' },
    { key: 'reservas', label: 'Mis reservas' },
    { key: 'adopcion', label: 'Adopción' },
    { key: 'cuenta', label: 'Mi cuenta' },
  ];

  return (
    <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 lg:grid-cols-[240px_1fr] lg:px-8">
      <aside className="h-fit rounded-3xl bg-[#171717] p-4 text-white lg:sticky lg:top-6">
        <div className="px-3 py-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/45">
            Mi Calli Pet
          </p>
          <p className="mt-2 text-lg font-bold">
            {profile?.fullName ?? 'Mi cuenta'}
          </p>
        </div>

        <nav className="grid gap-1">
          {navigation.map((item) => (
            <button
              className={`rounded-2xl px-4 py-3 text-left font-semibold ${
                section === item.key
                  ? 'bg-[#a64b2a]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              key={item.key}
              onClick={() => {
                setSection(item.key);
                setMessage('');
                setError('');
              }}
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
              {section === 'inicio' && 'Hola, bienvenido'}
              {section === 'mascotas' && 'Mis mascotas'}
              {section === 'servicios' && 'Encuentra un servicio'}
              {section === 'reservas' && 'Mis reservas'}
              {section === 'adopcion' && 'Adopción responsable'}
              {section === 'cuenta' && 'Mi cuenta'}
            </h1>
          </div>
          <div className="text-sm text-[#666666]">
            {loading ? 'Sincronizando...' : 'Información sincronizada'}
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

        {section === 'inicio' && (
          <div className="mt-8">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Mis mascotas', home?.pets ?? 0],
                ['Reservas', home?.bookings ?? 0],
                ['Servicios', home?.services ?? 0],
                ['Avisos pendientes', home?.unreadNotifications ?? 0],
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

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-3xl bg-[#171717] p-7 text-white">
                <p className="text-sm text-white/50">Próxima atención</p>
                {home?.nextBooking ? (
                  <>
                    <h2 className="mt-2 text-3xl font-bold">
                      {home.nextBooking.petName}
                    </h2>
                    <p className="mt-2 text-white/65">
                      {home.nextBooking.serviceName} ·{' '}
                      {home.nextBooking.providerName}
                    </p>
                    <p className="mt-6 text-lg font-semibold">
                      {new Date(
                        home.nextBooking.scheduledAt,
                      ).toLocaleString('es-MX')}
                    </p>
                    <span className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                      {statusLabel(home.nextBooking.status)}
                    </span>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-3xl font-bold">
                      Agenda cuando lo necesites
                    </h2>
                    <p className="mt-3 max-w-lg leading-7 text-white/65">
                      Explora servicios verificados y reserva para cualquiera
                      de tus mascotas.
                    </p>
                    <button
                      className="mt-6 rounded-full bg-[#a64b2a] px-6 py-3 font-semibold"
                      onClick={() => setSection('servicios')}
                      type="button"
                    >
                      Ver servicios
                    </button>
                  </>
                )}
              </article>

              <article className="rounded-3xl border border-black/10 bg-white p-6">
                <h2 className="text-xl font-bold">Accesos rápidos</h2>
                <div className="mt-5 grid gap-3">
                  {(
                    [
                      {
                        label: 'Agregar una mascota',
                        target: 'mascotas',
                      },
                      {
                        label: 'Reservar un servicio',
                        target: 'servicios',
                      },
                      {
                        label: 'Consultar adopciones',
                        target: 'adopcion',
                      },
                      {
                        label: 'Revisar notificaciones',
                        target: 'cuenta',
                      },
                    ] satisfies Array<{
                      label: string;
                      target: Section;
                    }>
                  ).map(({ label, target }) => (
                    <button
                      className="rounded-2xl bg-[#faf8f3] px-4 py-4 text-left font-semibold"
                      key={label}
                      onClick={() => setSection(target)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            </div>

            {upcomingBookings.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-bold">Reservas próximas</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {upcomingBookings.slice(0, 4).map((booking) => (
                    <article
                      className="rounded-3xl border border-black/10 bg-white p-5"
                      key={booking.id}
                    >
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        {statusLabel(booking.status)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold">
                        {booking.petName} · {booking.serviceName}
                      </h3>
                      <p className="mt-1 text-[#666666]">
                        {booking.providerName}
                      </p>
                      <p className="mt-4 font-semibold">
                        {new Date(booking.scheduledAt).toLocaleString(
                          'es-MX',
                        )}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {section === 'mascotas' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
            <FormShell
              title={
                petDraft.id ? 'Editar mascota' : 'Agregar una mascota'
              }
              description="La mascota quedará asociada únicamente a tu cuenta."
            >
              <form className="grid gap-4" onSubmit={submitPet}>
                <Field label="Nombre">
                  <input
                    className={inputClass}
                    onChange={(event) =>
                      setPetDraft((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    value={petDraft.name}
                  />
                </Field>

                <Field label="Especie">
                  <select
                    className={inputClass}
                    onChange={(event) =>
                      setPetDraft((current) => ({
                        ...current,
                        species: event.target.value as PetDraft['species'],
                      }))
                    }
                    value={petDraft.species}
                  >
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>

                <Field label="Raza">
                  <input
                    className={inputClass}
                    onChange={(event) =>
                      setPetDraft((current) => ({
                        ...current,
                        breed: event.target.value,
                      }))
                    }
                    value={petDraft.breed}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sexo">
                    <select
                      className={inputClass}
                      onChange={(event) =>
                        setPetDraft((current) => ({
                          ...current,
                          sex: event.target.value as PetDraft['sex'],
                        }))
                      }
                      value={petDraft.sex}
                    >
                      <option value="">Sin especificar</option>
                      <option value="F">Hembra</option>
                      <option value="M">Macho</option>
                    </select>
                  </Field>

                  <Field label="Peso en kg">
                    <input
                      className={inputClass}
                      min="0.1"
                      onChange={(event) =>
                        setPetDraft((current) => ({
                          ...current,
                          weightKg: event.target.value,
                        }))
                      }
                      step="0.1"
                      type="number"
                      value={petDraft.weightKg}
                    />
                  </Field>
                </div>

                <Field label="Fecha de nacimiento">
                  <input
                    className={inputClass}
                    onChange={(event) =>
                      setPetDraft((current) => ({
                        ...current,
                        birthDate: event.target.value,
                      }))
                    }
                    type="date"
                    value={petDraft.birthDate}
                  />
                </Field>

                <Field label="Notas">
                  <textarea
                    className={`${inputClass} min-h-24`}
                    onChange={(event) =>
                      setPetDraft((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    value={petDraft.notes}
                  />
                </Field>

                <button
                  className="rounded-2xl bg-[#171717] px-6 py-4 font-semibold text-white hover:bg-[#a64b2a]"
                  type="submit"
                >
                  {petDraft.id ? 'Guardar cambios' : 'Agregar mascota'}
                </button>

                {petDraft.id && (
                  <button
                    className="rounded-2xl border border-black/15 px-6 py-3 font-semibold"
                    onClick={() => setPetDraft(emptyPetDraft)}
                    type="button"
                  >
                    Cancelar edición
                  </button>
                )}
              </form>
            </FormShell>

            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Tus mascotas</h2>
                  <p className="mt-2 text-[#666666]">
                    Aquí solamente se muestran los perfiles de tu cuenta.
                  </p>
                </div>
              </div>

              {pets.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center text-[#666666]">
                  Agrega tu primera mascota para comenzar.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
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
                          <dt className="text-[#777777]">Sexo</dt>
                          <dd className="mt-1 font-semibold">
                            {pet.sex === 'F'
                              ? 'Hembra'
                              : pet.sex === 'M'
                                ? 'Macho'
                                : 'Sin dato'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#777777]">Peso</dt>
                          <dd className="mt-1 font-semibold">
                            {pet.weightKg
                              ? `${pet.weightKg} kg`
                              : 'Sin dato'}
                          </dd>
                        </div>
                      </dl>

                      {pet.notes && (
                        <p className="mt-4 leading-7 text-[#666666]">
                          {pet.notes}
                        </p>
                      )}

                      <div className="mt-5 flex gap-3">
                        <button
                          className="flex-1 rounded-2xl border border-black/15 px-4 py-3 text-sm font-semibold"
                          onClick={() => editPet(pet)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="flex-1 rounded-2xl bg-[#b42318] px-4 py-3 text-sm font-semibold text-white"
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Deseas retirar a ${pet.name} de tu cuenta?`,
                              )
                            ) {
                              void runAction(
                                () =>
                                  api(`/portal/pets/${pet.id}`, {
                                    method: 'DELETE',
                                  }),
                                'La mascota fue retirada de tu cuenta.',
                              );
                            }
                          }}
                          type="button"
                        >
                          Retirar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {section === 'servicios' && (
          <div className="mt-8">
            <div className="grid gap-4 rounded-3xl border border-black/10 bg-white p-5 md:grid-cols-[1fr_240px]">
              <input
                className={inputClass}
                onChange={(event) => setServiceSearch(event.target.value)}
                placeholder="Buscar servicio, proveedor o alcaldía"
                value={serviceSearch}
              />
              <select
                className={inputClass}
                onChange={(event) =>
                  setServiceCategory(event.target.value)
                }
                value={serviceCategory}
              >
                <option value="todas">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((offering) => (
                <article
                  className="rounded-3xl border border-black/10 bg-white p-6"
                  key={`${offering.providerId}-${offering.serviceId}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        {offering.category}
                      </p>
                      <h3 className="mt-2 text-xl font-bold">
                        {offering.serviceName}
                      </h3>
                      <p className="mt-1 text-[#666666]">
                        {offering.providerName}
                      </p>
                    </div>
                    <p className="text-2xl font-bold">
                      ${offering.price.toLocaleString('es-MX')}
                    </p>
                  </div>

                  <p className="mt-4 leading-7 text-[#666666]">
                    {offering.description || 'Servicio disponible para reserva.'}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-[#faf8f3] px-3 py-2">
                      {offering.durationMinutes} min
                    </span>
                    <span className="rounded-full bg-[#faf8f3] px-3 py-2">
                      {offering.alcaldia}
                    </span>
                    {offering.homeService && (
                      <span className="rounded-full bg-[#e8efe2] px-3 py-2 text-[#44513a]">
                        A domicilio
                      </span>
                    )}
                  </div>

                  <button
                    className="mt-6 w-full rounded-2xl bg-[#171717] px-5 py-3.5 font-semibold text-white hover:bg-[#a64b2a]"
                    onClick={() => setSelectedOffering(offering)}
                    type="button"
                  >
                    Reservar
                  </button>
                </article>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center text-[#666666]">
                No encontramos servicios con esos filtros.
              </div>
            )}

            {selectedOffering && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5">
                <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        Reservar servicio
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        {selectedOffering.serviceName}
                      </h2>
                      <p className="mt-1 text-[#666666]">
                        {selectedOffering.providerName}
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold"
                      onClick={() => setSelectedOffering(null)}
                      type="button"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#faf8f3] p-4">
                    <div className="flex justify-between gap-4">
                      <span>Precio</span>
                      <strong>
                        ${selectedOffering.price.toLocaleString('es-MX')}
                      </strong>
                    </div>
                    <div className="mt-2 flex justify-between gap-4">
                      <span>Duración</span>
                      <strong>{selectedOffering.durationMinutes} min</strong>
                    </div>
                  </div>

                  <form className="mt-6 grid gap-4" onSubmit={submitBooking}>
                    <Field label="Mascota">
                      <select className={inputClass} name="petId" required>
                        <option value="">Seleccionar</option>
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Fecha y hora">
                      <input
                        className={inputClass}
                        name="scheduledAt"
                        required
                        type="datetime-local"
                      />
                    </Field>

                    <Field label="Indicaciones para el proveedor">
                      <textarea
                        className={`${inputClass} min-h-24`}
                        name="notes"
                      />
                    </Field>

                    {pets.length === 0 && (
                      <p className="rounded-2xl bg-[#fff1d6] p-4 text-sm font-semibold text-[#8a5b08]">
                        Agrega una mascota antes de reservar.
                      </p>
                    )}

                    <button
                      className="rounded-2xl bg-[#a64b2a] px-6 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={pets.length === 0}
                      type="submit"
                    >
                      Confirmar solicitud
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {section === 'reservas' && (
          <div className="mt-8">
            {bookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center">
                <h2 className="text-2xl font-bold">Aún no tienes reservas</h2>
                <p className="mt-3 text-[#666666]">
                  Encuentra un servicio y agenda la atención que necesitas.
                </p>
                <button
                  className="mt-6 rounded-full bg-[#a64b2a] px-6 py-3 font-semibold text-white"
                  onClick={() => setSection('servicios')}
                  type="button"
                >
                  Ver servicios
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {bookings.map((booking) => (
                  <article
                    className="rounded-3xl border border-black/10 bg-white p-6"
                    key={booking.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                          {statusLabel(booking.status)}
                        </p>
                        <h3 className="mt-2 text-xl font-bold">
                          {booking.petName} · {booking.serviceName}
                        </h3>
                        <p className="mt-1 text-[#666666]">
                          {booking.providerName}
                        </p>
                      </div>
                      <p className="text-2xl font-bold">
                        ${booking.totalAmount.toLocaleString('es-MX')}
                      </p>
                    </div>

                    <p className="mt-5 font-semibold">
                      {new Date(booking.scheduledAt).toLocaleString(
                        'es-MX',
                      )}
                    </p>

                    {booking.notes && (
                      <p className="mt-3 leading-7 text-[#666666]">
                        {booking.notes}
                      </p>
                    )}

                    {(booking.status === 'pendiente' ||
                      booking.status === 'confirmada') && (
                      <button
                        className="mt-5 rounded-2xl border border-[#b42318]/30 px-5 py-3 text-sm font-semibold text-[#b42318]"
                        onClick={() => {
                          if (
                            window.confirm(
                              '¿Deseas cancelar esta reserva?',
                            )
                          ) {
                            void runAction(
                              () =>
                                api(
                                  `/portal/bookings/${booking.id}/cancel`,
                                  { method: 'PATCH', body: '{}' },
                                ),
                              'La reserva fue cancelada.',
                            );
                          }
                        }}
                        type="button"
                      >
                        Cancelar reserva
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {section === 'adopcion' && (
          <div className="mt-8">
            <div className="rounded-3xl bg-[#171717] p-7 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#d88a67]">
                Adopción responsable
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Conoce a quienes buscan un hogar
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-white/65">
                Envía una solicitud desde tu cuenta. La organización responsable
                dará seguimiento al proceso y validará las condiciones de
                adopción.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {adoptions.map((listing) => (
                <article
                  className="overflow-hidden rounded-3xl border border-black/10 bg-white"
                  key={listing.id}
                >
                  <div className="flex h-40 items-center justify-center bg-[#f0dfd3] text-6xl font-bold text-[#a64b2a]">
                    {listing.name.charAt(0)}
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                      {listing.species} · {listing.alcaldia}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {listing.name}
                    </h3>
                    <p className="mt-1 text-[#666666]">
                      {listing.breed || 'Mestizo'} ·{' '}
                      {monthAge(listing.ageMonths)}
                    </p>
                    <p className="mt-4 leading-7 text-[#666666]">
                      {listing.description || 'Busca una familia responsable.'}
                    </p>
                    <p className="mt-4 text-sm font-semibold">
                      {listing.shelterName}
                    </p>
                    <button
                      className="mt-5 w-full rounded-2xl bg-[#a64b2a] px-5 py-3.5 font-semibold text-white"
                      onClick={() => setSelectedAdoption(listing)}
                      type="button"
                    >
                      Solicitar adopción
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {applications.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-bold">Mis solicitudes</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {applications.map((application) => (
                    <article
                      className="rounded-3xl border border-black/10 bg-white p-5"
                      key={application.id}
                    >
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        {statusLabel(application.status)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold">
                        {application.petName}
                      </h3>
                      <p className="mt-1 text-[#666666]">
                        {application.shelterName}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {selectedAdoption && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5">
                <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        Solicitud de adopción
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        {selectedAdoption.name}
                      </h2>
                    </div>
                    <button
                      className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold"
                      onClick={() => setSelectedAdoption(null)}
                      type="button"
                    >
                      Cerrar
                    </button>
                  </div>

                  <form className="mt-6 grid gap-4" onSubmit={submitAdoption}>
                    <Field label="Tipo de vivienda">
                      <select
                        className={inputClass}
                        name="housingType"
                        required
                      >
                        <option value="">Seleccionar</option>
                        <option value="casa">Casa</option>
                        <option value="departamento">Departamento</option>
                        <option value="otro">Otro</option>
                      </select>
                    </Field>

                    <Field label="Teléfono de contacto">
                      <input
                        className={inputClass}
                        defaultValue={profile?.phone ?? ''}
                        name="phone"
                        required
                      />
                    </Field>

                    <label className="flex items-center gap-3 rounded-2xl bg-[#faf8f3] p-4 text-sm font-semibold">
                      <input name="hasOtherPets" type="checkbox" />
                      Vivo con otras mascotas
                    </label>

                    <Field label="Cuéntanos por qué deseas adoptar">
                      <textarea
                        className={`${inputClass} min-h-32`}
                        name="message"
                        required
                      />
                    </Field>

                    <button
                      className="rounded-2xl bg-[#a64b2a] px-6 py-4 font-semibold text-white"
                      type="submit"
                    >
                      Enviar solicitud
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {section === 'cuenta' && (
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <FormShell
              title="Mis datos"
              description="Mantén actualizada tu información de contacto."
            >
              <form className="grid gap-4" onSubmit={submitProfile}>
                <Field label="Nombre completo">
                  <input
                    className={inputClass}
                    defaultValue={profile?.fullName ?? ''}
                    key={`name-${profile?.fullName}`}
                    name="fullName"
                    required
                  />
                </Field>
                <Field label="Correo">
                  <input
                    className={`${inputClass} opacity-70`}
                    disabled
                    value={profile?.email ?? ''}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    className={inputClass}
                    defaultValue={profile?.phone ?? ''}
                    key={`phone-${profile?.phone}`}
                    name="phone"
                  />
                </Field>
                <button
                  className="rounded-2xl bg-[#171717] px-6 py-4 font-semibold text-white hover:bg-[#a64b2a]"
                  type="submit"
                >
                  Guardar cambios
                </button>
              </form>
            </FormShell>

            <FormShell
              title="Notificaciones"
              description="Avisos relacionados con reservas, adopciones y seguimiento."
            >
              <div className="grid gap-3">
                {notifications.length === 0 && (
                  <p className="rounded-2xl bg-[#faf8f3] p-4 text-[#666666]">
                    No tienes notificaciones.
                  </p>
                )}
                {notifications.map((notification) => (
                  <article
                    className={`rounded-2xl p-4 ${
                      notification.readAt
                        ? 'bg-[#faf8f3]'
                        : 'border border-[#a64b2a]/25 bg-[#f9eee8]'
                    }`}
                    key={notification.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#666666]">
                          {notification.body}
                        </p>
                      </div>
                      {!notification.readAt && (
                        <button
                          className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold"
                          onClick={() =>
                            void runAction(
                              () =>
                                api(
                                  `/portal/notifications/${notification.id}/read`,
                                  { method: 'PATCH', body: '{}' },
                                ),
                              'Notificación marcada como leída.',
                            )
                          }
                          type="button"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </FormShell>

            <section className="xl:col-span-2">
              <h2 className="text-2xl font-bold">Expediente de mis mascotas</h2>
              {records.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center text-[#666666]">
                  Los registros médicos agregados por proveedores aparecerán aquí.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {records.map((record) => (
                    <article
                      className="rounded-3xl border border-black/10 bg-white p-5"
                      key={record.id}
                    >
                      <p className="text-sm font-bold uppercase tracking-wider text-[#a64b2a]">
                        {record.petName} · {record.recordType}
                      </p>
                      <h3 className="mt-2 text-xl font-bold">
                        {record.title}
                      </h3>
                      <p className="mt-2 text-[#666666]">
                        {record.providerName || 'Registro personal'}
                      </p>
                      <p className="mt-4 text-sm font-semibold">
                        {record.occurredOn}
                      </p>
                      {record.nextDueOn && (
                        <p className="mt-1 text-sm text-[#666666]">
                          Próximo seguimiento: {record.nextDueOn}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
