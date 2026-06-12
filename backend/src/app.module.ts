import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { PlatformModule } from './platform/platform.module';
import { PortalModule } from './portal/portal.module';

@Module({
  imports: [DatabaseModule, PlatformModule, PortalModule],
  controllers: [AppController],
})
export class AppModule {}
