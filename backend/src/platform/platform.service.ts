import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import {
  AssignProviderServiceDto,
  CreateBookingDto,
  CreateHealthRecordDto,
  CreateIncidentDto,
  CreateNotificationDto,
  CreatePaymentDto,
  CreatePetDto,
  CreateProviderDto,
  CreateReviewDto,
  CreateServiceDto,
  CreateUserDto,
  UpdateBookingStatusDto,
  UpdateIncidentStatusDto,
  UpdatePaymentStatusDto,
  UpdatePetDto,
  UpdateProviderDto,
  UpdateServiceDto,
} from './dto/platform.dto';

interface IdRow extends QueryResultRow {
  id: string;
}

@Injectable()
export class PlatformService {
  constructor(private readonly database: DatabaseService) {}

  async dashboard(): Promise<Record<string, unknown>> {
    const counts = await this.database.query<{
      users: number;
      pets: number;
      providers: number;
      services: number;
      bookings: number;
      incidents: number;
      notifications: number;
      revenue: number;
    }>(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE is_active = TRUE) AS users,
        (SELECT COUNT(*)::int FROM pets WHERE is_active = TRUE) AS pets,
        (SELECT COUNT(*)::int FROM providers WHERE is_active = TRUE) AS providers,
        (SELECT COUNT(*)::int FROM services WHERE is_active = TRUE) AS services,
        (SELECT COUNT(*)::int FROM bookings) AS bookings,
        (SELECT COUNT(*)::int FROM incidents WHERE status <> 'cerrado') AS incidents,
        (SELECT COUNT(*)::int FROM notifications WHERE read_at IS NULL) AS notifications,
        COALESCE(
          (SELECT SUM(amount)::float8 FROM payments WHERE status = 'pagado'),
          0
        ) AS revenue
    `);

    const recentBookings = await this.database.query(`
      SELECT
        b.id,
        b.scheduled_at AS "scheduledAt",
        b.status,
        b.total_amount::float8 AS "totalAmount",
        u.full_name AS "userName",
        p.name AS "petName",
        pr.commercial_name AS "providerName",
        s.name AS "serviceName"
      FROM bookings b
      INNER JOIN users u ON u.id = b.user_id
      INNER JOIN pets p ON p.id = b.pet_id
      INNER JOIN providers pr ON pr.id = b.provider_id
      INNER JOIN services s ON s.id = b.service_id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    return {
      ...counts.rows[0],
      recentBookings: recentBookings.rows,
    };
  }

  async listUsers(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        id,
        full_name AS "fullName",
        email,
        phone,
        role,
        is_active AS "isActive",
        created_at AS "createdAt"
      FROM users
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async createUser(dto: CreateUserDto): Promise<unknown> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const result = await this.database.query(
      `
        INSERT INTO users (
          full_name,
          email,
          phone,
          password_hash,
          role,
          is_active
        )
        VALUES ($1, LOWER($2), $3, $4, $5, TRUE)
        RETURNING
          id,
          full_name AS "fullName",
          email,
          phone,
          role,
          is_active AS "isActive",
          created_at AS "createdAt"
      `,
      [
        dto.fullName.trim(),
        dto.email.trim(),
        dto.phone?.trim() || null,
        passwordHash,
        dto.role,
      ],
    );
    return result.rows[0];
  }

  async setUserActive(id: string, active: boolean): Promise<unknown> {
    const result = await this.database.query(
      `
        UPDATE users
        SET is_active = $2
        WHERE id = $1
        RETURNING
          id,
          full_name AS "fullName",
          email,
          role,
          is_active AS "isActive"
      `,
      [id, active],
    );
    this.assertFound(result.rowCount, 'Usuario no encontrado');
    return result.rows[0];
  }

  async listPets(): Promise<unknown[]> {
    const result = await this.database.query(`
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

  async createPet(dto: CreatePetDto): Promise<unknown> {
    await this.assertTutor(dto.ownerId);

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
        dto.ownerId,
        dto.name.trim(),
        dto.species,
        dto.breed?.trim() || null,
        dto.sex ?? null,
        dto.birthDate ?? null,
        dto.weightKg ?? null,
        dto.notes?.trim() || null,
      ],
    );

    return this.getPet(result.rows[0].id);
  }

  async updatePet(id: string, dto: UpdatePetDto): Promise<unknown> {
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
    const result = await this.database.query(
      `
        UPDATE pets
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
          AND is_active = TRUE
      `,
      values,
    );
    this.assertFound(result.rowCount, 'Mascota no encontrada');
    return this.getPet(id);
  }

  async deactivatePet(id: string): Promise<unknown> {
    const result = await this.database.query(
      `
        UPDATE pets
        SET is_active = FALSE
        WHERE id = $1
          AND is_active = TRUE
        RETURNING id
      `,
      [id],
    );
    this.assertFound(result.rowCount, 'Mascota no encontrada');
    return { id, active: false };
  }

  async listProviders(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        p.id,
        p.owner_user_id AS "ownerUserId",
        u.full_name AS "ownerName",
        p.commercial_name AS "commercialName",
        p.provider_type AS "providerType",
        p.description,
        p.verified,
        p.rating_avg::float8 AS "ratingAvg",
        p.alcaldia,
        p.latitude::float8 AS latitude,
        p.longitude::float8 AS longitude,
        p.is_active AS "isActive"
      FROM providers p
      INNER JOIN users u ON u.id = p.owner_user_id
      WHERE p.is_active = TRUE
      ORDER BY p.commercial_name ASC
    `);
    return result.rows;
  }

  async createProvider(dto: CreateProviderDto): Promise<unknown> {
    await this.assertProviderUser(dto.ownerUserId);

    const result = await this.database.query<IdRow>(
      `
        INSERT INTO providers (
          owner_user_id,
          commercial_name,
          provider_type,
          description,
          verified,
          rating_avg,
          alcaldia,
          latitude,
          longitude,
          is_active
        )
        VALUES ($1, $2, $3, $4, FALSE, 0, $5, $6, $7, TRUE)
        RETURNING id
      `,
      [
        dto.ownerUserId,
        dto.commercialName.trim(),
        dto.providerType,
        dto.description?.trim() || null,
        dto.alcaldia.trim(),
        dto.latitude ?? null,
        dto.longitude ?? null,
      ],
    );

    return this.getProvider(result.rows[0].id);
  }

  async updateProvider(id: string, dto: UpdateProviderDto): Promise<unknown> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const push = (column: string, value: unknown): void => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (dto.commercialName !== undefined) {
      push('commercial_name', dto.commercialName.trim());
    }
    if (dto.providerType !== undefined) {
      push('provider_type', dto.providerType);
    }
    if (dto.description !== undefined) {
      push('description', dto.description.trim() || null);
    }
    if (dto.alcaldia !== undefined) {
      push('alcaldia', dto.alcaldia.trim());
    }
    if (dto.verified !== undefined) {
      push('verified', dto.verified);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No se recibieron campos para actualizar');
    }

    values.push(id);
    const result = await this.database.query(
      `
        UPDATE providers
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
          AND is_active = TRUE
      `,
      values,
    );
    this.assertFound(result.rowCount, 'Proveedor no encontrado');
    return this.getProvider(id);
  }

  async deactivateProvider(id: string): Promise<unknown> {
    const result = await this.database.query(
      `
        UPDATE providers
        SET is_active = FALSE
        WHERE id = $1
          AND is_active = TRUE
        RETURNING id
      `,
      [id],
    );
    this.assertFound(result.rowCount, 'Proveedor no encontrado');
    return { id, active: false };
  }

  async listServices(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        id,
        name,
        category,
        description,
        base_duration_minutes AS "baseDurationMinutes",
        is_active AS "isActive"
      FROM services
      WHERE is_active = TRUE
      ORDER BY category, name
    `);
    return result.rows;
  }

  async createService(dto: CreateServiceDto): Promise<unknown> {
    const result = await this.database.query(
      `
        INSERT INTO services (
          name,
          category,
          description,
          base_duration_minutes,
          is_active
        )
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING
          id,
          name,
          category,
          description,
          base_duration_minutes AS "baseDurationMinutes",
          is_active AS "isActive"
      `,
      [
        dto.name.trim(),
        dto.category.trim(),
        dto.description?.trim() || null,
        dto.baseDurationMinutes,
      ],
    );
    return result.rows[0];
  }

  async updateService(id: string, dto: UpdateServiceDto): Promise<unknown> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const push = (column: string, value: unknown): void => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (dto.name !== undefined) push('name', dto.name.trim());
    if (dto.category !== undefined) push('category', dto.category.trim());
    if (dto.description !== undefined) {
      push('description', dto.description.trim() || null);
    }
    if (dto.baseDurationMinutes !== undefined) {
      push('base_duration_minutes', dto.baseDurationMinutes);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No se recibieron campos para actualizar');
    }

    values.push(id);
    const result = await this.database.query(
      `
        UPDATE services
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
          AND is_active = TRUE
        RETURNING
          id,
          name,
          category,
          description,
          base_duration_minutes AS "baseDurationMinutes",
          is_active AS "isActive"
      `,
      values,
    );
    this.assertFound(result.rowCount, 'Servicio no encontrado');
    return result.rows[0];
  }

  async deactivateService(id: string): Promise<unknown> {
    const result = await this.database.query(
      `
        UPDATE services
        SET is_active = FALSE
        WHERE id = $1
          AND is_active = TRUE
        RETURNING id
      `,
      [id],
    );
    this.assertFound(result.rowCount, 'Servicio no encontrado');
    return { id, active: false };
  }

  async listProviderServices(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        ps.provider_id AS "providerId",
        p.commercial_name AS "providerName",
        ps.service_id AS "serviceId",
        s.name AS "serviceName",
        ps.price::float8 AS price,
        ps.duration_minutes AS "durationMinutes",
        ps.home_service AS "homeService",
        ps.is_active AS "isActive"
      FROM provider_services ps
      INNER JOIN providers p ON p.id = ps.provider_id
      INNER JOIN services s ON s.id = ps.service_id
      WHERE ps.is_active = TRUE
      ORDER BY p.commercial_name, s.name
    `);
    return result.rows;
  }

  async assignProviderService(
    dto: AssignProviderServiceDto,
  ): Promise<unknown> {
    const result = await this.database.query(
      `
        INSERT INTO provider_services (
          provider_id,
          service_id,
          price,
          duration_minutes,
          home_service,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, TRUE)
        ON CONFLICT (provider_id, service_id)
        DO UPDATE SET
          price = EXCLUDED.price,
          duration_minutes = EXCLUDED.duration_minutes,
          home_service = EXCLUDED.home_service,
          is_active = TRUE
        RETURNING
          provider_id AS "providerId",
          service_id AS "serviceId",
          price::float8 AS price,
          duration_minutes AS "durationMinutes",
          home_service AS "homeService",
          is_active AS "isActive"
      `,
      [
        dto.providerId,
        dto.serviceId,
        dto.price,
        dto.durationMinutes,
        dto.homeService ?? false,
      ],
    );
    return result.rows[0];
  }

  async listBookings(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        b.id,
        b.user_id AS "userId",
        u.full_name AS "userName",
        b.pet_id AS "petId",
        p.name AS "petName",
        b.provider_id AS "providerId",
        pr.commercial_name AS "providerName",
        b.service_id AS "serviceId",
        s.name AS "serviceName",
        b.scheduled_at AS "scheduledAt",
        b.status,
        b.total_amount::float8 AS "totalAmount",
        b.platform_commission::float8 AS "platformCommission",
        b.notes,
        b.created_at AS "createdAt"
      FROM bookings b
      INNER JOIN users u ON u.id = b.user_id
      INNER JOIN pets p ON p.id = b.pet_id
      INNER JOIN providers pr ON pr.id = b.provider_id
      INNER JOIN services s ON s.id = b.service_id
      ORDER BY b.scheduled_at DESC
    `);
    return result.rows;
  }

  async createBooking(dto: CreateBookingDto): Promise<unknown> {
    const pet = await this.database.query(
      `
        SELECT id
        FROM pets
        WHERE id = $1
          AND owner_id = $2
          AND is_active = TRUE
      `,
      [dto.petId, dto.userId],
    );
    if (pet.rowCount === 0) {
      throw new BadRequestException(
        'La mascota no pertenece al tutor seleccionado',
      );
    }

    const offering = await this.database.query(
      `
        SELECT 1
        FROM provider_services
        WHERE provider_id = $1
          AND service_id = $2
          AND is_active = TRUE
      `,
      [dto.providerId, dto.serviceId],
    );
    if (offering.rowCount === 0) {
      throw new BadRequestException(
        'El proveedor no ofrece el servicio seleccionado',
      );
    }

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
        dto.userId,
        dto.petId,
        dto.providerId,
        dto.serviceId,
        dto.scheduledAt,
        dto.totalAmount,
        Number((dto.totalAmount * 0.15).toFixed(2)),
        dto.notes?.trim() || null,
      ],
    );

    return this.getBooking(result.rows[0].id);
  }

  async updateBookingStatus(
    id: string,
    dto: UpdateBookingStatusDto,
  ): Promise<unknown> {
    const result = await this.database.query(
      `
        UPDATE bookings
        SET status = $2
        WHERE id = $1
        RETURNING id, status
      `,
      [id, dto.status],
    );
    this.assertFound(result.rowCount, 'Reserva no encontrada');
    return result.rows[0];
  }

  async listPayments(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        p.id,
        p.booking_id AS "bookingId",
        p.payment_provider AS "paymentProvider",
        p.external_reference AS "externalReference",
        p.amount::float8 AS amount,
        p.commission_amount::float8 AS "commissionAmount",
        p.status,
        p.paid_at AS "paidAt",
        b.status AS "bookingStatus",
        pet.name AS "petName"
      FROM payments p
      INNER JOIN bookings b ON b.id = p.booking_id
      INNER JOIN pets pet ON pet.id = b.pet_id
      ORDER BY COALESCE(p.paid_at, b.created_at) DESC
    `);
    return result.rows;
  }

  async createPayment(dto: CreatePaymentDto): Promise<unknown> {
    const paidAt = dto.status === 'pagado' ? new Date().toISOString() : null;
    const result = await this.database.query(
      `
        INSERT INTO payments (
          booking_id,
          payment_provider,
          external_reference,
          amount,
          commission_amount,
          status,
          paid_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (booking_id)
        DO UPDATE SET
          payment_provider = EXCLUDED.payment_provider,
          external_reference = EXCLUDED.external_reference,
          amount = EXCLUDED.amount,
          commission_amount = EXCLUDED.commission_amount,
          status = EXCLUDED.status,
          paid_at = EXCLUDED.paid_at
        RETURNING
          id,
          booking_id AS "bookingId",
          payment_provider AS "paymentProvider",
          external_reference AS "externalReference",
          amount::float8 AS amount,
          commission_amount::float8 AS "commissionAmount",
          status,
          paid_at AS "paidAt"
      `,
      [
        dto.bookingId,
        dto.paymentProvider.trim(),
        dto.externalReference?.trim() || null,
        dto.amount,
        dto.commissionAmount,
        dto.status,
        paidAt,
      ],
    );
    return result.rows[0];
  }

  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<unknown> {
    const paidAt = dto.status === 'pagado' ? new Date().toISOString() : null;
    const result = await this.database.query(
      `
        UPDATE payments
        SET status = $2,
            paid_at = $3
        WHERE id = $1
        RETURNING id, status, paid_at AS "paidAt"
      `,
      [id, dto.status, paidAt],
    );
    this.assertFound(result.rowCount, 'Pago no encontrado');
    return result.rows[0];
  }

  async listReviews(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        r.id,
        r.booking_id AS "bookingId",
        r.user_id AS "userId",
        u.full_name AS "userName",
        r.provider_id AS "providerId",
        p.commercial_name AS "providerName",
        r.rating,
        r.comment,
        r.created_at AS "createdAt"
      FROM reviews r
      INNER JOIN users u ON u.id = r.user_id
      INNER JOIN providers p ON p.id = r.provider_id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  }

  async createReview(dto: CreateReviewDto): Promise<unknown> {
    const completed = await this.database.query(
      `
        SELECT 1
        FROM bookings
        WHERE id = $1
          AND user_id = $2
          AND provider_id = $3
          AND status = 'completada'
      `,
      [dto.bookingId, dto.userId, dto.providerId],
    );
    if (completed.rowCount === 0) {
      throw new BadRequestException(
        'La evaluación requiere una reserva completada',
      );
    }

    const result = await this.database.query(
      `
        INSERT INTO reviews (
          booking_id,
          user_id,
          provider_id,
          rating,
          comment
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          booking_id AS "bookingId",
          user_id AS "userId",
          provider_id AS "providerId",
          rating,
          comment,
          created_at AS "createdAt"
      `,
      [
        dto.bookingId,
        dto.userId,
        dto.providerId,
        dto.rating,
        dto.comment?.trim() || null,
      ],
    );
    return result.rows[0];
  }

  async listIncidents(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        i.id,
        i.booking_id AS "bookingId",
        i.reported_by_user_id AS "reportedByUserId",
        u.full_name AS "reportedByName",
        i.provider_id AS "providerId",
        p.commercial_name AS "providerName",
        i.severity,
        i.status,
        i.description,
        i.resolved_at AS "resolvedAt"
      FROM incidents i
      INNER JOIN users u ON u.id = i.reported_by_user_id
      INNER JOIN providers p ON p.id = i.provider_id
      ORDER BY
        CASE i.severity
          WHEN 'critica' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          ELSE 4
        END,
        i.id DESC
    `);
    return result.rows;
  }

  async createIncident(dto: CreateIncidentDto): Promise<unknown> {
    const result = await this.database.query(
      `
        INSERT INTO incidents (
          booking_id,
          reported_by_user_id,
          provider_id,
          severity,
          status,
          description
        )
        VALUES ($1, $2, $3, $4, 'abierto', $5)
        RETURNING
          id,
          booking_id AS "bookingId",
          reported_by_user_id AS "reportedByUserId",
          provider_id AS "providerId",
          severity,
          status,
          description,
          resolved_at AS "resolvedAt"
      `,
      [
        dto.bookingId,
        dto.reportedByUserId,
        dto.providerId,
        dto.severity,
        dto.description.trim(),
      ],
    );
    return result.rows[0];
  }

  async updateIncidentStatus(
    id: string,
    dto: UpdateIncidentStatusDto,
  ): Promise<unknown> {
    const resolvedAt =
      dto.status === 'cerrado' ? new Date().toISOString() : null;
    const result = await this.database.query(
      `
        UPDATE incidents
        SET status = $2,
            resolved_at = $3
        WHERE id = $1
        RETURNING id, status, resolved_at AS "resolvedAt"
      `,
      [id, dto.status.trim(), resolvedAt],
    );
    this.assertFound(result.rowCount, 'Incidente no encontrado');
    return result.rows[0];
  }

  async listHealthRecords(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        r.id,
        r.pet_id AS "petId",
        p.name AS "petName",
        r.provider_id AS "providerId",
        pr.commercial_name AS "providerName",
        r.record_type AS "recordType",
        r.title,
        r.description,
        r.occurred_on::text AS "occurredOn",
        r.next_due_on::text AS "nextDueOn",
        r.file_url AS "fileUrl"
      FROM pet_health_records r
      INNER JOIN pets p ON p.id = r.pet_id
      LEFT JOIN providers pr ON pr.id = r.provider_id
      ORDER BY r.occurred_on DESC
    `);
    return result.rows;
  }

  async createHealthRecord(
    dto: CreateHealthRecordDto,
  ): Promise<unknown> {
    const result = await this.database.query(
      `
        INSERT INTO pet_health_records (
          pet_id,
          provider_id,
          record_type,
          title,
          description,
          occurred_on,
          next_due_on
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          id,
          pet_id AS "petId",
          provider_id AS "providerId",
          record_type AS "recordType",
          title,
          description,
          occurred_on::text AS "occurredOn",
          next_due_on::text AS "nextDueOn"
      `,
      [
        dto.petId,
        dto.providerId ?? null,
        dto.recordType.trim(),
        dto.title.trim(),
        dto.description?.trim() || null,
        dto.occurredOn,
        dto.nextDueOn ?? null,
      ],
    );
    return result.rows[0];
  }

  async listNotifications(): Promise<unknown[]> {
    const result = await this.database.query(`
      SELECT
        n.id,
        n.user_id AS "userId",
        u.full_name AS "userName",
        n.notification_type AS "notificationType",
        n.title,
        n.body,
        n.read_at AS "readAt",
        n.created_at AS "createdAt"
      FROM notifications n
      INNER JOIN users u ON u.id = n.user_id
      ORDER BY n.created_at DESC
    `);
    return result.rows;
  }

  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<unknown> {
    const result = await this.database.query(
      `
        INSERT INTO notifications (
          user_id,
          notification_type,
          title,
          body
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          user_id AS "userId",
          notification_type AS "notificationType",
          title,
          body,
          read_at AS "readAt",
          created_at AS "createdAt"
      `,
      [
        dto.userId,
        dto.notificationType.trim(),
        dto.title.trim(),
        dto.body.trim(),
      ],
    );
    return result.rows[0];
  }

  async markNotificationRead(id: string): Promise<unknown> {
    const result = await this.database.query(
      `
        UPDATE notifications
        SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
        WHERE id = $1
        RETURNING id, read_at AS "readAt"
      `,
      [id],
    );
    this.assertFound(result.rowCount, 'Notificación no encontrada');
    return result.rows[0];
  }

  private async getPet(id: string): Promise<unknown> {
    const result = await this.database.query(
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
    this.assertFound(result.rowCount, 'Mascota no encontrada');
    return result.rows[0];
  }

  private async getProvider(id: string): Promise<unknown> {
    const result = await this.database.query(
      `
        SELECT
          p.id,
          p.owner_user_id AS "ownerUserId",
          u.full_name AS "ownerName",
          p.commercial_name AS "commercialName",
          p.provider_type AS "providerType",
          p.description,
          p.verified,
          p.rating_avg::float8 AS "ratingAvg",
          p.alcaldia,
          p.latitude::float8 AS latitude,
          p.longitude::float8 AS longitude,
          p.is_active AS "isActive"
        FROM providers p
        INNER JOIN users u ON u.id = p.owner_user_id
        WHERE p.id = $1
          AND p.is_active = TRUE
      `,
      [id],
    );
    this.assertFound(result.rowCount, 'Proveedor no encontrado');
    return result.rows[0];
  }

  private async getBooking(id: string): Promise<unknown> {
    const result = await this.database.query(
      `
        SELECT
          b.id,
          b.user_id AS "userId",
          u.full_name AS "userName",
          b.pet_id AS "petId",
          p.name AS "petName",
          b.provider_id AS "providerId",
          pr.commercial_name AS "providerName",
          b.service_id AS "serviceId",
          s.name AS "serviceName",
          b.scheduled_at AS "scheduledAt",
          b.status,
          b.total_amount::float8 AS "totalAmount",
          b.platform_commission::float8 AS "platformCommission",
          b.notes,
          b.created_at AS "createdAt"
        FROM bookings b
        INNER JOIN users u ON u.id = b.user_id
        INNER JOIN pets p ON p.id = b.pet_id
        INNER JOIN providers pr ON pr.id = b.provider_id
        INNER JOIN services s ON s.id = b.service_id
        WHERE b.id = $1
      `,
      [id],
    );
    this.assertFound(result.rowCount, 'Reserva no encontrada');
    return result.rows[0];
  }

  private async assertTutor(id: string): Promise<void> {
    const result = await this.database.query(
      `
        SELECT 1
        FROM users
        WHERE id = $1
          AND role = 'tutor'
          AND is_active = TRUE
      `,
      [id],
    );
    if (result.rowCount === 0) {
      throw new BadRequestException('El tutor seleccionado no existe');
    }
  }

  private async assertProviderUser(id: string): Promise<void> {
    const result = await this.database.query(
      `
        SELECT 1
        FROM users
        WHERE id = $1
          AND role = 'provider'
          AND is_active = TRUE
      `,
      [id],
    );
    if (result.rowCount === 0) {
      throw new BadRequestException(
        'La cuenta seleccionada no corresponde a un proveedor activo',
      );
    }
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
