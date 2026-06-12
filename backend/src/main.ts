import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  console.log(`Calli Pet API: http://localhost:${port}/api/v1`);
}

void bootstrap();
