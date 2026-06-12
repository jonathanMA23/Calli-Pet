'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type Species = 'perro' | 'gato' | 'otro';
type Sex = 'M' | 'F' | '';

interface Pet {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  species: Species;
  breed: string | null;
  sex: 'M' | 'F' | null;
  birthDate: string | null;
  weightKg: number | null;
  notes: string | null;
  isActive: boolean;
}

interface PetForm {
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  birthDate: string;
  weightKg: string;
  notes: string;
}

const emptyForm: PetForm = {
  name: '',
  species: 'perro',
  breed: '',
  sex: '',
  birthDate: '',
  weightKg: '',
  notes: '',
};

function speciesLabel(species: Species): string {
  const labels: Record<Species, string> = {
    perro: 'Perro',
    gato: 'Gato',
    otro: 'Otro',
  };
  return labels[species];
}

export function PetsManager() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [form, setForm] = useState<PetForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPets = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/pets`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`No se pudieron cargar las mascotas (${response.status})`);
      }

      setPets((await response.json()) as Pet[]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error desconocido al cargar',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  function updateField<K extends keyof PetForm>(
    field: K,
    value: PetForm[K],
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(pet: Pet): void {
    setEditingId(pet.id);
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? '',
      sex: pet.sex ?? '',
      birthDate: pet.birthDate ?? '',
      weightKg: pet.weightKg?.toString() ?? '',
      notes: pet.notes ?? '',
    });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm(): void {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim() || undefined,
      sex: form.sex || undefined,
      birthDate: form.birthDate || undefined,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/pets/${editingId}` : `${API_URL}/pets`,
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const responseBody = await response.json();

      if (!response.ok) {
        const detail = Array.isArray(responseBody.message)
          ? responseBody.message.join(', ')
          : responseBody.message;
        throw new Error(detail || 'No se pudo guardar la mascota');
      }

      setMessage(
        editingId
          ? 'Mascota actualizada correctamente.'
          : 'Mascota registrada correctamente.',
      );
      resetForm();
      await loadPets();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error desconocido al guardar',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePet(pet: Pet): Promise<void> {
    if (!window.confirm(`¿Deseas desactivar el registro de ${pet.name}?`)) {
      return;
    }

    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/pets/${pet.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(responseBody.message || 'No se pudo eliminar');
      }

      if (editingId === pet.id) {
        resetForm();
      }

      setMessage('Mascota desactivada correctamente.');
      await loadPets();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error desconocido al eliminar',
      );
    }
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="h-fit rounded-3xl border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#a64b2a]">
              {editingId ? 'Actualizar registro' : 'Nuevo registro'}
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {editingId ? 'Editar mascota' : 'Registrar mascota'}
            </h2>
          </div>
          {editingId && (
            <button
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold"
              onClick={resetForm}
              type="button"
            >
              Cancelar
            </button>
          )}
        </div>

        <form className="mt-7 grid gap-5" onSubmit={submitForm}>
          <label className="grid gap-2 text-sm font-semibold">
            Nombre
            <input
              className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
              onChange={(event) => updateField('name', event.target.value)}
              required
              value={form.name}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Especie
              <select
                className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
                onChange={(event) =>
                  updateField('species', event.target.value as Species)
                }
                value={form.species}
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Sexo
              <select
                className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
                onChange={(event) =>
                  updateField('sex', event.target.value as Sex)
                }
                value={form.sex}
              >
                <option value="">Sin especificar</option>
                <option value="F">Hembra</option>
                <option value="M">Macho</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Raza
            <input
              className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
              onChange={(event) => updateField('breed', event.target.value)}
              value={form.breed}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Fecha de nacimiento
              <input
                className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
                onChange={(event) =>
                  updateField('birthDate', event.target.value)
                }
                type="date"
                value={form.birthDate}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Peso en kg
              <input
                className="rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
                min="0.1"
                onChange={(event) =>
                  updateField('weightKg', event.target.value)
                }
                step="0.1"
                type="number"
                value={form.weightKg}
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Notas
            <textarea
              className="min-h-28 rounded-2xl border border-black/15 bg-[#faf8f3] px-4 py-3 font-normal outline-none focus:border-[#a64b2a]"
              onChange={(event) => updateField('notes', event.target.value)}
              value={form.notes}
            />
          </label>

          <button
            className="rounded-2xl bg-[#171717] px-6 py-4 font-semibold text-white transition hover:bg-[#a64b2a] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving
              ? 'Guardando...'
              : editingId
                ? 'Guardar cambios'
                : 'Registrar mascota'}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-2xl bg-[#eef1e9] p-4 text-sm font-semibold text-[#44513a]">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-2xl bg-[#fce8e6] p-4 text-sm font-semibold text-[#b42318]">
            {error}
          </p>
        )}
      </section>

      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-[#a64b2a]">Consulta en vivo</p>
            <h2 className="mt-1 text-3xl font-bold">Mascotas registradas</h2>
            <p className="mt-2 text-[#666666]">
              {pets.length} registro{pets.length === 1 ? '' : 's'} activo
              {pets.length === 1 ? '' : 's'} en PostgreSQL.
            </p>
          </div>
          <button
            className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold"
            onClick={() => void loadPets()}
            type="button"
          >
            Actualizar lista
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-3xl border border-black/10 bg-white p-8">
            Cargando registros...
          </div>
        ) : pets.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center text-[#666666]">
            Registra la primera mascota mediante el formulario.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {pets.map((pet) => (
              <article
                className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
                key={pet.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-[#f0dfd3] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#a64b2a]">
                      {speciesLabel(pet.species)}
                    </span>
                    <h3 className="mt-4 text-2xl font-bold">{pet.name}</h3>
                    <p className="mt-1 text-[#666666]">
                      {pet.breed || 'Raza no especificada'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-xl text-white">
                    {pet.species === 'gato'
                      ? 'G'
                      : pet.species === 'perro'
                        ? 'P'
                        : 'M'}
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-[#faf8f3] p-4 text-sm">
                  <div>
                    <dt className="text-[#777777]">Tutor</dt>
                    <dd className="mt-1 font-semibold">{pet.ownerName}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777777]">Sexo</dt>
                    <dd className="mt-1 font-semibold">
                      {pet.sex === 'F'
                        ? 'Hembra'
                        : pet.sex === 'M'
                          ? 'Macho'
                          : 'Sin especificar'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#777777]">Nacimiento</dt>
                    <dd className="mt-1 font-semibold">
                      {pet.birthDate || 'Sin especificar'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#777777]">Peso</dt>
                    <dd className="mt-1 font-semibold">
                      {pet.weightKg ? `${pet.weightKg} kg` : 'Sin especificar'}
                    </dd>
                  </div>
                </dl>

                {pet.notes && (
                  <p className="mt-4 rounded-2xl border border-black/10 p-4 text-sm leading-6 text-[#666666]">
                    {pet.notes}
                  </p>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    className="flex-1 rounded-2xl border border-black/15 px-4 py-3 text-sm font-semibold"
                    onClick={() => startEdit(pet)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className="flex-1 rounded-2xl bg-[#b42318] px-4 py-3 text-sm font-semibold text-white"
                    onClick={() => void deletePet(pet)}
                    type="button"
                  >
                    Desactivar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
