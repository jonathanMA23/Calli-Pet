import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService, type PetRow } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  findAll(): Promise<PetRow[]> {
    return this.petsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PetRow> {
    return this.petsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreatePetDto,
  ): Promise<PetRow> {
    return this.petsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePetDto,
  ): Promise<PetRow> {
    return this.petsService.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string; deleted: true }> {
    return this.petsService.remove(id);
  }
}
