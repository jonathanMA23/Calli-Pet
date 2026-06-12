import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { PlatformModule } from './platform/platform.module';

@Module({
  imports: [DatabaseModule, PlatformModule],
  controllers: [AppController],
})
export class AppModule {}
