import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const tcpClient = (name: string, hostKey: string, portKey: string, defaultPort: number) =>
  ClientsModule.registerAsync([
    {
      name,
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        transport: Transport.TCP,
        options: { host: c.get<string>(hostKey) ?? '127.0.0.1', port: Number(c.get(portKey) ?? defaultPort) },
      }),
    },
  ]);