import { Controller, Get } from '@nestjs/common';
import { AttendanceClient } from '../attendance/attendance.client';
import type { ServiceClient } from '../common/service.client';
import { IdentityClient } from '../identity/identity.client';

const probe = (client: ServiceClient) =>
  client.ping().then(
    () => 'up' as const,
    () => 'down' as const,
  );

@Controller('health')
export class HealthController {
  constructor(
    private readonly identity: IdentityClient,
    private readonly attendance: AttendanceClient,
  ) {}

  @Get()
  async check() {
    const [identity, attendance] = await Promise.all([probe(this.identity), probe(this.attendance)]);
    return {
      status: identity === 'up' && attendance === 'up' ? 'ok' : 'degraded',
      services: { identity, attendance },
      time: new Date().toISOString(),
    };
  }
}