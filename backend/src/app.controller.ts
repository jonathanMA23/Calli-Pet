import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  getApiHealth(): {
    status: string;
    service: string;
    version: string;
  } {
    return {
      status: 'ok',
      service: 'Calli Pet API',
      version: '2.0.0',
    };
  }

  @Get('status')
  async getSystemStatus(): Promise<Record<string, unknown>> {
    try {
      await this.database.query('SELECT 1');
      return {
        status: 'ok',
        api: 'connected',
        database: 'connected',
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'degraded',
        api: 'connected',
        database: 'disconnected',
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Database error',
      };
    }
  }
}
