import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

export interface PetRow extends QueryResultRow {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  species: 'perro' | 'gato' | 'otro';
  breed: string | null;
  sex: 'M' | 'F' | null;
  birthDate: string | null;
  weightKg: number | null;
  notes: string | null;
  isActive: boolean;
}

interface IdRow extends QueryResultRow {
  id: string;
}

@Injectable()
export class PetsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(): Promise<PetRow[]> {
    const result = await this.database.query<PetRow>(`
      SELECT
        p.id,
        p.owner_id AS "ownerId",
        u.full_name AS "ownerName",
        p.name,
        p.species,
        p.breed,
        p.sex,
        p.birth_date::text AS "birthDate",
        p.weight_kg::float8 AS "weightKg",
        p.notes,
        p.is_active AS "isActive"
      FROM pets p
      INNER JOIN users u ON u.id = p.owner_id
      WHERE p.is_active = TRUE
      ORDER BY p.name ASC
    `);

    return result.rows;
  }

  async findOne(id: string): Promise<PetRow> {
    const result = await this.database.query<PetRow>(
      `
        SELECT
          p.id,
          p.owner_id AS "ownerId",
          u.full_name AS "ownerName",
          p.name,
          p.species,
          p.breed,
          p.sex,
          p.birth_date::text AS "birthDate",
          p.weight_kg::float8 AS "weightKg",
          p.notes,
          p.is_active AS "isActive"
        FROM pets p
        INNER JOIN users u ON u.id = p.owner_id
        WHERE p.id = $1
          AND p.is_active = TRUE
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return result.rows[0];
  }

  async create(dto: CreatePetDto): Promise<PetRow> {
    const ownerId = await this.resolveOwnerId(dto.ownerId);

    const result = await this.database.query<IdRow>(
      `
        INSERT INTO pets (
          owner_id,
          name,
          species,
          breed,
          sex,
          birth_date,
          weight_kg,
          notes,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        RETURNING id
      `,
      [
        ownerId,
        dto.name.trim(),
        dto.species,
        dto.breed?.trim() || null,
        dto.sex ?? null,
        dto.birthDate ?? null,
        dto.weightKg ?? null,
        dto.notes?.trim() || null,
      ],
    );

    return this.findOne(result.rows[0].id);
  }

  async update(id: string, dto: UpdatePetDto): Promise<PetRow> {
    await this.findOne(id);

    const fields: string[] = [];
    const values: unknown[] = [];

    const push = (column: string, value: unknown): void => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (dto.name !== undefined) push('name', dto.name.trim());
    if (dto.species !== undefined) push('species', dto.species);
    if (dto.breed !== undefined) push('breed', dto.breed.trim() || null);
    if (dto.sex !== undefined) push('sex', dto.sex);
    if (dto.birthDate !== undefined) push('birth_date', dto.birthDate || null);
    if (dto.weightKg !== undefined) push('weight_kg', dto.weightKg);
    if (dto.notes !== undefined) push('notes', dto.notes.trim() || null);

    if (fields.length === 0) {
      throw new BadRequestException('No se recibieron campos para actualizar');
    }

    values.push(id);

    await this.database.query(
      `
        UPDATE pets
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
          AND is_active = TRUE
      `,
      values,
    );

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    const result = await this.database.query<IdRow>(
      `
        UPDATE pets
        SET is_active = FALSE
        WHERE id = $1
          AND is_active = TRUE
        RETURNING id
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return {
      id: result.rows[0].id,
      deleted: true,
    };
  }

  private async resolveOwnerId(ownerId?: string): Promise<string> {
    if (ownerId) {
      const owner = await this.database.query<IdRow>(
        `
          SELECT id
          FROM users
          WHERE id = $1
            AND role = 'tutor'
            AND is_active = TRUE
        `,
        [ownerId],
      );

      if (owner.rowCount === 0) {
        throw new BadRequestException('El tutor indicado no existe');
      }

      return owner.rows[0].id;
    }

    const firstTutor = await this.database.query<IdRow>(`
      SELECT id
      FROM users
      WHERE role = 'tutor'
        AND is_active = TRUE
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (firstTutor.rowCount === 0) {
      throw new BadRequestException(
        'No existe un tutor activo para asociar la mascota',
      );
    }

    return firstTutor.rows[0].id;
  }
}
