import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: ['log', 'error', 'warn', 'debug', 'verbose']
    logger: ['error', 'warn']
  });

  const origin = process.env.WEBCLIENT_ORIGIN;

  app.enableCors({ origin });
  
  await app.listen(3000);
}
bootstrap();
