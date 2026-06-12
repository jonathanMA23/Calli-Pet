import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  getApiHealth(): {
    status: string;
    service: string;
    version: string;
  } {
    return {
      status: 'ok',
      service: 'Calli Pet API',
      version: '1.1.0',
    };
  }

  @Get('status')
  async getSystemStatus(): Promise<Record<string, unknown>> {
    try {
      const database = await this.databaseService.getSystemStatus();

      return {
        status: 'ok',
        frontend: 'available',
        api: 'connected',
        database: 'connected',
        checkedAt: new Date().toISOString(),
        ...database,
      };
    } catch (error) {
      return {
        status: 'degraded',
        frontend: 'available',
        api: 'connected',
        database: 'disconnected',
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }
}
