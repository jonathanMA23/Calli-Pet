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
  UpdateActiveDto,
  UpdateBookingStatusDto,
  UpdateIncidentStatusDto,
  UpdatePaymentStatusDto,
  UpdatePetDto,
  UpdateProviderDto,
  UpdateServiceDto,
} from './dto/platform.dto';
import { PlatformService } from './platform.service';

@Controller()
export class PlatformController {
  constructor(private readonly platform: PlatformService) {}

  @Get('dashboard')
  dashboard(): Promise<unknown> {
    return this.platform.dashboard();
  }

  @Get('users')
  listUsers(): Promise<unknown> {
    return this.platform.listUsers();
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto): Promise<unknown> {
    return this.platform.createUser(dto);
  }

  @Patch('users/:id/active')
  setUserActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveDto,
  ): Promise<unknown> {
    return this.platform.setUserActive(id, dto.active);
  }

  @Get('pets')
  listPets(): Promise<unknown> {
    return this.platform.listPets();
  }

  @Post('pets')
  createPet(@Body() dto: CreatePetDto): Promise<unknown> {
    return this.platform.createPet(dto);
  }

  @Patch('pets/:id')
  updatePet(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePetDto,
  ): Promise<unknown> {
    return this.platform.updatePet(id, dto);
  }

  @Delete('pets/:id')
  deactivatePet(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown> {
    return this.platform.deactivatePet(id);
  }

  @Get('providers')
  listProviders(): Promise<unknown> {
    return this.platform.listProviders();
  }

  @Post('providers')
  createProvider(@Body() dto: CreateProviderDto): Promise<unknown> {
    return this.platform.createProvider(dto);
  }

  @Patch('providers/:id')
  updateProvider(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderDto,
  ): Promise<unknown> {
    return this.platform.updateProvider(id, dto);
  }

  @Delete('providers/:id')
  deactivateProvider(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown> {
    return this.platform.deactivateProvider(id);
  }

  @Get('services')
  listServices(): Promise<unknown> {
    return this.platform.listServices();
  }

  @Post('services')
  createService(@Body() dto: CreateServiceDto): Promise<unknown> {
    return this.platform.createService(dto);
  }

  @Patch('services/:id')
  updateService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<unknown> {
    return this.platform.updateService(id, dto);
  }

  @Delete('services/:id')
  deactivateService(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown> {
    return this.platform.deactivateService(id);
  }

  @Get('provider-services')
  listProviderServices(): Promise<unknown> {
    return this.platform.listProviderServices();
  }

  @Post('provider-services')
  assignProviderService(
    @Body() dto: AssignProviderServiceDto,
  ): Promise<unknown> {
    return this.platform.assignProviderService(dto);
  }

  @Get('bookings')
  listBookings(): Promise<unknown> {
    return this.platform.listBookings();
  }

  @Post('bookings')
  createBooking(@Body() dto: CreateBookingDto): Promise<unknown> {
    return this.platform.createBooking(dto);
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<unknown> {
    return this.platform.updateBookingStatus(id, dto);
  }

  @Get('payments')
  listPayments(): Promise<unknown> {
    return this.platform.listPayments();
  }

  @Post('payments')
  createPayment(@Body() dto: CreatePaymentDto): Promise<unknown> {
    return this.platform.createPayment(dto);
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<unknown> {
    return this.platform.updatePaymentStatus(id, dto);
  }

  @Get('reviews')
  listReviews(): Promise<unknown> {
    return this.platform.listReviews();
  }

  @Post('reviews')
  createReview(@Body() dto: CreateReviewDto): Promise<unknown> {
    return this.platform.createReview(dto);
  }

  @Get('incidents')
  listIncidents(): Promise<unknown> {
    return this.platform.listIncidents();
  }

  @Post('incidents')
  createIncident(@Body() dto: CreateIncidentDto): Promise<unknown> {
    return this.platform.createIncident(dto);
  }

  @Patch('incidents/:id/status')
  updateIncidentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ): Promise<unknown> {
    return this.platform.updateIncidentStatus(id, dto);
  }

  @Get('health-records')
  listHealthRecords(): Promise<unknown> {
    return this.platform.listHealthRecords();
  }

  @Post('health-records')
  createHealthRecord(
    @Body() dto: CreateHealthRecordDto,
  ): Promise<unknown> {
    return this.platform.createHealthRecord(dto);
  }

  @Get('notifications')
  listNotifications(): Promise<unknown> {
    return this.platform.listNotifications();
  }

  @Post('notifications')
  createNotification(
    @Body() dto: CreateNotificationDto,
  ): Promise<unknown> {
    return this.platform.createNotification(dto);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown> {
    return this.platform.markNotificationRead(id);
  }
}
