import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthHandler } from '../common/healt.handler';
import { InternalGuard } from '../common/internal.guard';
import { identityEnv } from '../config/env';
import { dbOptions } from '../database/data-source';
import { Account } from '../database/entities/account.entity';
import { Employee } from '../database/entities/employee.entity';
import { AuthHandler } from './auth.handler';
import { EmployeesHandler } from './employees.handler';
import { EmployeesService } from './employees.service';
import { IdentityService } from './identity.service';
import { PasswordService } from './password.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: identityEnv }),
    TypeOrmModule.forRootAsync({ useFactory: () => dbOptions(process.env, [Employee, Account], 'IDENTITY') }),
    TypeOrmModule.forFeature([Employee, Account]),
  ],
  controllers: [AuthHandler, EmployeesHandler, HealthHandler],
  providers: [IdentityService, EmployeesService, PasswordService, InternalGuard],
})
export class EmployeeServiceModule {}