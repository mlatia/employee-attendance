import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import type { AuthUser } from '../auth/auth.types';
import {
  CreateEmployeePayload,
  EmployeeView,
  IDENTITY_PATTERNS,
  IDENTITY_SERVICE,
  ListEmployeesPayload,
  UpdateEmployeePayload,
  SetStatusPayload,
  LoginPayload,
  LoginResult,
  SessionPayload,
} from '../common/identity.contract';
import type { Paginated } from '../common/pagination';
import { ServiceClient } from '../common/service.client';

@Injectable()
export class IdentityClient extends ServiceClient {
  constructor(@Inject(IDENTITY_SERVICE) client: ClientProxy, config: ConfigService) {
    super(client, config.getOrThrow<string>('INTERNAL_SECRET'));
  }

  login(data: LoginPayload) {
    return this.call<LoginResult>(IDENTITY_PATTERNS.login, data);
  }

  session(data: SessionPayload) {
    return this.call<AuthUser>(IDENTITY_PATTERNS.session, data);
  }

  revoke(user: AuthUser) {
    return this.call<{ ok: true }>(IDENTITY_PATTERNS.revoke, null, user);
  }

  createEmployee(user: AuthUser, data: CreateEmployeePayload) {
    return this.call<EmployeeView>(IDENTITY_PATTERNS.createEmployee, data, user);
  }

  listEmployees(user: AuthUser, data: ListEmployeesPayload) {
    return this.call<Paginated<EmployeeView>>(IDENTITY_PATTERNS.listEmployees, data, user);
  }
  updateEmployee(user: AuthUser, data: UpdateEmployeePayload) {
    return this.call<EmployeeView>(IDENTITY_PATTERNS.updateEmployee, data, user);
  }

  setEmployeeStatus(user: AuthUser, data: SetStatusPayload) {
    return this.call<EmployeeView>(IDENTITY_PATTERNS.setEmployeeStatus, data, user);
  }
}