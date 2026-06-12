import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { PetsModule } from './pets/pets.module';

@Module({
  imports: [DatabaseModule, PetsModule],
  controllers: [AppController],
})
export class AppModule {}
