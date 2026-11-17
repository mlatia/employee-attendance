import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AttendanceServiceModule } from './attendance-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AttendanceServiceModule, {
    transport: Transport.TCP,
    options: { host: process.env.ATTENDANCE_HOST ?? '127.0.0.1', port: Number(process.env.ATTENDANCE_PORT ?? 3002) },
  });
  app.enableShutdownHooks();
  await app.listen();
}
void bootstrap();