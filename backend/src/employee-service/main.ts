import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EmployeeServiceModule } from './employee-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(EmployeeServiceModule, {
    transport: Transport.TCP,
    // hanya 127.0.0.1: port internal tidak boleh terbuka ke luar
    options: { host: process.env.IDENTITY_HOST ?? '127.0.0.1', port: Number(process.env.IDENTITY_PORT ?? 3001) },
  });
  app.enableShutdownHooks();
  await app.listen();
}
void bootstrap();