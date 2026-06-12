import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 25)
  phone?: string;
}

export class CreateOwnPetDto {
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

export class UpdateOwnPetDto {
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

export class CreatePortalBookingDto {
  @IsUUID()
  petId!: string;

  @IsUUID()
  providerId!: string;

  @IsUUID()
  serviceId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

export class ApplyAdoptionDto {
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  message?: string;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  housingType?: string;

  @IsOptional()
  @IsBoolean()
  hasOtherPets?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 25)
  phone?: string;
}
