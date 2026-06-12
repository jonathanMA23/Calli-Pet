import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApplyAdoptionDto,
  CreateOwnPetDto,
  CreatePortalBookingDto,
  UpdateOwnPetDto,
  UpdateProfileDto,
} from './dto/portal.dto';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get('home')
  home(
    @Headers('x-calli-user-id') userId?: string,
  ): Promise<unknown> {
    return this.portal.home(userId);
  }

  @Get('profile')
  profile(
    @Headers('x-calli-user-id') userId?: string,
  ): Promise<unknown> {
    return this.portal.profile(userId);
  }

  @Patch('profile')
  updateProfile(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Body() dto: UpdateProfileDto,
  ): Promise<unknown> {
    return this.portal.updateProfile(userId, dto);
  }

  @Get('pets')
  pets(
    @Headers('x-calli-user-id') userId?: string,
  ): Promise<unknown> {
    return this.portal.pets(userId);
  }

  @Post('pets')
  createPet(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Body() dto: CreateOwnPetDto,
  ): Promise<unknown> {
    return this.portal.createPet(userId, dto);
  }

  @Patch('pets/:id')
  updatePet(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Param('id', ParseUUIDPipe) petId: string,
    @Body() dto: UpdateOwnPetDto,
  ): Promise<unknown> {
    return this.portal.updatePet(userId, petId, dto);
  }

  @Delete('pets/:id')
  deactivatePet(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Param('id', ParseUUIDPipe) petId: string,
  ): Promise<unknown> {
    return this.portal.deactivatePet(userId, petId);
  }

  @Get('services')
  services(): Promise<unknown> {
    return this.portal.services();
  }

  @Get('bookings')
  bookings(
    @Headers('x-calli-user-id') userId?: string,
  ): Promise<unknown> {
    return this.portal.bookings(userId);
  }

  @Post('bookings')
  createBooking(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Body() dto: CreatePortalBookingDto,
  ): Promise<unknown> {
    return this.portal.createBooking(userId, dto);
  }

  @Patch('bookings/:id/cancel')
  cancelBooking(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Param('id', ParseUUIDPipe) bookingId: string,
  ): Promise<unknown> {
    return this.portal.cancelBooking(userId, bookingId);
  }

  @Get('health-records')
  healthRecords(
    @Headers('x-calli-user-id') userId?: string,
  ): Promise<unknown> {
    return this.portal.healthRecords(userId);
  }

  @Get('adoptions')
  adoptions(): Promise<unknown> {
    return this.portal.adoptions();
  }

  @Get('adoption-applications')
  adoptionApplications(
    @Headers('x-calli-user-id') userId?: string,
  ): Promise<unknown> {
    return this.portal.adoptionApplications(userId);
  }

  @Post('adoptions/:id/apply')
  applyAdoption(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Param('id', ParseUUIDPipe) listingId: string,
    @Body() dto: ApplyAdoptionDto,
  ): Promise<unknown> {
    return this.portal.applyAdoption(userId, listingId, dto);
  }

  @Get('notifications')
  notifications(
    @Headers('x-calli-user-id') userId?: string,
  ): Promise<unknown> {
    return this.portal.notifications(userId);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(
    @Headers('x-calli-user-id') userId: string | undefined,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ): Promise<unknown> {
    return this.portal.markNotificationRead(userId, notificationId);
  }
}
