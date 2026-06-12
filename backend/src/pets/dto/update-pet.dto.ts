import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

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
  @IsNumber()
  @Min(0.1)
  @Max(300)
  weightKg?: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}
