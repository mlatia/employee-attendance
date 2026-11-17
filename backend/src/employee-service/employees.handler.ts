import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateEmployeePayload,
  IDENTITY_PATTERNS,
  ListEmployeesPayload,
  SetStatusPayload,
  UpdateEmployeePayload,
} from '../common/identity.contract';
import { InternalGuard } from '../common/internal.guard';
import { Role } from '../common/role.enum';
import { type Envelope, requireRole } from '../common/rpc';
import { EmployeesService } from './employees.service';

@Controller()
@UseGuards(InternalGuard)
export class EmployeesHandler {
  constructor(private readonly employees: EmployeesService) {}

  // role dicek lagi di service (selain di gateway), supaya service tetap aman walau dipanggil dari tempat lain
  @MessagePattern(IDENTITY_PATTERNS.createEmployee)
  create(@Payload() { actor, data }: Envelope<CreateEmployeePayload>) {
    requireRole(actor, Role.HRD);
    return this.employees.create(data);
  }

  @MessagePattern(IDENTITY_PATTERNS.listEmployees)
  list(@Payload() { actor, data }: Envelope<ListEmployeesPayload>) {
    requireRole(actor, Role.HRD);
    return this.employees.list(data);
  }

  @MessagePattern(IDENTITY_PATTERNS.updateEmployee)
  update(@Payload() { actor, data }: Envelope<UpdateEmployeePayload>) {
    requireRole(actor, Role.HRD);
    return this.employees.update(data);
  }

  @MessagePattern(IDENTITY_PATTERNS.setEmployeeStatus)
  setStatus(@Payload() { actor, data }: Envelope<SetStatusPayload>) {
    requireRole(actor, Role.HRD);
    return this.employees.setStatus(actor.id, data);
  }
}