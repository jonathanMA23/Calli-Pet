import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import {
  ApplyAdoptionDto,
  CreateOwnPetDto,
  CreatePortalBookingDto,
  UpdateOwnPetDto,
  UpdateProfileDto,
} from './dto/portal.dto';

interface IdRow extends QueryResultRow {
  id: string;
}

interface OfferingRow extends QueryResultRow {
  price: number;
  durationMinutes: number;
}

@Injectable()
export class PortalService {
  constructor(private readonly database: DatabaseService) {}

  async home(requestedUserId?: string): Promise<Record<string, unknown>> {
    const userId = await this.resolveUserId(requestedUserId);

    const profile = await this.profile(userId);
    const counts = await this.database.query<{
      pets: number;
      bookings: number;
      unreadNotifications: number;
      adoptionListings: number;
      services: number;
    }>(
      `
        SELECT
          (SELECT COUNT(*)::int
             FROM pets
            WHERE owner_id = $1
              AND is_active = TRUE) AS pets,
          (SELECT COUNT(*)::int
             FROM bookings
            WHERE user_id = $1) AS bookings,
          (SELECT COUNT(*)::int
             FROM notifications
            WHERE user_id = $1
              AND read_at IS NULL) AS "unreadNotifications",
          (SELECT COUNT(*)::int
             FROM adoption_listings
            WHERE status = 'disponible') AS "adoptionListings",
          (SELECT COUNT(*)::int
             FROM provider_services ps
             INNER JOIN providers p ON p.id = ps.provider_id
             INNER JOIN services s ON s.id = ps.service_id
            WHERE ps.is_active = TRUE
              AND p.is_active = TRUE
              AND p.verified = TRUE
              AND s.is_active = TRUE) AS services
      `,
      [userId],
    );

    const nextBooking = await this.database.query(
      `
        SELECT
          b.id,
          b.scheduled_at AS "scheduledAt",
          b.status,
          b.total_amount::float8 AS "totalAmount",
          pet.name AS "petName",
          provider.commercial_name AS "providerName",
          service.name AS "serviceName"
        FROM bookings b
        INNER JOIN pets pet ON pet.id = b.pet_id
        INNER JOIN providers provider ON provider.id = b.provider_id
        INNER JOIN services service ON service.id = b.service_id
        WHERE b.user_id = $1
          AND b.status IN ('pendiente', 'confirmada')
          AND b.scheduled_at >= CURRENT_TIMESTAMP
        ORDER BY b.scheduled_at ASC
        LIMIT 1
      `,
      [userId],
    );

    return {
      profile,
      ...counts.rows[0],
      nextBooking: nextBooking.rows[0] ?? null,
    };
  }

  async profile(requestedUserId?: string): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          phone,
          role,
          created_at AS "createdAt"
        FROM users
        WHERE id = $1
          AND is_active = TRUE
      `,
      [userId],
    );
    this.assertFound(result.rowCount, 'La cuenta no está disponible');
    return result.rows[0];
  }

  async updateProfile(
    requestedUserId: string | undefined,
    dto: UpdateProfileDto,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    const fields: string[] = [];
    const values: unknown[] = [];

    const push = (column: string, value: unknown): void => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (dto.fullName !== undefined) {
      push('full_name', dto.fullName.trim());
    }
    if (dto.phone !== undefined) {
      push('phone', dto.phone.trim() || null);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No se recibieron datos para actualizar');
    }

    values.push(userId);
    await this.database.query(
      `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
      `,
      values,
    );

    return this.profile(userId);
  }

  async pets(requestedUserId?: string): Promise<unknown[]> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        SELECT
          p.id,
          p.name,
          p.species,
          p.breed,
          p.sex,
          p.birth_date::text AS "birthDate",
          p.weight_kg::float8 AS "weightKg",
          p.notes,
          p.is_active AS "isActive"
        FROM pets p
        WHERE p.owner_id = $1
          AND p.is_active = TRUE
        ORDER BY p.name ASC
      `,
      [userId],
    );
    return result.rows;
  }

  async createPet(
    requestedUserId: string | undefined,
    dto: CreateOwnPetDto,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
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
        userId,
        dto.name.trim(),
        dto.species,
        dto.breed?.trim() || null,
        dto.sex ?? null,
        dto.birthDate ?? null,
        dto.weightKg ?? null,
        dto.notes?.trim() || null,
      ],
    );

    return this.getOwnedPet(userId, result.rows[0].id);
  }

  async updatePet(
    requestedUserId: string | undefined,
    petId: string,
    dto: UpdateOwnPetDto,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    await this.getOwnedPet(userId, petId);

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
      throw new BadRequestException('No se recibieron datos para actualizar');
    }

    values.push(petId, userId);

    await this.database.query(
      `
        UPDATE pets
        SET ${fields.join(', ')}
        WHERE id = $${values.length - 1}
          AND owner_id = $${values.length}
          AND is_active = TRUE
      `,
      values,
    );

    return this.getOwnedPet(userId, petId);
  }

  async deactivatePet(
    requestedUserId: string | undefined,
    petId: string,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    const activeBooking = await this.database.query(
      `
        SELECT 1
        FROM bookings
        WHERE user_id = $1
          AND pet_id = $2
          AND status IN ('pendiente', 'confirmada')
        LIMIT 1
      `,
      [userId, petId],
    );

    if (activeBooking.rowCount) {
      throw new BadRequestException(
        'Cancela las reservas activas antes de retirar esta mascota',
      );
    }

    const result = await this.database.query(
      `
        UPDATE pets
        SET is_active = FALSE
        WHERE id = $1
          AND owner_id = $2
          AND is_active = TRUE
        RETURNING id
      `,
      [petId, userId],
    );

    this.assertFound(result.rowCount, 'Mascota no encontrada');
    return { id: petId, active: false };
  }

  async services(): Promise<unknown[]> {
    const result = await this.database.query(
      `
        SELECT
          ps.provider_id AS "providerId",
          provider.commercial_name AS "providerName",
          provider.provider_type AS "providerType",
          provider.alcaldia,
          provider.rating_avg::float8 AS "ratingAvg",
          ps.service_id AS "serviceId",
          service.name AS "serviceName",
          service.category,
          service.description,
          ps.price::float8 AS price,
          ps.duration_minutes AS "durationMinutes",
          ps.home_service AS "homeService"
        FROM provider_services ps
        INNER JOIN providers provider ON provider.id = ps.provider_id
        INNER JOIN services service ON service.id = ps.service_id
        WHERE ps.is_active = TRUE
          AND provider.is_active = TRUE
          AND provider.verified = TRUE
          AND service.is_active = TRUE
        ORDER BY service.category, provider.rating_avg DESC, ps.price ASC
      `,
    );
    return result.rows;
  }

  async bookings(requestedUserId?: string): Promise<unknown[]> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        SELECT
          b.id,
          b.pet_id AS "petId",
          pet.name AS "petName",
          b.provider_id AS "providerId",
          provider.commercial_name AS "providerName",
          b.service_id AS "serviceId",
          service.name AS "serviceName",
          b.scheduled_at AS "scheduledAt",
          b.status,
          b.total_amount::float8 AS "totalAmount",
          b.notes,
          b.created_at AS "createdAt"
        FROM bookings b
        INNER JOIN pets pet ON pet.id = b.pet_id
        INNER JOIN providers provider ON provider.id = b.provider_id
        INNER JOIN services service ON service.id = b.service_id
        WHERE b.user_id = $1
        ORDER BY b.scheduled_at DESC
      `,
      [userId],
    );
    return result.rows;
  }

  async createBooking(
    requestedUserId: string | undefined,
    dto: CreatePortalBookingDto,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    await this.getOwnedPet(userId, dto.petId);

    const offering = await this.database.query<OfferingRow>(
      `
        SELECT
          ps.price::float8 AS price,
          ps.duration_minutes AS "durationMinutes"
        FROM provider_services ps
        INNER JOIN providers provider ON provider.id = ps.provider_id
        INNER JOIN services service ON service.id = ps.service_id
        WHERE ps.provider_id = $1
          AND ps.service_id = $2
          AND ps.is_active = TRUE
          AND provider.is_active = TRUE
          AND provider.verified = TRUE
          AND service.is_active = TRUE
      `,
      [dto.providerId, dto.serviceId],
    );

    this.assertFound(
      offering.rowCount,
      'El servicio seleccionado ya no está disponible',
    );

    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('Selecciona una fecha futura');
    }

    const price = offering.rows[0].price;
    const commission = Number((price * 0.15).toFixed(2));

    const result = await this.database.query<IdRow>(
      `
        INSERT INTO bookings (
          user_id,
          pet_id,
          provider_id,
          service_id,
          scheduled_at,
          status,
          total_amount,
          platform_commission,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, 'pendiente', $6, $7, $8)
        RETURNING id
      `,
      [
        userId,
        dto.petId,
        dto.providerId,
        dto.serviceId,
        dto.scheduledAt,
        price,
        commission,
        dto.notes?.trim() || null,
      ],
    );

    await this.database.query(
      `
        INSERT INTO notifications (
          user_id,
          notification_type,
          title,
          body
        )
        VALUES (
          $1,
          'reserva',
          'Reserva recibida',
          'Tu solicitud de reserva fue registrada y está pendiente de confirmación.'
        )
      `,
      [userId],
    );

    return this.getOwnedBooking(userId, result.rows[0].id);
  }

  async cancelBooking(
    requestedUserId: string | undefined,
    bookingId: string,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        UPDATE bookings
        SET status = 'cancelada'
        WHERE id = $1
          AND user_id = $2
          AND status IN ('pendiente', 'confirmada')
        RETURNING id, status
      `,
      [bookingId, userId],
    );

    this.assertFound(
      result.rowCount,
      'La reserva no existe o ya no puede cancelarse',
    );
    return result.rows[0];
  }

  async healthRecords(requestedUserId?: string): Promise<unknown[]> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        SELECT
          record.id,
          record.pet_id AS "petId",
          pet.name AS "petName",
          record.provider_id AS "providerId",
          provider.commercial_name AS "providerName",
          record.record_type AS "recordType",
          record.title,
          record.description,
          record.occurred_on::text AS "occurredOn",
          record.next_due_on::text AS "nextDueOn",
          record.file_url AS "fileUrl"
        FROM pet_health_records record
        INNER JOIN pets pet ON pet.id = record.pet_id
        LEFT JOIN providers provider ON provider.id = record.provider_id
        WHERE pet.owner_id = $1
          AND pet.is_active = TRUE
        ORDER BY record.occurred_on DESC
      `,
      [userId],
    );
    return result.rows;
  }

  async adoptions(): Promise<unknown[]> {
    const result = await this.database.query(
      `
        SELECT
          id,
          name,
          species,
          breed,
          sex,
          age_months AS "ageMonths",
          size,
          description,
          shelter_name AS "shelterName",
          alcaldia,
          image_url AS "imageUrl",
          status
        FROM adoption_listings
        WHERE status = 'disponible'
        ORDER BY created_at DESC
      `,
    );
    return result.rows;
  }

  async adoptionApplications(
    requestedUserId?: string,
  ): Promise<unknown[]> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        SELECT
          application.id,
          application.listing_id AS "listingId",
          listing.name AS "petName",
          listing.species,
          listing.shelter_name AS "shelterName",
          application.message,
          application.housing_type AS "housingType",
          application.has_other_pets AS "hasOtherPets",
          application.phone,
          application.status,
          application.created_at AS "createdAt"
        FROM adoption_applications application
        INNER JOIN adoption_listings listing
          ON listing.id = application.listing_id
        WHERE application.user_id = $1
        ORDER BY application.created_at DESC
      `,
      [userId],
    );
    return result.rows;
  }

  async applyAdoption(
    requestedUserId: string | undefined,
    listingId: string,
    dto: ApplyAdoptionDto,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    const listing = await this.database.query(
      `
        SELECT id
        FROM adoption_listings
        WHERE id = $1
          AND status = 'disponible'
      `,
      [listingId],
    );
    this.assertFound(listing.rowCount, 'Esta mascota ya no está disponible');

    const result = await this.database.query(
      `
        INSERT INTO adoption_applications (
          listing_id,
          user_id,
          message,
          housing_type,
          has_other_pets,
          phone,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'enviada')
        ON CONFLICT (listing_id, user_id)
        DO UPDATE SET
          message = EXCLUDED.message,
          housing_type = EXCLUDED.housing_type,
          has_other_pets = EXCLUDED.has_other_pets,
          phone = EXCLUDED.phone,
          status = 'enviada',
          created_at = CURRENT_TIMESTAMP
        RETURNING
          id,
          listing_id AS "listingId",
          user_id AS "userId",
          message,
          housing_type AS "housingType",
          has_other_pets AS "hasOtherPets",
          phone,
          status,
          created_at AS "createdAt"
      `,
      [
        listingId,
        userId,
        dto.message?.trim() || null,
        dto.housingType?.trim() || null,
        dto.hasOtherPets ?? false,
        dto.phone?.trim() || null,
      ],
    );

    await this.database.query(
      `
        INSERT INTO notifications (
          user_id,
          notification_type,
          title,
          body
        )
        VALUES (
          $1,
          'adopcion',
          'Solicitud de adopción enviada',
          'Recibimos tu solicitud y la organización responsable la revisará.'
        )
      `,
      [userId],
    );

    return result.rows[0];
  }

  async notifications(requestedUserId?: string): Promise<unknown[]> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        SELECT
          id,
          notification_type AS "notificationType",
          title,
          body,
          read_at AS "readAt",
          created_at AS "createdAt"
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId],
    );
    return result.rows;
  }

  async markNotificationRead(
    requestedUserId: string | undefined,
    notificationId: string,
  ): Promise<unknown> {
    const userId = await this.resolveUserId(requestedUserId);
    const result = await this.database.query(
      `
        UPDATE notifications
        SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
        WHERE id = $1
          AND user_id = $2
        RETURNING id, read_at AS "readAt"
      `,
      [notificationId, userId],
    );

    this.assertFound(result.rowCount, 'Notificación no encontrada');
    return result.rows[0];
  }

  private async resolveUserId(requestedUserId?: string): Promise<string> {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (requestedUserId && uuidPattern.test(requestedUserId)) {
      const requested = await this.database.query<IdRow>(
        `
          SELECT id
          FROM users
          WHERE id = $1
            AND role = 'tutor'
            AND is_active = TRUE
        `,
        [requestedUserId],
      );

      if (requested.rowCount) {
        return requested.rows[0].id;
      }
    }

    const fallback = await this.database.query<IdRow>(
      `
        SELECT id
        FROM users
        WHERE role = 'tutor'
          AND is_active = TRUE
        ORDER BY created_at ASC
        LIMIT 1
      `,
    );

    if (!fallback.rowCount) {
      throw new NotFoundException(
        'No existe una cuenta de tutor activa para iniciar la sesión local',
      );
    }

    return fallback.rows[0].id;
  }

  private async getOwnedPet(
    userId: string,
    petId: string,
  ): Promise<unknown> {
    const result = await this.database.query(
      `
        SELECT
          id,
          name,
          species,
          breed,
          sex,
          birth_date::text AS "birthDate",
          weight_kg::float8 AS "weightKg",
          notes,
          is_active AS "isActive"
        FROM pets
        WHERE id = $1
          AND owner_id = $2
          AND is_active = TRUE
      `,
      [petId, userId],
    );

    this.assertFound(result.rowCount, 'Mascota no encontrada');
    return result.rows[0];
  }

  private async getOwnedBooking(
    userId: string,
    bookingId: string,
  ): Promise<unknown> {
    const result = await this.database.query(
      `
        SELECT
          b.id,
          b.pet_id AS "petId",
          pet.name AS "petName",
          b.provider_id AS "providerId",
          provider.commercial_name AS "providerName",
          b.service_id AS "serviceId",
          service.name AS "serviceName",
          b.scheduled_at AS "scheduledAt",
          b.status,
          b.total_amount::float8 AS "totalAmount",
          b.notes
        FROM bookings b
        INNER JOIN pets pet ON pet.id = b.pet_id
        INNER JOIN providers provider ON provider.id = b.provider_id
        INNER JOIN services service ON service.id = b.service_id
        WHERE b.id = $1
          AND b.user_id = $2
      `,
      [bookingId, userId],
    );

    this.assertFound(result.rowCount, 'Reserva no encontrada');
    return result.rows[0];
  }

  private assertFound(
    rowCount: number | null,
    message: string,
  ): void {
    if (!rowCount) {
      throw new NotFoundException(message);
    }
  }
}
