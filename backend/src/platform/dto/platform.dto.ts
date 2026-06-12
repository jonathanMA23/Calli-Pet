import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Length(0, 25)
  phone?: string;

  @IsString()
  @Length(8, 72)
  password!: string;

  @IsIn(['tutor', 'provider', 'admin'])
  role!: 'tutor' | 'provider' | 'admin';
}

export class UpdateActiveDto {
  @IsBoolean()
  active!: boolean;
}

export class CreatePetDto {
  @IsUUID()
  ownerId!: string;

  @IsString()
  @Length(1, 100)
  name!: string;

  @IsIn(['perro', 'gato', 'otro'])
  species!: 'perro' | 'gato' | 'otro';

  @IsOptional()
  @IsString()
  @Length(0, 120)
  breed?: string;

  @IsOptional()
  @IsIn(['M', 'F'])
  sex?: 'M' | 'F';

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(300)
  weightKg?: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsIn(['perro', 'gato', 'otro'])
  species?: 'perro' | 'gato' | 'otro';

  @IsOptional()
  @IsString()
  @Length(0, 120)
  breed?: string;

  @IsOptional()
  @IsIn(['M', 'F'])
  sex?: 'M' | 'F';

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(300)
  weightKg?: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

export class CreateProviderDto {
  @IsUUID()
  ownerUserId!: string;

  @IsString()
  @Length(2, 180)
  commercialName!: string;

  @IsIn([
    'veterinaria',
    'grooming',
    'paseador',
    'cuidador',
    'entrenador',
    'comercio',
    'refugio',
    'transporte',
  ])
  providerType!:
    | 'veterinaria'
    | 'grooming'
    | 'paseador'
    | 'cuidador'
    | 'entrenador'
    | 'comercio'
    | 'refugio'
    | 'transporte';

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Length(2, 120)
  alcaldia!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  commercialName?: string;

  @IsOptional()
  @IsIn([
    'veterinaria',
    'grooming',
    'paseador',
    'cuidador',
    'entrenador',
    'comercio',
    'refugio',
    'transporte',
  ])
  providerType?:
    | 'veterinaria'
    | 'grooming'
    | 'paseador'
    | 'cuidador'
    | 'entrenador'
    | 'comercio'
    | 'refugio'
    | 'transporte';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  alcaldia?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

export class CreateServiceDto {
  @IsString()
  @Length(2, 140)
  name!: string;

  @IsString()
  @Length(2, 100)
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(1440)
  baseDurationMinutes!: number;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @Length(2, 140)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(1440)
  baseDurationMinutes?: number;
}

export class AssignProviderServiceDto {
  @IsUUID()
  providerId!: string;

  @IsUUID()
  serviceId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(1440)
  durationMinutes!: number;

  @IsOptional()
  @IsBoolean()
  homeService?: boolean;
}

export class CreateBookingDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  petId!: string;

  @IsUUID()
  providerId!: string;

  @IsUUID()
  serviceId!: string;

  @IsDateString()
  scheduledAt!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingStatusDto {
  @IsIn(['pendiente', 'confirmada', 'completada', 'cancelada'])
  status!: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
}

export class CreatePaymentDto {
  @IsUUID()
  bookingId!: string;

  @IsString()
  @Length(2, 80)
  paymentProvider!: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  commissionAmount!: number;

  @IsIn(['pendiente', 'pagado', 'reembolsado', 'fallido'])
  status!: 'pendiente' | 'pagado' | 'reembolsado' | 'fallido';
}

export class UpdatePaymentStatusDto {
  @IsIn(['pendiente', 'pagado', 'reembolsado', 'fallido'])
  status!: 'pendiente' | 'pagado' | 'reembolsado' | 'fallido';
}

export class CreateReviewDto {
  @IsUUID()
  bookingId!: string;

  @IsUUID()
  userId!: string;

  @IsUUID()
  providerId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateIncidentDto {
  @IsUUID()
  bookingId!: string;

  @IsUUID()
  reportedByUserId!: string;

  @IsUUID()
  providerId!: string;

  @IsIn(['baja', 'media', 'alta', 'critica'])
  severity!: 'baja' | 'media' | 'alta' | 'critica';

  @IsString()
  @Length(5, 2000)
  description!: string;
}

export class UpdateIncidentStatusDto {
  @IsString()
  @Length(2, 30)
  status!: string;
}

export class CreateHealthRecordDto {
  @IsUUID()
  petId!: string;

  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsString()
  @Length(2, 100)
  recordType!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  occurredOn!: string;

  @IsOptional()
  @IsDateString()
  nextDueOn?: string;
}

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @Length(2, 80)
  notificationType!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsString()
  @Length(2, 2000)
  body!: string;
}
