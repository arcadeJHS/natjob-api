import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: ['log', 'error', 'warn', 'debug', 'verbose']
    logger: ['error', 'warn']
  });

  app.enableCors({
    origin: process.env.WEBCLIENT_ORIGIN
  });
  
  await app.listen(3000);
}
bootstrap();
