import { ClientProxy } from '@nestjs/microservices';
import type { AuthUser } from '../auth/auth.types';
import { PING } from './healt';
import { Actor, callRemote } from './rpc';

const toActor = (u: AuthUser): Actor => ({
  id: u.id,
  role: u.role,
  fullName: u.fullName,
  employeeNo: u.employeeNo,
  department: u.department,
});

export abstract class ServiceClient {
  constructor(
    private readonly client: ClientProxy,
    private readonly secret: string,
  ) {}

  ping() {
    return this.call<{ ok: true }>(PING, null);
  }

  protected call<T>(pattern: string, data: unknown, user?: AuthUser): Promise<T> {
    return callRemote<T>(this.client, pattern, { secret: this.secret, actor: user && toActor(user), data });
  }
}