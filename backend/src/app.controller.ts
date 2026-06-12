import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth(): {
    status: string;
    service: string;
    version: string;
  } {
    return {
      status: 'ok',
      service: 'Calli Pet API',
      version: '1.0.0',
    };
  }
}
