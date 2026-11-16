
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { Auth, CurrentUser } from '../auth/auth.decorator';
import type { AuthUser } from '../auth/auth.types';
import { Role } from '../common/role.enum';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQuery } from './dto/list-employees.query';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SetStatusDto } from './dto/set-status.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
@Auth(Role.HRD)
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employees.create(dto);
  }

  @Get()
  list(@Query() query: ListEmployeesQuery) {
    return this.employees.list(query);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.employees.update(id, dto, actor);
  }

  @Patch(':id/status')
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetStatusDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.employees.setStatus(id, dto.active, actor);
  }
}
