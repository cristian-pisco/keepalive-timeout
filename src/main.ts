import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpAdapter().getInstance();
  server.keepAliveTimeout = 11000;
  server.headersTimeout = 13000;
  console.log(`server.keepAliveTimeout: ${server.keepAliveTimeout}`);
  console.log(`server.headersTimeout: ${server.headersTimeout}`);
  await app.listen(3000);
}
bootstrap();
