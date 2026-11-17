import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import type { AuthUser } from '../auth/auth.types';
import { Role } from '../common/role.enum';
import { IdentityClient } from '../identity/identity.client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQuery } from './dto/list-employees.query';
import { SetStatusDto } from './dto/set-status.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
@Auth(Role.HRD)
export class EmployeesController {
  constructor(private readonly identity: IdentityClient) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEmployeeDto) {
    return this.identity.createEmployee(user, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListEmployeesQuery) {
    return this.identity.listEmployees(user, query);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto) {
    if (!Object.values(dto).some((v) => v !== undefined)) throw new BadRequestException('Tidak ada data yang diubah');
    return this.identity.updateEmployee(user, { ...dto, id });
  }

  @Patch(':id/status')
  setStatus(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SetStatusDto) {
    return this.identity.setEmployeeStatus(user, { id, active: dto.active });
  }
}