import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Auth } from '../auth/auth.decorator';
import { Role } from '../common/role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQuery } from './dto/list-employees.query';
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
}